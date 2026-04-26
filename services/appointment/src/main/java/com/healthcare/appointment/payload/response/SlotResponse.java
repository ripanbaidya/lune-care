package com.healthcare.appointment.payload.response;

import com.healthcare.appointment.enums.SlotStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;

@Builder
public record SlotResponse(

        String id,
        String doctorId,
        String clinicId,
        LocalDate slotDate,
        LocalTime startTime,
        LocalTime endTime,
        SlotStatus status

) {
}