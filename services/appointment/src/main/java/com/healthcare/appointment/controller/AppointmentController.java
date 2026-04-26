package com.healthcare.appointment.controller;

import com.healthcare.appointment.enums.CancelledBy;
import com.healthcare.appointment.payload.dto.success.ResponseWrapper;
import com.healthcare.appointment.payload.request.BookAppointmentRequest;
import com.healthcare.appointment.payload.request.CancelAppointmentRequest;
import com.healthcare.appointment.payload.response.AppointmentResponse;
import com.healthcare.appointment.payload.response.SlotResponse;
import com.healthcare.appointment.service.AppointmentService;
import com.healthcare.appointment.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointment")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Get available slots for a specific doctor and specific clinic on a specific date.
     * {@code date} is in ISO 8601 format {@code (YYYY-MM-DD)} and the date filled must
     * be provided by the user while fetching the slots.
     *
     * @param doctorId the id of the doctor for whom slots are to be fetched
     * @param clinicId the id of the respected doctor's clinic on which slots are to be fetched
     * @param date     the date for which slots are to be fetched
     * @return list of available slots for the given doctor and clinic on the given date
     */
    @GetMapping("/slots/{doctorId}/{clinicId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<List<SlotResponse>>> getAvailableSlots(
            @PathVariable String doctorId,
            @PathVariable String clinicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        var response = appointmentService.getAvailableSlots(doctorId, clinicId, date);
        return ResponseUtil.ok("Slots fetched successfully!", response);
    }

    /**
     * Book an appointment for a specific slot.
     *
     * @param userId  the id of the user(patient) who is booking the appointment
     * @param request the request containing the slotId for which the appointment is to be booked
     * @return the response containing the appointment details after booking, while no payment is
     * made, because after the booking the payment has to make by the user otherwise the appointment
     * won't be confirmed.
     */
    @PostMapping("/book")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> bookAppointment(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody BookAppointmentRequest request
    ) {
        var response = appointmentService.bookAppointment(userId, request);
        return ResponseUtil.created("Appointment booked successfully!", response);
    }

    /**
     * Get a detail of an appointment by its id, both patient and doctor can view
     * the appointment details.
     *
     * @param appointmentId the id of the appointment for which details are to be fetched
     * @return appointment details
     */
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> getAppointment(
            @PathVariable String appointmentId
    ) {
        var response = appointmentService.getAppointment(appointmentId);
        return ResponseUtil.ok("Appointment fetched successfully!", response);
    }

    /**
     * Cancel an appointment by its id.
     *
     * @param userId        the id of the user who is cancelling the appointment
     * @param appointmentId the id of the appointment to be canceled
     * @param role          the role of the user who is cancelling the appointment
     * @param request       the request containing the cancellation reason (optional)
     * @return the response containing the appointment details after cancellation
     */
    @PatchMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> cancelAppointment(
            @AuthenticationPrincipal String userId,
            @PathVariable String appointmentId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody(required = false) CancelAppointmentRequest request
    ) {
        CancelledBy cancelledBy = role.equals("ROLE_DOCTOR") ? CancelledBy.DOCTOR : CancelledBy.PATIENT;
        var req = request != null ? request : new CancelAppointmentRequest(null);

        var response = appointmentService.cancelAppointment(appointmentId, userId, cancelledBy, req);

        return ResponseUtil.ok("Appointment cancelled successfully!", response);
    }

    /**
     * Marks an appointment as completed by the authenticated doctor.
     *
     * @param userId        the ID of the authenticated user performing the operation
     * @param appointmentId the ID of the appointment to be marked as completed
     * @return a ResponseEntity containing a ResponseWrapper with the details of the completed appointment
     */
    @PatchMapping("/{appointmentId}/complete")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> completeAppointment(
            @AuthenticationPrincipal String userId,
            @PathVariable String appointmentId
    ) {
        var response = appointmentService.completeAppointment(appointmentId, userId);
        return ResponseUtil.ok("Appointment completed successfully!", response);
    }

    // TODO: Need to handle 403 error properly
    /**
     * Marks an appointment as no-show by the authenticated doctor.
     *
     * @param userId        the ID of the authenticated user performing the operation
     * @param appointmentId the ID of the appointment to be marked as no-show
     * @return the details of the appointment marked as no-show
     */
    @PatchMapping("/{appointmentId}/no-show")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> markNoShow(
            @AuthenticationPrincipal String userId,
            @PathVariable String appointmentId
    ) {
        var response = appointmentService.markNoShow(appointmentId, userId);
        return ResponseUtil.ok("Appointment marked as no-show successfully!", response);
    }

    /**
     * Get the patient's history of appointments.
     *
     * @param userId the id of the patient for whom history of appointment has to be fetched
     * @param page   0-based page number
     * @param size   number of items per page
     * @return list of appointments for the patient
     */
    @GetMapping("/patient/history")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getPatientHistory(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AppointmentResponse> responses = appointmentService.getPatientHistory(userId, page, size);
        return ResponseUtil.paginated("Patient's history fetched successfully!", responses);

    }

    /**
     * Get today's appointments for a doctor.
     *
     * @param userId the id of the doctor for whom today's appointments are to be fetched
     * @return list of today's appointments for the doctor
     */
    @GetMapping("/doctor/today")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<AppointmentResponse>>> getDoctorTodayAppointments(
            @AuthenticationPrincipal String userId
    ) {
        var response = appointmentService.getDoctorTodayAppointments(userId);
        return ResponseUtil.ok("Today's appointments fetched successfully!", response);
    }

    /**
     * Get the doctor's history of appointments.
     *
     * @param userId the id of the doctor for whom history of appointment has to be fetched
     * @param page   0-based page number
     * @param size   number of items per page
     * @return list of appointments for the doctor
     */
    @GetMapping("/doctor/history")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getDoctorHistory(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Page<AppointmentResponse> result = appointmentService.getDoctorHistory(userId, page, size);

        return ResponseUtil.paginated("Doctor's history fetched successfully", result);
    }
}
