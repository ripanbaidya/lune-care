package com.healthcare.admin.service.impl;

import com.healthcare.admin.client.AuthServiceClient;
import com.healthcare.admin.client.DoctorServiceClient;
import com.healthcare.admin.enums.Role;
import com.healthcare.admin.payload.response.DoctorDocumentResponse;
import com.healthcare.admin.payload.response.DoctorSummaryResponse;
import com.healthcare.admin.payload.response.PendingDoctorResponse;
import com.healthcare.admin.payload.request.UpdateVerificationStatusRequest;
import com.healthcare.admin.payload.response.OverviewResponse;
import com.healthcare.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final DoctorServiceClient doctorServiceClient;
    private final AuthServiceClient authServiceClient;

    @Override
    public List<PendingDoctorResponse> getPendingDoctors() {
        log.debug("Fetching pending verification doctors");

        try {
            List<DoctorSummaryResponse> summaries = doctorServiceClient.getDoctorsPendingVerification();

            // For each doctor, fetch their documents — admin needs to see them to make a decision
            return summaries.stream()
                    .map(summary -> {
                        List<DoctorDocumentResponse> documents = fetchDocumentsSafely(summary.id());
                        return new PendingDoctorResponse(
                                summary.id(),
                                summary.userId(),
                                summary.firstName(),
                                summary.lastName(),
                                summary.phoneNumber(),
                                summary.specialization(),
                                summary.qualification(),
                                summary.createdAt(),
                                documents
                        );
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Failed to fetch pending doctors. Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void verifyDoctor(String doctorId) {
        log.info("Admin approving doctor. doctorId={}", doctorId);

        try {
            doctorServiceClient.updateVerificationStatus(
                    doctorId,
                    new UpdateVerificationStatusRequest(true, null)
            );

            log.info("Doctor approved successfully. doctorId={}", doctorId);

        } catch (Exception e) {
            log.error("Failed to approve doctor. doctorId={}, error={}", doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void rejectDoctor(String doctorId, String reason) {
        log.info("Admin rejecting doctor. doctorId={}, reason={}", doctorId, reason);

        try {
            doctorServiceClient.updateVerificationStatus(
                    doctorId,
                    new UpdateVerificationStatusRequest(false, reason)
            );

            log.info("Doctor rejected. doctorId={}", doctorId);

        } catch (Exception e) {
            log.error("Failed to reject doctor. doctorId={}, error={}", doctorId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public OverviewResponse getOverview() {
        log.debug("Fetching platform overview stats");

        try {
            List<DoctorSummaryResponse> pendingDoctors = doctorServiceClient.getDoctorsPendingVerification();
            int totalDoctors = authServiceClient.getUsersCountByRole(Role.ROLE_DOCTOR);
            int totalPatients = authServiceClient.getUsersCountByRole(Role.ROLE_PATIENT);

            return new OverviewResponse(totalDoctors, pendingDoctors.size(), totalPatients);

        } catch (Exception e) {
            log.error("Failed to fetch overview stats. Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    private List<DoctorDocumentResponse> fetchDocumentsSafely(String doctorId) {
        try {
            return doctorServiceClient.getDoctorDocuments(doctorId);
        } catch (Exception e) {
            // Non-fatal — admin can still see doctor info without documents
            log.warn("Failed to fetch documents for doctorId={}. Error: {}", doctorId, e.getMessage());
            return List.of();
        }
    }
}