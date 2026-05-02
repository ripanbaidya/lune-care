package com.healthcare.appointment.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Schema(description = "Internal request payload for generating appointment slots — called by doctor-service after schedule is set")
public record GenerateSlotsRequest(

        @Schema(description = "Doctor ID for whom slots are to be generated")
        @NotNull
        String doctorId,

        @Schema(description = "Clinic ID for which slots are to be generated")
        @NotNull
        String clinicId,

        @Schema(description = "Duration of each slot in minutes (minimum 10)", example = "30")
        @NotNull
        @Min(value = 10, message = "Minimum consultation duration is 10 minutes")
        Integer consultationDurationMinutes,

        @Schema(description = "List of day-wise schedule entries to generate slots from")
        @NotNull
        List<ScheduleEntry> schedules,

        @Schema(
                description = "Inclusive start date for slot generation. Defaults to today if not provided",
                example = "2025-06-01"
        )
        LocalDate startDate,

        @Schema(
                description = "Inclusive end date for slot generation. Defaults to today + 30 days if not provided",
                example = "2025-06-30"
        )
        LocalDate endDate
) {
    public GenerateSlotsRequest {
        LocalDate today = LocalDate.now();
        if (startDate == null) startDate = today;
        if (startDate.isBefore(today)) startDate = today;
        if (endDate == null) endDate = today.plusDays(30);
    }

    @Schema(description = "A single day's schedule entry used for slot generation")
    public record ScheduleEntry(

            @Schema(description = "Day of the week", example = "MONDAY")
            DayOfWeek dayOfWeek,

            @Schema(description = "Start time of the clinic on this day", example = "09:00")
            LocalTime startTime,

            @Schema(description = "End time of the clinic on this day", example = "13:00")
            LocalTime endTime,

            @Schema(description = "Whether this day's schedule is active")
            boolean active
    ) {
    }
}