package com.healthcare.appointment.controller;

import com.healthcare.appointment.payload.request.ConfirmPaymentRequest;
import com.healthcare.appointment.payload.request.GenerateSlotsRequest;
import com.healthcare.appointment.payload.response.AppointmentResponse;
import com.healthcare.appointment.service.AppointmentService;
import com.healthcare.appointment.service.SlotGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/internal/appointment")
@RequiredArgsConstructor
public class InternalAppointmentController {

    private final AppointmentService appointmentService;
    private final SlotGenerationService slotGenerationService;

    /**
     * Generate slots for a clinic
     * This API is called by {@code doctor-service} after doctor set or update schedule
     * for a clinic.
     */
    @PostMapping("/slots/generate")
    public ResponseEntity<Map<String, Object>> generateSlots(
            @Valid @RequestBody GenerateSlotsRequest request
    ) {
        int slotsCreated = slotGenerationService.generateSlots(request);

        return ResponseEntity.ok(Map.of(
                "message", "Slots generated successfully",
                "slotsCreated", slotsCreated
        ));
    }

    @DeleteMapping("/slots/cancel-available/{clinicId}/{dayOfWeek}")
    public ResponseEntity<Map<String, Object>> cancelAvailableSlotsForDay(
            @PathVariable String clinicId,
            @PathVariable String dayOfWeek
    ) {
        DayOfWeek day;
        try {
            day = DayOfWeek.valueOf(dayOfWeek.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid dayOfWeek received — value: {}", dayOfWeek);
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid day of week: " + dayOfWeek,
                    "validValues", "MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY"
            ));
        }

        int cancelled = slotGenerationService.cancelAvailableSlotsForDay(clinicId, day);

        log.info("Slot cancellation complete via internal API — clinicId: {}, day: {}, cancelled: {}",
                clinicId, dayOfWeek, cancelled);

        return ResponseEntity.ok(Map.of(
                "message", "Available slots cancelled successfully",
                "clinicId", clinicId,
                "dayOfWeek", dayOfWeek,
                "cancelledCount", cancelled
        ));
    }

    // Called by payment-service after payment is confirmed
    @PostMapping("/confirm-payment")
    public ResponseEntity<AppointmentResponse> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequest request
    ) {
        return ResponseEntity.ok(appointmentService.confirmPayment(request));
    }

    /**
     * Get appointment details for a specific appointment
     *
     * @param appointmentId the id of the appointment for which details are to be fetched
     * @return appointment details
     */
    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> getAppointmentDetails(
            @PathVariable String appointmentId) {

        return ResponseEntity.ok(appointmentService.getAppointment(appointmentId));
    }

    /**
     * Called by payment-service after a refund is confirmed.
     * Releases the held slot back to AVAILABLE.
     */
    @PostMapping("/{appointmentId}/release-slot")
    public ResponseEntity<Void> releaseSlotAfterRefund(@PathVariable String appointmentId) {
        appointmentService.releaseSlotAfterRefund(appointmentId);
        return ResponseEntity.ok().build();
    }
}
