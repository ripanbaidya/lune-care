package com.healthcare.feedback.service.impl;

import com.healthcare.feedback.entity.Feedback;
import com.healthcare.feedback.enums.ErrorCode;
import com.healthcare.feedback.exception.FeedbackException;
import com.healthcare.feedback.mapper.FeedbackMapper;
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

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackEligibilityRepository eligibilityRepository;
    private final FeedbackAggregationRepository aggregationRepository;

    /**
     * Submit feedback for a completed appointment.
     * <br>Guard conditions are checked before saving the feedback.
     * <br>1. Eligibility check - appointment must exist in {@code feedback_eligibility}
     * AND belong to this patient. If not found → 422 FEEDBACK_NOT_ELIGIBLE
     * <br>2. Duplicate check - feedback must not yet exist for this appointmentId.
     * if exist -> 409 FEEDBACK_ALREADY_EXISTS
     * <p><b>Re-submission after delete:</b> Deleting feedback removes the
     * {@code Feedback} document but leaves the eligibility record intact,
     * so the patient can submit again.
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

        return FeedbackMapper.toResponse(feedback);
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
                .map(FeedbackMapper::toResponse)
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

        return feedbackRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId, PageRequest.of(page, size))
                .map(FeedbackMapper::toResponse);
    }

    /**
     * Get feedbacks received by a doctor.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getMyReceivedFeedback(String doctorId, int page, int size) {
        log.debug("Fetching received feedback — doctorId: {}, page: {}, size: {}",
                doctorId, page, size);

        return feedbackRepository
                .findByDoctorIdOrderByCreatedAtDesc(doctorId, PageRequest.of(page, size))
                .map(FeedbackMapper::toResponse);
    }

    /**
     * Update rating and/or comment on existing feedback.
     * Only the patient who submitted the feedback can update it.
     */
    @Override
    public FeedbackResponse updateFeedback(String feedbackId,
                                           String patientId,
                                           UpdateFeedbackRequest request) {
        log.debug("Feedback update request for patientId: {}, feedbackId: {}", patientId, feedbackId);

        Feedback feedback = findOwnedFeedback(feedbackId, patientId);

        // Update only if the field is non-null
        if (request.rating() != null) feedback.setRating(request.rating());
        if (StringUtils.hasText(request.comment())) feedback.setComment(request.comment());

        feedbackRepository.save(feedback);

        log.info("Feedback updated — feedbackId: {}, newRating: {}", feedbackId, request.rating());
        return FeedbackMapper.toResponse(feedback);
    }

    /**
     * Delete feedback by ID.
     * Only the patient who submitted it can delete it.
     * The eligibility record is intentionally preserved so the patient
     * can re-submit feedback for the same appointment.
     */
    @Override
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

}