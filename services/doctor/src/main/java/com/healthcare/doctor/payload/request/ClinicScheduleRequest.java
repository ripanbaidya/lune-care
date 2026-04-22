package com.healthcare.doctor.payload.request;

import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public record ClinicScheduleRequest(

        @NotNull
        List<ScheduleEntry> schedules

) {

    public static record ScheduleEntry(

            @NotNull(message = "Day of week is required")
            DayOfWeek dayOfWeek,

            @NotNull(message = "Start time is required")
            LocalTime startTime,

            @NotNull(message = "End time is required")
            LocalTime endTime

    ) {
    }
}