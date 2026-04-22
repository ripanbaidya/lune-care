package com.healthcare.patient.payload.dto.doctor;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ClinicScheduleResponse(
        String id,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean active

) {
}