package com.healthcare.payment.client;

import com.healthcare.payment.payload.dto.appointment.AppointmentDetails;
import com.healthcare.payment.payload.dto.appointment.ConfirmPaymentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "APPOINTMENT",
        path = "/api/internal/appointment"
)
public interface AppointmentServiceClient {

    // Fetch appointment details to get consultationFees — never trust frontend for amount
    @GetMapping("/{appointmentId}")
    AppointmentDetails getAppointmentDetails(@PathVariable String appointmentId);

    // Confirm appointment after payment is verified
    @PostMapping("/confirm-payment")
    void confirmPayment(@RequestBody ConfirmPaymentRequest request);

    @PostMapping("/{appointmentId}/release-slot")
    void releaseSlotAfterRefund(@PathVariable String appointmentId);
}