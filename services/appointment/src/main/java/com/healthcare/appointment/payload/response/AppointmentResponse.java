package com.healthcare.appointment.payload.response;

import com.healthcare.appointment.enums.AppointmentStatus;
import com.healthcare.appointment.enums.CancelledBy;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Appointment details returned after booking, retrieval or status change")
@Builder
public record AppointmentResponse(

        @Schema(description = "Appointment ID")
        String id,

        @Schema(description = "Patient's user ID")
        String patientId,

        @Schema(description = "Doctor's profile ID")
        String doctorId,

        @Schema(description = "Clinic ID where the appointment is scheduled")
        String clinicId,

        @Schema(description = "Slot ID that was booked")
        String slotId,

        @Schema(description = "Date of the appointment", example = "2025-06-15")
        LocalDate appointmentDate,

        @Schema(description = "Appointment start time", example = "10:00")
        LocalTime startTime,

        @Schema(description = "Appointment end time", example = "10:30")
        LocalTime endTime,

        @Schema(
                description = "Current status of the appointment",
                example = "CONFIRMED",
                allowableValues = {
                        "PENDING_PAYMENT", "CONFIRMED", "CANCELLED",
                        "COMPLETED", "NO_SHOW"
                }
        )
        AppointmentStatus status,

        @Schema(description = "Consultation fees snapshot at the time of booking", example = "500.00")
        BigDecimal consultationFees,

        @Schema(description = "Payment ID set by payment-service after successful payment")
        String paymentId,

        @Schema(description = "Reason provided at the time of cancellation")
        String cancellationReason,

        @Schema(description = "Who cancelled the appointment — PATIENT or DOCTOR")
        CancelledBy cancelledBy
) {}