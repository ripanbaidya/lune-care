package com.healthcare.appointment.mapper;

import com.healthcare.appointment.entity.Slot;
import com.healthcare.appointment.payload.response.SlotResponse;

public final class SlotMapper {

    private SlotMapper() {
    }

    public static SlotResponse toSlotResponse(Slot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctorId())
                .clinicId(slot.getClinicId())
                .slotDate(slot.getSlotDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getStatus())
                .build();
    }
}
