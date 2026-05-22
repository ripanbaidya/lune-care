package com.healthcare.feedback.service.impl;

import com.healthcare.feedback.client.DoctorServiceClient;
import com.healthcare.feedback.client.PatientServiceClient;
import com.healthcare.feedback.entity.Feedback;
import com.healthcare.feedback.enums.ErrorCode;
import com.healthcare.feedback.exception.FeedbackException;
import com.healthcare.feedback.mapper.FeedbackMapper;
import com.healthcare.feedback.payload.dto.doctor.DoctorIdentityResponse;
import com.healthcare.feedback.payload.dto.patient.PatientSummaryResponse;
import com.healthcare.feedback.payload.dto.success.PageInfo;
import com.healthcare.feedback.payload.request.SubmitFeedbackRequest;
import com.healthcare.feedback.payload.request.UpdateFeedbackRequest;
import com.healthcare.feedback.payload.response.DoctorFeedbackSummary;
import com.healthcare.feedback.payload.response.FeedbackResponse;
import com.healthcare.feedback.repository.FeedbackAggregationRepository;
import com.healthcare.feedback.repository.FeedbackEligibilityRepository;
import com.healthcare.feedback.repository.FeedbackRepository;
import com.healthcare.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackEligibilityRepository eligibilityRepository;
    private final FeedbackAggregationRepository aggregationRepository;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    /**
     * Submit feedback for a completed appointment.
     * Guard conditions are checked before saving the feedback.
     * 1. Eligibility check: appointment must exist in {@code feedback_eligibility} and belong
     * to this patient. If not found → 422 (Feedback not eligible)
     * 2. Duplicate check: feedback must not yet exist for this appointmentId.
     * If the feedback exists > 409 (Feedback already exists)
     * Re-submission after delete: Deleting feedback removes the {@code Feedback} document but
     * leaves the eligibility record intact, so the patient can submit again.
     */
    @Override
    @Transactional
    public FeedbackResponse submitFeedback(String patientId,
                                           String doctorId,
                                           SubmitFeedbackRequest request) {
        String appointmentId = request.appointmentId();
        log.info("Feedback submission — patientId: {}, doctorId: {}, appointmentId: {}",
                patientId, doctorId, appointmentId);

        // 1. Eligibility check
        eligibilityRepository
                .findByAppointmentIdAndPatientId(appointmentId, patientId)
                .orElseThrow(() -> {
                    log.warn("Feedback rejected: not eligible — patientId: {}, appointmentId: {}",
                            patientId, appointmentId);
                    return new FeedbackException(ErrorCode.FEEDBACK_NOT_ELIGIBLE,
                            "You can only submit feedback for your completed appointments");
                });

        // 2. Duplication check
        if (feedbackRepository.existsByAppointmentId(appointmentId)) {
            log.warn("Feedback rejected: already exists — patientId: {}, appointmentId: {}",
                    patientId, appointmentId);
            throw new FeedbackException(ErrorCode.FEEDBACK_ALREADY_EXISTS);
        }

        Feedback feedback = Feedback.builder()
                .appointmentId(appointmentId)
                .doctorId(doctorId)
                .patientId(patientId)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        feedbackRepository.save(feedback);

        log.info("Feedback submitted — feedbackId: {}, appointmentId: {}, rating: {}",
                feedback.getId(), appointmentId, feedback.getRating());

        return FeedbackMapper.toResponse(
                feedback,
                resolvePatientName(feedback.getPatientId()),
                resolveDoctorName(feedback.getDoctorId())
        );
    }

    /**
     * Public endpoint — returns paginated feedback for a doctor along with
     * the aggregated average rating and total review count.
     * <p>Average rating is computed in-service from all ratings in MongoDB
     * using Spring Data aggregation — no separate aggregation pipeline needed
     * at this scale.
     */
    @Override
    @Transactional(readOnly = true)
    public DoctorFeedbackSummary getDoctorFeedback(String doctorId, int page, int size) {
        log.debug("Fetching doctor feedback — doctorId: {}, page: {}, size: {}",
                doctorId, page, size);

        Page<Feedback> feedbackPage =
                feedbackRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId,
                        PageRequest.of(page, size));

        // Compute average across ALL reviews via MongoDB $avg aggregation
        long totalReviews = feedbackRepository.countByDoctorId(doctorId);
        double averageRating = aggregationRepository.computeAverageRating(doctorId);

        List<FeedbackResponse> content = feedbackPage.getContent()
                .stream()
                .map(feedback -> FeedbackMapper.toResponse(
                        feedback,
                        resolvePatientName(feedback.getPatientId()),
                        resolveDoctorName(feedback.getDoctorId())
                ))
                .toList();

        log.info("Doctor feedback fetched — doctorId: {}, totalReviews: {}, averageRating: {}",
                doctorId, totalReviews, averageRating);

        return DoctorFeedbackSummary.builder()
                .doctorId(doctorId)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .content(content)
                .page(PageInfo.from(feedbackPage))
                .build();
    }

    /**
     * Get feedbacks submitted by a patient.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getMySubmittedFeedback(String patientId, int page, int size) {
        log.debug("Fetching submitted feedback — patientId: {}, page: {}, size: {}",
                patientId, page, size);

        Page<Feedback> feedbackPage = feedbackRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId, PageRequest.of(page, size));

        Map<String, String> doctorNameMap = resolveDoctorNames(feedbackPage.getContent());
        return feedbackPage.map(feedback -> FeedbackMapper.toResponse(
                feedback,
                resolvePatientName(feedback.getPatientId()),
                doctorNameMap.get(feedback.getDoctorId())
        ));
    }

    /**
     * Get feedbacks received by a doctor.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getMyReceivedFeedback(String doctorId, int page, int size) {
        log.debug("Fetching received feedback — doctorId: {}, page: {}, size: {}",
                doctorId, page, size);

        Page<Feedback> feedbackPage = feedbackRepository
                .findByDoctorIdOrderByCreatedAtDesc(doctorId, PageRequest.of(page, size));

        Map<String, String> patientNameMap = resolvePatientNames(feedbackPage.getContent());
        String doctorName = resolveDoctorName(doctorId);
        return feedbackPage.map(feedback -> FeedbackMapper.toResponse(
                feedback,
                patientNameMap.get(feedback.getPatientId()),
                doctorName
        ));
    }

    /**
     * Update rating and/or comment on existing feedback.
     * The patient who submitted the feedback can update it.
     */
    @Override
    @Transactional
    public FeedbackResponse updateFeedback(String feedbackId,
                                           String patientId,
                                           UpdateFeedbackRequest request) {
        log.debug("Feedback update request for patientId: {}, feedbackId: {}", patientId, feedbackId);

        Feedback feedback = findOwnedFeedback(feedbackId, patientId);

        // Update only if the field is non-null (allows partial updates)
        if (request.rating() != null) feedback.setRating(request.rating());
        if (StringUtils.hasText(request.comment())) feedback.setComment(request.comment());

        feedbackRepository.save(feedback);

        log.info("Feedback updated — feedbackId: {}, newRating: {}", feedbackId, request.rating());
        return FeedbackMapper.toResponse(
                feedback,
                resolvePatientName(feedback.getPatientId()),
                resolveDoctorName(feedback.getDoctorId())
        );
    }

    /**
     * Delete feedback by id, Only the patient who submitted it can delete it.
     * The eligibility record is intentionally preserved so the patient can re-submit
     * feedback for the same appointment.
     */
    @Override
    @Transactional
    public void deleteFeedback(String feedbackId, String patientId) {
        log.debug("Feedback delete request for patientId: {}, feedbackId: {}", patientId, feedbackId);

        Feedback feedback = findOwnedFeedback(feedbackId, patientId);
        feedbackRepository.delete(feedback);

        log.info("Feedback deleted — feedbackId: {}, appointmentId: {}", feedbackId, feedback.getAppointmentId());
    }

    /*
     * Helper methods
     */

    /**
     * Finds feedback by ID and verifies the patientId matches.
     * Returns 404 for both "not found" and "wrong owner" cases avoids leaking the
     * existence of other patients' feedback.
     */
    private Feedback findOwnedFeedback(String feedbackId, String patientId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> {
                    log.warn("Feedback not found — feedbackId: {}", feedbackId);
                    return new FeedbackException(ErrorCode.FEEDBACK_NOT_FOUND);
                });

        if (!feedback.getPatientId().equals(patientId)) {
            log.warn("Feedback ownership mismatch — feedbackId: {}, requestedBy: {}, owner: {}",
                    feedbackId, patientId, feedback.getPatientId());
            throw new FeedbackException(ErrorCode.FEEDBACK_UNAUTHORIZED);
        }

        return feedback;
    }

    private Map<String, String> resolvePatientNames(List<Feedback> feedbacks) {
        Set<String> patientIds = feedbacks.stream()
                .map(Feedback::getPatientId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        Map<String, String> patientNameMap = new HashMap<>();
        for (String patientId : patientIds) {
            patientNameMap.put(patientId, resolvePatientName(patientId));
        }
        return patientNameMap;
    }

    private Map<String, String> resolveDoctorNames(List<Feedback> feedbacks) {
        Set<String> doctorIds = feedbacks.stream()
                .map(Feedback::getDoctorId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        Map<String, String> doctorNameMap = new HashMap<>();
        for (String doctorId : doctorIds) {
            doctorNameMap.put(doctorId, resolveDoctorName(doctorId));
        }
        return doctorNameMap;
    }

    private String resolvePatientName(String patientId) {
        if (!StringUtils.hasText(patientId)) return null;


        try {
            PatientSummaryResponse summary = patientServiceClient.getPatientSummaryByUserId(patientId);
            if (summary == null) return null;


            if (StringUtils.hasText(summary.fullName())) {
                return summary.fullName().trim();
            }

            String firstName = summary.firstName();
            String lastName = summary.lastName();
            String fallbackFullName = ((firstName == null ? "" : firstName.trim()) + " "
                    + (lastName == null ? "" : lastName.trim())).trim();

            return StringUtils.hasText(fallbackFullName) ? fallbackFullName : null;
        } catch (Exception ex) {
            log.warn("Unable to resolve patient name for patientId: {}. Falling back to patientId display.", patientId);
            return null;
        }
    }

    private String resolveDoctorName(String doctorId) {
        if (!StringUtils.hasText(doctorId)) return null;

        try {
            DoctorIdentityResponse summary = doctorServiceClient.getDoctorIdentityByUserId(doctorId);
            if (summary == null) return null;

            if (StringUtils.hasText(summary.fullName())) {
                return summary.fullName().trim();
            }

            String firstName = summary.firstName();
            String lastName = summary.lastName();
            String fallbackFullName = ((firstName == null ? "" : firstName.trim()) + " "
                    + (lastName == null ? "" : lastName.trim())).trim();

            return StringUtils.hasText(fallbackFullName) ? fallbackFullName : null;
        } catch (Exception ex) {
            log.warn("Unable to resolve doctor name for doctorId: {}. Falling back to doctorId display.", doctorId);
            return null;
        }
    }

}
