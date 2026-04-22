package com.healthcare.doctor.mapper;

import com.healthcare.doctor.entity.Clinic;
import com.healthcare.doctor.entity.ClinicSchedule;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;

import java.util.Collections;
import java.util.List;

public final class ClinicMapper {

    private ClinicMapper() {
    }

    public static ClinicResponse toClinicResponse(Clinic clinic) {
        List<ClinicScheduleResponse> schedules = clinic.getSchedules() != null
                ? clinic.getSchedules().stream().map(ClinicMapper::toScheduleResponse).toList()
                : Collections.emptyList();

        return ClinicResponse.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .type(clinic.getType())
                .consultationFees(clinic.getConsultationFees())
                .consultationDurationMinutes(clinic.getConsultationDurationMinutes())
                .contactNumber(clinic.getContactNumber())
                .addressLine(clinic.getAddressLine())
                .city(clinic.getCity())
                .state(clinic.getState())
                .pincode(clinic.getPincode())
                .country(clinic.getCountry())
                .active(clinic.isActive())
                .schedules(schedules)
                .build();
    }

    public static ClinicScheduleResponse toScheduleResponse(ClinicSchedule schedule) {
        return ClinicScheduleResponse.builder()
                .id(schedule.getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .active(schedule.isActive())
                .build();
    }
}
