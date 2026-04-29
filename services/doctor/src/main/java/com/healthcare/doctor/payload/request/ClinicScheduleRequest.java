package com.healthcare.doctor.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ClinicScheduleRequest(

        @NotNull(message = "At least one schedule entry is required")
        @Valid
        List<ScheduleEntry> schedules,

        @FutureOrPresent(message = "Start date must be today or a future date")
        LocalDate startDate,

        @FutureOrPresent(message = "End date must be today or a future date")
        LocalDate endDate

) {
    public record ScheduleEntry(

            @NotNull(message = "Day of week is required")
            DayOfWeek dayOfWeek,

            @NotNull(message = "Start time is required")
            LocalTime startTime,

            @NotNull(message = "End time is required")
            LocalTime endTime

    ) {
    }
}