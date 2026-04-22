package com.healthcare.doctor.service;

import com.healthcare.doctor.payload.request.CreateClinicRequest;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.request.UpdateClinicRequest;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;

import java.util.List;

public interface ClinicService {

    /**
     * add clinic for a doctor
     */
    ClinicResponse addClinic(String userId, CreateClinicRequest request);

    /**
     * get all active clinics for a doctor
     */
    List<ClinicResponse> getClinics(String userId);

    /**
     * update clinic for a doctor
     */
    ClinicResponse updateClinic(String userId, String clinicId, UpdateClinicRequest request);

    /**
     * soft delete clinic for a doctor
     */
    void deleteClinic(String userId, String clinicId);

    /**
     * Set schedule — replaces existing schedule entirely
     */
    List<ClinicScheduleResponse> setSchedule(String userId, String clinicId,
                                             ClinicScheduleRequest request);

    /**
     * Get schedule for a clinic
     */
    List<ClinicScheduleResponse> getSchedule(String userId, String clinicId);
}
