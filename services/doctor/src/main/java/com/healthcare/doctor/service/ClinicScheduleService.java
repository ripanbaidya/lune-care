package com.healthcare.doctor.service;

import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;

import java.time.DayOfWeek;
import java.util.List;

public interface ClinicScheduleService {

    List<ClinicScheduleResponse> setSchedule(String userId,
                                             String clinicId,
                                             ClinicScheduleRequest request);

    void deleteScheduleDay(String userId, String clinicId, DayOfWeek dayOfWeek);

    List<ClinicScheduleResponse> getSchedule(String userId, String clinicId);
}
