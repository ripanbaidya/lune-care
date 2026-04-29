package com.healthcare.payment.controller;

import com.healthcare.payment.payload.dto.success.ResponseWrapper;
import com.healthcare.payment.payload.request.InitiatePaymentRequest;
import com.healthcare.payment.payload.request.VerifyPaymentRequest;
import com.healthcare.payment.payload.response.PaymentResponse;
import com.healthcare.payment.service.PaymentService;
import com.healthcare.payment.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Initiate — creates Razorpay order, returns orderId to frontend
    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PaymentResponse>> initiatePayment(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody InitiatePaymentRequest request) {

        return ResponseUtil.created(
                "Payment initiated successfully!",
                paymentService.initiatePayment(userId, request));
    }

    // ── Verify — validates signature and confirms appointment ─────────────────
    @PostMapping("/verify")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PaymentResponse>> verifyPayment(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody VerifyPaymentRequest request) {

        return ResponseUtil.ok(
                "Payment verified successfully!",
                paymentService.verifyPayment(userId, request)
        );
    }

    // History — patient views all their payments
    @GetMapping("/history")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getHistory(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<PaymentResponse> result = paymentService.getPaymentHistory(userId, page, size);

        return ResponseUtil.paginated(
                "Payment fetched successfully", result
        );
    }

    // TODO: Create endpoints for Doctor to fetch all payments he received

    // Get by appointmentId
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<PaymentResponse>> getByAppointmentId(
            @PathVariable String appointmentId) {
        return ResponseUtil.ok(
                "Payment fetched successfully!",
                paymentService.getPaymentByAppointmentId(appointmentId)
        );
    }
}