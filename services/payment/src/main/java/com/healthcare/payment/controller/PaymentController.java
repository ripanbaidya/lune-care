package com.healthcare.payment.controller;

import com.healthcare.payment.payload.dto.success.ResponseWrapper;
import com.healthcare.payment.payload.request.InitiatePaymentRequest;
import com.healthcare.payment.payload.request.VerifyPaymentRequest;
import com.healthcare.payment.payload.response.PaymentResponse;
import com.healthcare.payment.service.PaymentService;
import com.healthcare.payment.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(
        name = "Payments",
        description = "Endpoints for initiating, verifying and retrieving payments. " +
                "Supports Razorpay and Stripe gateways."
)
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — insufficient role",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(
            summary = "Initiate payment",
            description = """
                    Initiates a payment session for a booked appointment.
                    
                    **Razorpay flow:** Returns a `razorpayOrderId` which the frontend uses to 
                    open the Razorpay checkout modal.
                    
                    **Stripe flow:** Returns a `clientSecret` which the frontend uses to call 
                    `stripe.confirmPayment()`. The `clientSecret` is only present in this response 
                    and will be null in all subsequent responses.
                    
                    After the frontend completes checkout, call `/api/payment/verify` to confirm.
                    """
    )
    @ApiResponse(responseCode = "201", description = "Payment initiated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed or appointment not in PENDING_PAYMENT status",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Appointment not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PaymentResponse>> initiatePayment(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody InitiatePaymentRequest request
    ) {
        return ResponseUtil.created(
                "Payment initiated successfully!",
                paymentService.initiatePayment(userId, request)
        );
    }

    @Operation(
            summary = "Verify payment",
            description = """
                    Verifies the payment after the frontend completes the gateway checkout.
                    
                    **Razorpay:** Provide `razorpayPaymentId`, `razorpayOrderId` and 
                    `razorpaySignature`. The service validates the HMAC-SHA256 signature 
                    before confirming.
                    
                    **Stripe:** Provide `stripePaymentIntentId`. The service fetches the 
                    PaymentIntent from Stripe and checks its status.
                    
                    On success, the appointment status is updated to CONFIRMED via an internal 
                    call to appointment-service.
                    """
    )
    @ApiResponse(responseCode = "200", description = "Payment verified successfully")
    @ApiResponse(responseCode = "400", description = "Signature mismatch or payment not completed by gateway",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Payment record or appointment not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PostMapping("/verify")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<PaymentResponse>> verifyPayment(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody VerifyPaymentRequest request
    ) {
        return ResponseUtil.ok(
                "Payment verified successfully!",
                paymentService.verifyPayment(userId, request)
        );
    }

    @Operation(
            summary = "Get payment history",
            description = "Returns paginated payment history for the authenticated patient"
    )
    @ApiResponse(responseCode = "200", description = "Payment history fetched successfully")
    @GetMapping("/history")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getHistory(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PaymentResponse> result = paymentService.getPaymentHistory(userId, page, size);
        return ResponseUtil.paginated("Payment fetched successfully", result);
    }

    @Operation(
            summary = "Get payment by appointment",
            description = "Returns payment details for a specific appointment. " +
                    "Accessible by both the patient and the doctor of that appointment."
    )
    @ApiResponse(responseCode = "200", description = "Payment fetched successfully")
    @ApiResponse(responseCode = "404", description = "No payment found for this appointment",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<PaymentResponse>> getByAppointmentId(
            @Parameter(description = "Appointment ID to fetch payment for")
            @PathVariable String appointmentId
    ) {
        return ResponseUtil.ok(
                "Payment fetched successfully!",
                paymentService.getPaymentByAppointmentId(appointmentId)
        );
    }
}