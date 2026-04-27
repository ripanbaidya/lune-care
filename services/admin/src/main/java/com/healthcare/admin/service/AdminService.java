package com.healthcare.admin.service;

import com.healthcare.admin.payload.response.PendingDoctorResponse;
import com.healthcare.admin.payload.response.OverviewResponse;

import java.util.List;

public interface AdminService {

    List<PendingDoctorResponse> getPendingDoctors();

    void verifyDoctor(String doctorId);

    void rejectDoctor(String doctorId, String reason);

    OverviewResponse getOverview();
}