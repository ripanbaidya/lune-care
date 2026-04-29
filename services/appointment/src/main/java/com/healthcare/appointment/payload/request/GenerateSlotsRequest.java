package com.healthcare.appointment.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record GenerateSlotsRequest(

        @NotNull
        String doctorId,

        @NotNull
        String clinicId,

        @NotNull
        @Min(value = 10, message = "Minimum consultation duration is 10 minutes")
        Integer consultationDurationMinutes,

        @NotNull
        List<ScheduleEntry> schedules,

        /*
         * Inclusive start date for slot generation.
         * The service will not generate slots for dates before this date.
         * This field is optional. If not provided, by default the today's date is used.
         */
        LocalDate startDate,

        /*
         * Inclusive end date for slot generation.
         * The service will not generate slots for dates after this date.
         * This field is optional. If not provided, by default the next 30 days are used.
         */
        LocalDate endDate

) {
    public GenerateSlotsRequest {
        LocalDate today = LocalDate.now();

        if (startDate == null) {
            startDate = today;
        }

        // Ensure start date is not in the past
        if (startDate.isBefore(today)) {
            startDate = today;
        }

        if (endDate == null) {
            endDate = today.plusDays(30);
        }
    }

    public record ScheduleEntry(
            DayOfWeek dayOfWeek,
            LocalTime startTime,
            LocalTime endTime,
            boolean active
    ) {
    }
}