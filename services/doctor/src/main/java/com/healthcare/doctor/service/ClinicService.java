package com.healthcare.doctor.service;

import com.healthcare.doctor.payload.request.CreateClinicRequest;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.request.UpdateClinicRequest;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;

public interface ClinicService {

    ClinicResponse addClinic(String userId, CreateClinicRequest request);

    List<ClinicResponse> getClinics(String userId);

    BigDecimal getClinicFees(String clinicId);

    ClinicResponse updateClinic(String userId, String clinicId, UpdateClinicRequest request);

    void deleteClinic(String userId, String clinicId);

}
