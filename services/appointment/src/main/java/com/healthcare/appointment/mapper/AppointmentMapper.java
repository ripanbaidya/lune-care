package com.healthcare.appointment.mapper;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.payload.response.AppointmentResponse;

public final class AppointmentMapper {

    private AppointmentMapper() {
    }

    public static AppointmentResponse toAppointmentResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .clinicId(appointment.getClinicId())
                .slotId(appointment.getSlotId())
                .appointmentDate(appointment.getAppointmentDate())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .consultationFees(appointment.getConsultationFees())
                .paymentId(appointment.getPaymentId())
                .cancellationReason(appointment.getCancellationReason())
                .cancelledBy(appointment.getCancelledBy())
                .build();
    }
}
