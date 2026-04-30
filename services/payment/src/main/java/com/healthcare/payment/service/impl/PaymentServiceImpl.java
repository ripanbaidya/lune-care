package com.healthcare.payment.service.impl;

import com.healthcare.payment.client.AppointmentServiceClient;
import com.healthcare.payment.entity.PaymentRecord;
import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.enums.PaymentGatewayType;
import com.healthcare.payment.enums.PaymentStatus;
import com.healthcare.payment.event.AppointmentCancelledEvent;
import com.healthcare.payment.exception.PaymentException;
import com.healthcare.payment.gateway.OrderResult;
import com.healthcare.payment.gateway.PaymentGateway;
import com.healthcare.payment.gateway.PaymentGatewayRegistry;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentGatewayRegistry gatewayRegistry;
    private final PaymentRepository paymentRepository;
    private final AppointmentServiceClient appointmentClient;

    /**
     * SAGA Step 1 — Initiate payment.
     * Idempotency contract:
     * <ul>
     *   <li>INITIATED  → return existing record (page-refresh safe)</li>
     *   <li>SUCCESS    → throw PAYMENT_ALREADY_COMPLETED</li>
     *   <li>FAILED     → throw PAYMENT_ALREADY_EXISTS (was previously a silent 500)</li>
     *   <li>REFUNDED/REFUND_FAILED → throw REFUND_NOT_APPLICABLE</li>
     * </ul>
     */
    @Override
    @Transactional
    public PaymentResponse initiatePayment(String patientId, InitiatePaymentRequest request) {
        String appointmentId = request.appointmentId();
        PaymentGatewayType gatewayType = request.gatewayType();

        log.info("Payment initiation requested — appointmentId: {}, patientId: {}, gateway: {}",
                appointmentId, patientId, gatewayType);

        // Idempotency check — handle all terminal states before creating a new record
        PaymentRecord existingRecord = paymentRepository
                .findByAppointmentId(appointmentId)
                .map(existing -> resolveExistingPayment(existing, appointmentId, patientId))
                .orElse(null);

        if (existingRecord != null) {
            // INITIATED — return existing order so frontend can continue
            return PaymentMapper.toResponse(existingRecord);
        }

        // Fetch authoritative amount — NEVER trust frontend for amount
        AppointmentDetails appointment = appointmentClient.getAppointmentDetails(appointmentId);
        log.debug("Fetched appointment details — appointmentId: {}, fees: {}",
                appointmentId, appointment.consultationFees());

        PaymentGateway gateway = gatewayRegistry.getGateway(gatewayType);
        OrderResult orderResult = gateway.createOrder(
                appointmentId, appointment.consultationFees(), "INR");

        PaymentRecord paymentRecord = buildPaymentRecord(
                appointmentId, patientId, appointment, gatewayType, orderResult);

        paymentRepository.save(paymentRecord);

        log.info("Payment initiated — appointmentId: {}, gateway: {}, gatewayOrderId: {}, amount: {}",
                appointmentId, gatewayType, orderResult.gatewayOrderId(),
                appointment.consultationFees());

        return PaymentMapper.toResponse(paymentRecord);
    }

    /**
     * SAGA Step 2 — Verify payment and confirm appointment.
     * <p>The service determines which gateway to use by reading the {@code gateway} field
     * from the existing {@link PaymentRecord} — the client does not need to re-send the
     * gateway type.<p>
     * Transaction rollback design: payment record is flushed to DB before calling
     * appointment-service. If the Feign call fails, the transaction rolls back and
     * the record reverts to INITIATED so the patient can safely retry.
     */
    @Override
    @Transactional
    public PaymentResponse verifyPayment(String patientId, VerifyPaymentRequest request) {
        String appointmentId = request.appointmentId();
        log.info("Payment verification requested — appointmentId: {}, patientId: {}",
                appointmentId, patientId);

        // Look up by appointmentId — works for both Razorpay and Stripe
        PaymentRecord paymentRecord = paymentRepository
                .findByAppointmentId(appointmentId)
                .orElseThrow(() -> {
                    log.warn("Payment record not found — appointmentId: {}", appointmentId);
                    return new PaymentException(ErrorCode.PAYMENT_NOT_FOUND,
                            "No payment record found for appointment: " + appointmentId);
                });

        // Security check — must be the same patient who initiated
        if (!paymentRecord.getPatientId().equals(patientId)) {
            log.error("SECURITY ALERT: Payment ownership mismatch — appointmentId: {}, " +
                            "requester: {}, actualOwner: {}",
                    appointmentId, patientId, paymentRecord.getPatientId());
            throw new PaymentException(ErrorCode.PAYMENT_NOT_FOUND, "Unauthorized payment access");
        }

        // Idempotency — already verified
        if (paymentRecord.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment already verified — returning existing. appointmentId: {}", appointmentId);
            return PaymentMapper.toSafeResponse(paymentRecord);
        }

        PaymentGatewayType gatewayType = paymentRecord.getGateway();
        PaymentGateway gateway = gatewayRegistry.getGateway(gatewayType);

        // Build gateway-specific verify parameters
        String gatewayOrderId;
        String gatewayPaymentId;
        String signature;

        if (gatewayType == PaymentGatewayType.RAZORPAY) {
            gatewayOrderId = request.razorpayOrderId();
            gatewayPaymentId = request.razorpayPaymentId();
            signature = request.razorpaySignature();
        } else {
            // Stripe
            // It verify retrieves the PaymentIntent directly — no signature needed
            gatewayOrderId = request.stripePaymentIntentId();
            gatewayPaymentId = null;
            signature = null;
        }

        boolean isValid = gateway.verifyPayment(gatewayOrderId, gatewayPaymentId, signature);

        if (!isValid) {
            paymentRecord.setStatus(PaymentStatus.FAILED);
            paymentRecord.setFailureReason("Payment verification failed");
            paymentRepository.save(paymentRecord);

            log.warn("Payment verification failed — appointmentId: {}, gateway: {}, orderId: {}",
                    appointmentId, gatewayType, gatewayOrderId);
            throw new PaymentException(ErrorCode.PAYMENT_VERIFICATION_FAILED);
        }

        // Update record with success state + gateway-specific confirmed payment ID
        paymentRecord.setStatus(PaymentStatus.SUCCESS);
        if (gatewayType == PaymentGatewayType.RAZORPAY) {
            paymentRecord.setRazorpayPaymentId(request.razorpayPaymentId());
        }
        // Stripe: stripePaymentIntentId was already stored during initiatePayment

        paymentRepository.saveAndFlush(paymentRecord); // flush before external Feign call

        try {
            log.info("Confirming appointment after payment — appointmentId: {}, gateway: {}",
                    appointmentId, gatewayType);

            appointmentClient.confirmPayment(new ConfirmPaymentRequest(
                    appointmentId,
                    resolveConfirmedPaymentId(paymentRecord)
            ));

            log.info("Payment workflow complete — appointmentId: {}, gateway: {}",
                    appointmentId, gatewayType);

            return PaymentMapper.toSafeResponse(paymentRecord);

        } catch (Exception e) {
            log.error("CRITICAL: Payment captured but appointment confirmation failed. " +
                            "TRANSACTION ROLLBACK TRIGGERED. Manual reconciliation required. " +
                            "appointmentId: {}, gateway: {}, error: {}",
                    appointmentId, gatewayType, e.getMessage());
            throw e; // rolls back → record reverts to INITIATED, patient can retry
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByAppointmentId(String appointmentId) {
        log.debug("Fetching payment — appointmentId: {}", appointmentId);

        return paymentRepository.findByAppointmentId(appointmentId)
                .map(PaymentMapper::toSafeResponse)
                .orElseThrow(() -> {
                    log.warn("Payment not found — appointmentId: {}", appointmentId);
                    return new PaymentException(ErrorCode.PAYMENT_NOT_FOUND);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPaymentHistory(String patientId, int page, int size) {
        log.debug("Fetching payment history — patientId: {}, page: {}, size: {}",
                patientId, page, size);
        return paymentRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId, PageRequest.of(page, size))
                .map(PaymentMapper::toSafeResponse); // safe — no clientSecret in history
    }

    /**
     * SAGA Compensation — process refund triggered by AppointmentCancelledEvent.
     * Guard conditions (skip refund if):
     * <ul>
     *   <li>refundRequired = false — appointment never confirmed, no money taken</li>
     *   <li>No payment record exists</li>
     *   <li>Status != SUCCESS — money was never captured</li>
     *   <li>Already REFUNDED — idempotency guard</li>
     * </ul>
     */
    @Override
    @Transactional
    public void processRefund(AppointmentCancelledEvent event) {
        String appointmentId = event.getAppointmentId();

        if (!event.isRefundRequired()) {
            log.debug("Refund skipped — not required. appointmentId: {}, cancelledBy: {}",
                    appointmentId, event.getCancelledBy());
            return;
        }

        log.info("Processing refund — appointmentId: {}, cancelledBy: {}",
                appointmentId, event.getCancelledBy());

        PaymentRecord paymentRecord = paymentRepository
                .findByAppointmentId(appointmentId)
                .orElse(null);

        if (paymentRecord == null) {
            log.info("Refund skipped — no payment record. appointmentId: {}", appointmentId);
            return;
        }
        if (paymentRecord.getStatus() == PaymentStatus.REFUNDED) {
            log.warn("Refund skipped — already refunded. appointmentId: {}", appointmentId);
            return;
        }
        if (paymentRecord.getStatus() != PaymentStatus.SUCCESS) {
            log.info("Refund skipped — payment not successful. appointmentId: {}, status: {}",
                    appointmentId, paymentRecord.getStatus());
            return;
        }

        PaymentGatewayType gatewayType = paymentRecord.getGateway();
        PaymentGateway gateway = gatewayRegistry.getGateway(gatewayType);

        // The "payment ID" for refund differs per gateway
        String gatewayPaymentId = resolvePaymentIdForRefund(paymentRecord);

        try {
            log.debug("Calling gateway refund — gateway: {}, paymentId: {}, amount: {}",
                    gatewayType, gatewayPaymentId, paymentRecord.getAmount());

            String refundId = gateway.refund(gatewayPaymentId, paymentRecord.getAmount());

            paymentRecord.setStatus(PaymentStatus.REFUNDED);
            storeRefundId(paymentRecord, refundId);
            paymentRepository.save(paymentRecord);

            log.info("Refund successful — appointmentId: {}, gateway: {}, refundId: {}, amount: {}",
                    appointmentId, gatewayType, refundId, paymentRecord.getAmount());

        } catch (PaymentException e) {
            paymentRecord.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRecord.setFailureReason(e.getResolvedMessage());
            paymentRepository.save(paymentRecord);
            log.error("CRITICAL: Refund failed — appointmentId: {}, gateway: {}, " +
                            "paymentId: {}, error: {}. manual_action_required=true",
                    appointmentId, gatewayType, gatewayPaymentId, e.getResolvedMessage());

        } catch (Exception e) {
            paymentRecord.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRecord.setFailureReason("Unexpected error: " + e.getMessage());
            paymentRepository.save(paymentRecord);
            log.error("CRITICAL: Unexpected refund error — appointmentId: {}, gateway: {}, " +
                            "paymentId: {}, error: {}. manual_action_required=true",
                    appointmentId, gatewayType, gatewayPaymentId, e.getMessage());
        }

        // Notify appointment-service to release the held slot
        try {
            appointmentClient.releaseSlotAfterRefund(appointmentId);
            log.info("Slot release triggered — appointmentId: {}", appointmentId);
        } catch (Exception e) {
            // Non-blocking — stale CANCELLED slot is operationally harmless
            log.error("Slot release failed after refund — appointmentId: {}, error: {}. " +
                    "Slot may need manual release.", appointmentId, e.getMessage());
        }
    }

    // helpers

    private PaymentRecord buildPaymentRecord(String appointmentId,
                                             String patientId,
                                             AppointmentDetails appointment,
                                             PaymentGatewayType gatewayType,
                                             OrderResult orderResult) {
        PaymentRecord.PaymentRecordBuilder builder = PaymentRecord.builder()
                .appointmentId(appointmentId)
                .patientId(patientId)
                .doctorId(appointment.doctorId())
                .amount(appointment.consultationFees())
                .gateway(gatewayType);

        if (gatewayType == PaymentGatewayType.RAZORPAY) {
            builder.razorpayOrderId(orderResult.gatewayOrderId());
        } else { // STRIPE
            builder.stripePaymentIntentId(orderResult.gatewayOrderId())
                    .clientSecret(orderResult.clientSecret());
        }

        return builder.build();
    }

    /**
     * Returns the payment ID that should be passed to appointment-service on confirmation.
     */
    private String resolveConfirmedPaymentId(PaymentRecord record) {
        return record.getGateway() == PaymentGatewayType.RAZORPAY
                ? record.getRazorpayPaymentId()
                : record.getStripePaymentIntentId();
    }

    /**
     * Returns the gateway payment ID to use when issuing a refund.
     */
    private String resolvePaymentIdForRefund(PaymentRecord record) {
        return record.getGateway() == PaymentGatewayType.RAZORPAY
                ? record.getRazorpayPaymentId()
                : record.getStripePaymentIntentId();
    }

    /**
     * Stores the refund ID in the gateway-specific field.
     */
    private void storeRefundId(PaymentRecord record, String refundId) {
        if (record.getGateway() == PaymentGatewayType.RAZORPAY) {
            record.setRazorpayRefundId(refundId);
        } else {
            record.setStripeRefundId(refundId);
        }
    }

    private PaymentRecord resolveExistingPayment(PaymentRecord existing,
                                                 String appointmentId,
                                                 String patientId) {
        return switch (existing.getStatus()) {
            case INITIATED -> {
                log.info("Returning existing INITIATED payment — appointmentId: {}, gateway: {}",
                        appointmentId, existing.getGateway());
                yield existing;
            }
            case SUCCESS -> {
                log.warn("Payment already completed — appointmentId: {}, patientId: {}",
                        appointmentId, patientId);
                throw new PaymentException(ErrorCode.PAYMENT_ALREADY_COMPLETED,
                        "Payment has already been completed for this appointment");
            }
            case FAILED -> {
                log.warn("Prior payment FAILED — appointmentId: {}, patientId: {}",
                        appointmentId, patientId);
                throw new PaymentException(ErrorCode.PAYMENT_ALREADY_EXISTS,
                        "A previous payment attempt failed. Please contact support or retry after session expires.");
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