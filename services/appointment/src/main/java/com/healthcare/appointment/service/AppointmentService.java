package com.healthcare.appointment.service;

import com.healthcare.appointment.enums.CancelledBy;
import com.healthcare.appointment.payload.request.BookAppointmentRequest;
import com.healthcare.appointment.payload.request.CancelAppointmentRequest;
import com.healthcare.appointment.payload.request.ConfirmPaymentRequest;
import com.healthcare.appointment.payload.response.AppointmentResponse;
import com.healthcare.appointment.payload.response.SlotResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {

    List<SlotResponse> getAvailableSlots(String doctorId, String clinicId, LocalDate date);

    AppointmentResponse bookAppointment(String patientId, BookAppointmentRequest request);

    AppointmentResponse confirmPayment(ConfirmPaymentRequest request);

    void cancelDueToTimeout(String appointmentId);

    AppointmentResponse cancelAppointment(String appointmentId, String requesterId,
                                          CancelledBy cancelledBy, CancelAppointmentRequest request);

    AppointmentResponse completeAppointment(String appointmentId, String doctorId);

    /**
     * Appointment that is CONFIRMED only that appointment can be marked as NO_SHOW by the doctor.
     */
    AppointmentResponse markNoShow(String appointmentId, String doctorId);

    Page<AppointmentResponse> getPatientHistory(String patientId, int page, int size);

    Page<AppointmentResponse> getDoctorHistory(String doctorId, int page, int size);

    AppointmentResponse getAppointment(String appointmentId);

    List<AppointmentResponse> getDoctorTodayAppointments(String doctorId);

    /**
     * Releases the slot back to AVAILABLE after the payment-service confirms
     * the refund for a REFUND_INITIATED appointment has completed.
     */
    void releaseSlotAfterRefund(String appointmentId);
}
