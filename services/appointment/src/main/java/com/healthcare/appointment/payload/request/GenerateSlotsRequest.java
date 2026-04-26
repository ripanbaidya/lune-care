package com.healthcare.appointment.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
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

        int daysAhead

) {
    public GenerateSlotsRequest {
        if (daysAhead == 0) {
            daysAhead = 30;
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