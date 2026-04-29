package com.healthcare.doctor.payload.dto.appointment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Builder
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

        LocalDate startDate,

        LocalDate endDate

) {

    @Builder
    public record ScheduleEntry(
            DayOfWeek dayOfWeek,
            LocalTime startTime,
            LocalTime endTime,
            boolean active
    ) {
    }
}