package com.healthcare.doctor.payload.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Schema(description = "A single day's schedule entry for a clinic")
@Builder
public record ClinicScheduleResponse(

        @Schema(description = "Schedule entry ID")
        String id,

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