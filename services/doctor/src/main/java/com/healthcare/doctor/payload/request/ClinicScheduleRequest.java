package com.healthcare.doctor.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Schema(description = "Request payload for setting or updating clinic schedule")
public record ClinicScheduleRequest(

        @Schema(description = "List of day-wise schedule entries")
        @NotNull(message = "At least one schedule entry is required")
        @Valid
        List<ScheduleEntry> schedules,

        @Schema(description = "Slot generation start date (today or future)", example = "2025-06-01")
        @FutureOrPresent(message = "Start date must be today or a future date")
        LocalDate startDate,

        @Schema(description = "Slot generation end date (today or future)", example = "2025-06-30")
        @FutureOrPresent(message = "End date must be today or a future date")
        LocalDate endDate

) {
    @Schema(description = "A single day's schedule entry")
    public record ScheduleEntry(

            @Schema(description = "Day of the week", example = "MONDAY")
            @NotNull(message = "Day of week is required")
            DayOfWeek dayOfWeek,

            @Schema(description = "Slot start time (HH:mm)", example = "09:00")
            @NotNull(message = "Start time is required")
            LocalTime startTime,

            @Schema(description = "Slot end time (HH:mm)", example = "13:00")
            @NotNull(message = "End time is required")
            LocalTime endTime
    ) {
    }
}