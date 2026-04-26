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

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentGateway paymentGateway;
    private final PaymentRepository paymentRepository;
    private final AppointmentServiceClient appointmentClient;

    // Initiate payment — creates Razorpay order
    @Override
    @Transactional
    public PaymentResponse initiatePayment(String patientId, InitiatePaymentRequest request) {

        // Idempotency check — prevent double payment for same appointment
        if (paymentRepository.existsByAppointmentId(request.appointmentId())) {
            PaymentRecord existing = paymentRepository
                    .findByAppointmentId(request.appointmentId()).get();

            // If already initiated (not yet verified), return the existing order
            // so frontend can reuse it — handles page refresh scenario
            if (existing.getStatus() == PaymentStatus.INITIATED) {
                log.info("Returning existing payment order for appointmentId: {}", request.appointmentId());
                return PaymentMapper.toResponse(existing);
            }

            // If already SUCCESS, do not allow re-payment
            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                throw new PaymentException(ErrorCode.PAYMENT_ALREADY_COMPLETED,
                        "Payment already completed for this appointment");
            }
        }

        // Fetch appointment details from appointment-service
        // Amount comes from DB, NOT from the frontend request — prevents tampering
        AppointmentDetails appointment = appointmentClient.getAppointmentDetails(request.appointmentId());

        // Create Razorpay order
        String razorpayOrderId = paymentGateway.createOrder(
                request.appointmentId(),
                appointment.consultationFees(),
                "INR"
        );

        // Save payment record
        PaymentRecord paymentRecord = PaymentRecord.builder()
                .appointmentId(request.appointmentId())
                .patientId(patientId)
                .doctorId(appointment.doctorId())
                .amount(appointment.consultationFees())
                .razorpayOrderId(razorpayOrderId)
                .build();

        paymentRepository.save(paymentRecord);

        log.info("Payment initiated — appointmentId: {}, orderId: {}",
                request.appointmentId(), razorpayOrderId);

        return PaymentMapper.toResponse(paymentRecord);
    }

    // Verify payment — validates signature and confirms appointment
    @Override
    @Transactional
    public PaymentResponse verifyPayment(String patientId, VerifyPaymentRequest request) {

        PaymentRecord paymentRecord = paymentRepository
                .findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new PaymentException(ErrorCode.PAYMENT_NOT_FOUND,
                        "Payment record not found for order: " + request.razorpayOrderId()));

        // Verify the patient making this call is the one who initiated payment
        if (!paymentRecord.getPatientId().equals(patientId)) {
            throw new PaymentException(ErrorCode.PAYMENT_NOT_FOUND, "Payment not found for this patient");
        }

        if (paymentRecord.getStatus() == PaymentStatus.SUCCESS) {
            throw new PaymentException(ErrorCode.PAYMENT_ALREADY_COMPLETED);
        }

        // Verify Razorpay signature — HMAC-SHA256 check
        boolean isValid = paymentGateway.verifyPayment(
                request.razorpayOrderId(),
                request.razorpayPaymentId(),
                request.razorpaySignature()
        );

        if (!isValid) {
            // Mark payment as failed
            paymentRecord.setStatus(PaymentStatus.FAILED);
            paymentRecord.setFailureReason("Signature verification failed");
            paymentRepository.save(paymentRecord);

            log.warn("Payment verification failed — orderId: {}", request.razorpayOrderId());
            throw new PaymentException(ErrorCode.PAYMENT_VERIFICATION_FAILED);
        }

        // Update payment record to SUCCESS
        paymentRecord.setStatus(PaymentStatus.SUCCESS);
        paymentRecord.setRazorpayPaymentId(request.razorpayPaymentId());
        paymentRepository.save(paymentRecord);

        // Notify appointment-service to confirm the appointment
        try {
            appointmentClient.confirmPayment(new ConfirmPaymentRequest(
                    paymentRecord.getAppointmentId(),
                    request.razorpayPaymentId()
            ));
        } catch (Exception e) {
            // Critical failure — payment succeeded but appointment not confirmed.
            // Log with high priority for manual intervention.
            // In production this would trigger an alert.
            log.error("CRITICAL: Payment succeeded but appointment confirmation failed. " +
                            "appointmentId: {}, paymentId: {}. Manual intervention required.",
                    paymentRecord.getAppointmentId(), request.razorpayPaymentId(), e);
        }

        log.info("Payment verified — appointmentId: {}, paymentId: {}",
                paymentRecord.getAppointmentId(), request.razorpayPaymentId());

        return PaymentMapper.toResponse(paymentRecord);
    }

    // Get payment by appointmentId
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByAppointmentId(String appointmentId) {
        return PaymentMapper.toResponse(paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new PaymentException(ErrorCode.PAYMENT_NOT_FOUND)));
    }

    // Patient payment history
    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPaymentHistory(String patientId, int page, int size) {
        return paymentRepository.findByPatientIdOrderByCreatedAtDesc(
                        patientId, PageRequest.of(page, size))
                .map(PaymentMapper::toResponse);
    }

    // Process refund — triggered by AppointmentCancelledEvent
    @Override
    @Transactional
    public void processRefund(AppointmentCancelledEvent event) {

        // Only process refund if payment was successfully completed
        if (!event.isRefundRequired()) {
            log.debug("Refund not required for appointmentId: {}", event.getAppointmentId());
            return;
        }

        PaymentRecord paymentRecord = paymentRepository
                .findByAppointmentId(event.getAppointmentId())
                .orElse(null);

        if (paymentRecord == null) {
            // Payment record may not exist if appointment was cancelled before payment
            log.info("No payment record found for appointmentId: {} — skipping refund",
                    event.getAppointmentId());
            return;
        }

        if (paymentRecord.getStatus() != PaymentStatus.SUCCESS) {
            log.info("Payment not in SUCCESS state for appointmentId: {} — skipping refund",
                    event.getAppointmentId());
            return;
        }

        try {
            // Initiate full refund via Razorpay
            String refundId = paymentGateway.refund(
                    paymentRecord.getRazorpayPaymentId(),
                    paymentRecord.getAmount()
            );

            paymentRecord.setStatus(PaymentStatus.REFUNDED);
            paymentRecord.setRazorpayRefundId(refundId);
            paymentRepository.save(paymentRecord);

            log.info("Refund processed — appointmentId: {}, refundId: {}",
                    event.getAppointmentId(), refundId);

        } catch (PaymentException e) {
            // Mark as refund failed — requires manual intervention in production
            paymentRecord.setStatus(PaymentStatus.REFUND_FAILED);
            paymentRecord.setFailureReason(e.getResolvedMessage());
            paymentRepository.save(paymentRecord);

            log.error("Refund failed for appointmentId: {}. Error: {}",
                    event.getAppointmentId(), e.getResolvedMessage());
        }
    }

}