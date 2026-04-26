package com.healthcare.payment.service.impl;

import com.healthcare.payment.client.AppointmentServiceClient;
import com.healthcare.payment.entity.PaymentRecord;
import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.enums.PaymentStatus;
import com.healthcare.payment.event.AppointmentCancelledEvent;
import com.healthcare.payment.exception.PaymentException;
import com.healthcare.payment.gateway.PaymentGateway;
import com.healthcare.payment.mapper.PaymentMapper;
import com.healthcare.payment.payload.dto.appointment.AppointmentDetails;
import com.healthcare.payment.payload.dto.appointment.ConfirmPaymentRequest;
import com.healthcare.payment.payload.request.InitiatePaymentRequest;
import com.healthcare.payment.payload.request.VerifyPaymentRequest;
import com.healthcare.payment.payload.response.PaymentResponse;
import com.healthcare.payment.repository.PaymentRepository;
import com.healthcare.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core payment orchestration — initiates, verifies, and refunds payments.
 * <h3>SAGA flow</h3>
 * <ol>
 *   <li><b>Step 1 — initiatePayment:</b> Creates a Razorpay order after fetching the
 *       authoritative amount from appointment-service (never trust the frontend).</li>
 *   <li><b>Step 2 — verifyPayment:</b> Validates the Razorpay HMAC signature, marks the
 *       payment {@code SUCCESS}, then calls appointment-service to confirm the appointment.
 *       If the confirmation call fails, the payment record is rolled back so the patient
 *       can retry without being double-charged.</li>
 *   <li><b>Compensation — processRefund:</b> Triggered asynchronously by an
 *       {@code AppointmentCancelledEvent} from RabbitMQ.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentGateway paymentGateway;
    private final PaymentRepository paymentRepository;
    private final AppointmentServiceClient appointmentClient;

    /**
     * Creates a Razorpay order for the given appointment.
     * <p><b>Idempotency:</b>
     * <ul>
     *   <li>{@code INITIATED} — returns the existing order so the frontend can reuse it
     *       (handles page-refresh without creating a duplicate Razorpay order).</li>
     *   <li>{@code SUCCESS} — throws {@code PAYMENT_ALREADY_COMPLETED}.</li>
     *   <li>{@code FAILED} — throws {@code PAYMENT_ALREADY_EXISTS} with a clear message
     *       directing the patient to contact support or retry via a separate flow.
     *       Previously this case fell through silently and crashed with a DB unique-constraint
     *       violation (500 error).</li>
     *   <li>{@code REFUNDED / REFUND_FAILED} — throws {@code REFUND_NOT_APPLICABLE} since
     *       these states mean the appointment was already canceled.</li>
     * </ul>
     */
    @Override
    @Transactional
    public PaymentResponse initiatePayment(String patientId, InitiatePaymentRequest request) {
        String appointmentId = request.appointmentId();

        log.info("Payment initiation requested — appointmentId: {}, patientId: {}",
                appointmentId, patientId);

        // Idempotency check: Find an existing record and handle all terminal states before proceeding.
        // Returns early (non-null) only for INITIATED — all other states throw.
        PaymentRecord existingRecord = paymentRepository
                .findByAppointmentId(appointmentId)
                .map(existing -> resolveExistingPayment(existing, appointmentId, patientId))
                .orElse(null);

        if (existingRecord != null) {
            // INITIATED state — safe to return existing Razorpay order to the frontend.
            return PaymentMapper.toResponse(existingRecord);
        }

        // TODO: Make the feign call inside try-catch
        // Fetch authoritative amount from appointment-service
        // Amount comes from DB via internal API — never from the frontend request.
        AppointmentDetails appointment = appointmentClient.getAppointmentDetails(appointmentId);
        log.debug("Fetched appointment details — appointmentId: {}, fees: {}",
                appointmentId, appointment.consultationFees());

        // Create Razorpay order
        String razorpayOrderId = paymentGateway.createOrder(appointmentId, appointment.consultationFees(), "INR");

        // Persist payment record
        PaymentRecord paymentRecord = PaymentRecord.builder()
                .appointmentId(appointmentId)
                .patientId(patientId)
                .doctorId(appointment.doctorId())
                .amount(appointment.consultationFees())
                .razorpayOrderId(razorpayOrderId)
                .build();

        paymentRepository.save(paymentRecord);

        log.info("Payment initiated — appointmentId: {}, orderId: {}, amount: {}",
                appointmentId, razorpayOrderId, appointment.consultationFees());

        return PaymentMapper.toResponse(paymentRecord);
    }

    /**
     * Verifies the Razorpay signature and, on success, confirms the appointment.
     * <p><b>Transaction design:</b>
     * The payment record is saved as {@code SUCCESS} and the appointment-service confirmation
     * call is performed within the same transaction.
     * If the Feign call to {@code confirmPayment} throws, the transaction rolls back and the
     * payment record reverts to {@code INITIATED} so the patient can retry safely without being
     * double-charged.
     */
    @Override
    @Transactional
    public PaymentResponse verifyPayment(String patientId, VerifyPaymentRequest request) {
        String orderId = request.razorpayOrderId();
        String paymentId = request.razorpayPaymentId();

        log.info("Starting payment verification. orderId={}, patientId={}, razorpayPaymentId={}",
                orderId, patientId, paymentId);

        PaymentRecord paymentRecord = paymentRepository
                .findByRazorpayOrderId(orderId)
                .orElseThrow(() -> {
                    log.warn("Payment record lookup failed. orderId={} not found in database.", orderId);
                    return new PaymentException(ErrorCode.PAYMENT_NOT_FOUND, "Order not found: " + orderId);
                });

        // Security Check
        if (!paymentRecord.getPatientId().equals(patientId)) {
            log.error("SECURITY ALERT: Payment ownership mismatch. orderId={}, requester={}, actualOwner={}",
                    orderId, patientId, paymentRecord.getPatientId());
            throw new PaymentException(ErrorCode.PAYMENT_NOT_FOUND, "Unauthorized payment access");
        }

        // Idempotency Check
        if (paymentRecord.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment already processed successfully. skipping. appointmentId={}", paymentRecord.getAppointmentId());
            return PaymentMapper.toResponse(paymentRecord); // Better to return success than throw an exception for idempotency
        }

        // Gateway Verification
        boolean isValid = paymentGateway.verifyPayment(orderId, paymentId, request.razorpaySignature());

        if (!isValid) {
            paymentRecord.setStatus(PaymentStatus.FAILED);
            paymentRecord.setFailureReason("Signature verification failed");
            paymentRepository.save(paymentRecord);

            log.warn("Payment signature invalid. orderId={}, paymentId={}, appointmentId={}",
                    orderId, paymentId, paymentRecord.getAppointmentId());
            throw new PaymentException(ErrorCode.PAYMENT_VERIFICATION_FAILED);
        }

        // Update Local State
        paymentRecord.setStatus(PaymentStatus.SUCCESS);
        paymentRecord.setRazorpayPaymentId(paymentId);
        paymentRepository.saveAndFlush(paymentRecord); // Flush ensures DB state is written before external API call

        try {
            // Downstream Sync
            log.info("Synchronizing appointment state. appointmentId={}, amount={}",
                    paymentRecord.getAppointmentId(), paymentRecord.getAmount());

            appointmentClient.confirmPayment(new ConfirmPaymentRequest(
                    paymentRecord.getAppointmentId(),
                    paymentId
            ));

            log.info("Payment workflow finalized. appointmentId={}, razorpayPaymentId={}",
                    paymentRecord.getAppointmentId(), paymentId);

            return PaymentMapper.toResponse(paymentRecord);

        } catch (Exception e) {
            log.error("CRITICAL: Payment captured but Appointment confirmation failed. " +
                            "TRANSACTION ROLLBACK TRIGGERED. Manual reconciliation required. " +
                            "orderId={}, paymentId={}, appointmentId={}, error={}",
                    orderId, paymentId, paymentRecord.getAppointmentId(), e.getMessage());

            throw e; // Transaction rolls back, status returns to INITIATED
        }
    }

    /**
     * Get payment by appointment ID
     *
     * @param appointmentId the ID of the appointment for which payment is to be fetched
     * @return the payment details
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByAppointmentId(String appointmentId) {
        log.debug("Fetching payment details. appointmentId={}", appointmentId);

        return paymentRepository.findByAppointmentId(appointmentId)
                .map(PaymentMapper::toResponse)
                .orElseThrow(() -> {
                    log.warn("Payment not found for appointmentId: {}", appointmentId);
                    return new PaymentException(ErrorCode.PAYMENT_NOT_FOUND);
                });
    }

    /**
     * Get payment history for a patient
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPaymentHistory(String patientId, int page, int size) {
        log.debug("Fetching payment history — patientId: {}, page: {}, size: {}",
                patientId, page, size);
        return paymentRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId, PageRequest.of(page, size))
                .map(PaymentMapper::toResponse);
    }

    // Process refund (SAGA compensation)

    /**
     * Processes a refund triggered by an {@code AppointmentCancelledEvent}.
     * <p><b>Guard conditions (do not refund if):</b>
     * <ul>
     *   <li>{@code refundRequired = false} — appointment was never confirmed (no money taken)</li>
     *   <li>No payment record exists — the appointment was canceled before payment was initiated</li>
     *   <li>Payment status is not {@code SUCCESS} — handles the race condition where
     *       the payment gateway captured money but our record hasn't been updated yet
     *       (timeout scheduler fires before verify completes)</li>
     * </ul>
     */
    @Override
    @Transactional
    public void processRefund(AppointmentCancelledEvent event) {
        String appointmentId = event.getAppointmentId();

        if (!event.isRefundRequired()) {
            log.debug("Refund skipped: Not required for this cancellation type. appointmentId={}, cancelledBy={}",
                    appointmentId, event.getCancelledBy());
            return;
        }

        log.info("Initiating refund process. appointmentId={}, cancelledBy={}", appointmentId, event.getCancelledBy());

        PaymentRecord paymentRecord = paymentRepository
                .findByAppointmentId(appointmentId)
                .orElse(null);

        // State Validation
        if (paymentRecord == null) {
            log.info("Refund skipped: No payment record associated with appointmentId={}", appointmentId);
            return;
        }

        if (paymentRecord.getStatus() == PaymentStatus.REFUNDED) {
            log.warn("Refund skipped: Already processed for appointmentId={}", appointmentId);
            return;
        }

        if (paymentRecord.getStatus() != PaymentStatus.SUCCESS) {
            log.info("Refund skipped: Payment was never successful. appointmentId={}, currentStatus={}",
                    appointmentId, paymentRecord.getStatus());
            return;
        }

        try {
            // External API Trace
            log.debug("Calling payment gateway for refund. razorpayPaymentId={}, amount={}",
                    paymentRecord.getRazorpayPaymentId(), paymentRecord.getAmount());

            String refundId = paymentGateway.refund(
                    paymentRecord.getRazorpayPaymentId(),
                    paymentRecord.getAmount()
            );

            // State Transition
            paymentRecord.setStatus(PaymentStatus.REFUNDED);
            paymentRecord.setRazorpayRefundId(refundId);
            paymentRepository.save(paymentRecord);

            log.info("Refund successfully processed. appointmentId={}, refundId={}, amount={}",
                    appointmentId, refundId, paymentRecord.getAmount());

        } catch (PaymentException e) {
            paymentRecord.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRecord.setFailureReason(e.getResolvedMessage());
            paymentRepository.save(paymentRecord);

            log.error("CRITICAL: Refund failed for appointmentId={}. manual_action_required=true. " +
                            "razorpayPaymentId={}, error={}",
                    appointmentId, paymentRecord.getRazorpayPaymentId(), e.getResolvedMessage());
        }
    }

    // Private helpers

    /**
     * Handles an existing {@link PaymentRecord} for the same appointment during
     * {@code initiatePayment} idempotency checks.
     * <p>Returns the existing record if status is {@code INITIATED} (safe to reuse).
     * Throws a {@link PaymentException} for all other terminal states so callers
     * receive a clean business error rather than a DB unique-constraint crash.
     *
     * @param existing      the existing payment record
     * @param appointmentId used for log context only
     * @param patientId     used for log context only
     * @return the existing record if status is INITIATED; never returns for other states
     * @throws PaymentException for SUCCESS, FAILED, REFUNDED, REFUND_FAILED states
     */
    private PaymentRecord resolveExistingPayment(PaymentRecord existing,
                                                 String appointmentId,
                                                 String patientId) {
        return switch (existing.getStatus()) {

            case INITIATED -> {
                // Safe to reuse — frontend can present the same Razorpay order (page-refresh).
                log.info("Returning existing INITIATED payment — appointmentId: {}, orderId: {}",
                        appointmentId, existing.getRazorpayOrderId());
                yield existing;
            }

            case SUCCESS -> {
                log.warn("Payment already completed — appointmentId: {}, patientId: {}",
                        appointmentId, patientId);
                throw new PaymentException(ErrorCode.PAYMENT_ALREADY_COMPLETED,
                        "Payment has already been completed for this appointment");
            }

            case FAILED -> {
                // BUG FIX: Previously fell through silently, hitting the DB unique
                // constraint on re-save and returning a 500. Now returns a clean 409.
                log.warn("Prior payment attempt FAILED — appointmentId: {}, patientId: {}",
                        appointmentId, patientId);
                throw new PaymentException(ErrorCode.PAYMENT_ALREADY_EXISTS,
                        "A previous payment attempt for this appointment has failed. " +
                                "Please contact support or retry after the current session expires.");
            }

            case REFUNDED, REFUND_FAILED -> {
                log.warn("Appointment already cancelled — appointmentId: {}, status: {}",
                        appointmentId, existing.getStatus());
                throw new PaymentException(ErrorCode.REFUND_NOT_APPLICABLE,
                        "This appointment has been cancelled. No new payment can be initiated.");
            }
        };
    }
}