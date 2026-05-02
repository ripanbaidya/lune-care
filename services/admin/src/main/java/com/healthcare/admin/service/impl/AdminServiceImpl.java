package com.healthcare.admin.service.impl;

import com.healthcare.admin.client.AuthServiceClient;
import com.healthcare.admin.client.DoctorServiceClient;
import com.healthcare.admin.enums.ErrorCode;
import com.healthcare.admin.enums.Role;
import com.healthcare.admin.exception.AdminException;
import com.healthcare.admin.payload.response.DoctorDocumentResponse;
import com.healthcare.admin.payload.response.DoctorSummaryResponse;
import com.healthcare.admin.payload.response.PendingDoctorResponse;
import com.healthcare.admin.payload.request.UpdateVerificationStatusRequest;
import com.healthcare.admin.payload.response.OverviewResponse;
import com.healthcare.admin.service.AdminService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final DoctorServiceClient doctorServiceClient;
    private final AuthServiceClient authServiceClient;

    @Override
    @CircuitBreaker(name = "doctor-service", fallbackMethod = "getPendingDoctorsFallback")
    public List<PendingDoctorResponse> getPendingDoctors() {
        log.debug("Fetching pending verification doctors");

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
    }

    @SuppressWarnings("unused")
    private List<PendingDoctorResponse> getPendingDoctorsFallback(Throwable t) {
        log.error("CB OPEN — doctor-service unavailable for pending verification list. cause: {}",
                t.getMessage());
        // Return empty list — admin dashboard degrades gracefully
        return Collections.emptyList();
    }

    @Override
    @CircuitBreaker(name = "doctor-service", fallbackMethod = "verifyDoctorFallback")
    public void verifyDoctor(String doctorId) {
        log.info("Admin approving doctor. doctorId={}", doctorId);

        doctorServiceClient.updateVerificationStatus(
                doctorId,
                new UpdateVerificationStatusRequest(true, null)
        );

        log.info("Doctor approved successfully. doctorId={}", doctorId);
    }

    @SuppressWarnings("unused")
    private void verifyDoctorFallback(String doctorId, Throwable t) {
        log.error("CB OPEN — cannot verify doctor. doctorId: {}, cause: {}",
                doctorId, t.getMessage());
        throw new AdminException(ErrorCode.SERVICE_UNAVAILABLE,
                "Doctor service is temporarily unavailable. Please retry the verification.");
    }

    @Override
    @CircuitBreaker(name = "doctor-service", fallbackMethod = "rejectDoctorFallback")
    public void rejectDoctor(String doctorId, String reason) {
        log.info("Admin rejecting doctor. doctorId={}, reason={}", doctorId, reason);

        doctorServiceClient.updateVerificationStatus(
                doctorId,
                new UpdateVerificationStatusRequest(false, reason)
        );

        log.info("Doctor rejected. doctorId={}", doctorId);
    }

    @SuppressWarnings("unused")
    private void rejectDoctorFallback(String doctorId, String reason, Throwable t) {
        log.error("CB OPEN — cannot reject doctor. doctorId: {}, cause: {}",
                doctorId, t.getMessage());
        throw new AdminException(ErrorCode.SERVICE_UNAVAILABLE,
                "Doctor service is temporarily unavailable. Please retry the rejection.");
    }

    @Override
    public OverviewResponse getOverview() {
        log.debug("Fetching platform overview stats");

        int totalDoctor = fetchDoctorCount();
        int pendingVerification = fetchPendingVerificationCount();
        int totalPatient = fetchPatientCount();

        return new OverviewResponse(totalDoctor, pendingVerification, totalPatient);
    }
    
    @CircuitBreaker(name = "doctor-service", fallbackMethod = "fetchPendingVerificationCountFallback")
    private int fetchPendingVerificationCount() {
        return doctorServiceClient.getDoctorsPendingVerification().size();
    }

    @SuppressWarnings("unused")
    private int fetchPendingVerificationCountFallback(Throwable t) {
        log.warn("CB OPEN — doctor-service unavailable for pending count. Returning 0.");
        return 0;
    }

    @CircuitBreaker(name = "auth-service", fallbackMethod = "fetchDoctorCountFallback")
    private int fetchDoctorCount() {
        return authServiceClient.getUsersCountByRole(Role.ROLE_DOCTOR);
    }

    @SuppressWarnings("unused")
    private int fetchDoctorCountFallback(Throwable t) {
        log.warn("CB OPEN — auth-service unavailable for doctor count. Returning 0.");
        return 0;
    }

    @CircuitBreaker(name = "auth-service", fallbackMethod = "fetchPatientCountFallback")
    private int fetchPatientCount() {
        return authServiceClient.getUsersCountByRole(Role.ROLE_PATIENT);
    }

    @SuppressWarnings("unused")
    private int fetchPatientCountFallback(Throwable t) {
        log.warn("CB OPEN — auth-service unavailable for patient count. Returning 0.");
        return 0;
    }

    // Helper

    private List<DoctorDocumentResponse> fetchDocumentsSafely(String doctorId) {
        try {
            return doctorServiceClient.getDoctorDocuments(doctorId);
        } catch (Exception e) {
            log.warn("Failed to fetch documents for doctorId={}. Error: {}", doctorId, e.getMessage());
            return List.of();
        }
    }
}