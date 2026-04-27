package com.healthcare.notification.factory;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.enums.NotificationCategory;
import com.healthcare.notification.enums.NotificationType;
import com.healthcare.notification.event.AppointmentEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds {@link Notification} documents from inbound events.
 * <h3>Extensibility contract</h3>
 * To add a new notification type:
 * <ol>
 *   <li>Add a value to {@link NotificationType} (and optionally {@link NotificationCategory})</li>
 *   <li>Add a private {@code build*Notifications} method here</li>
 *   <li>Call it from the appropriate public {@code from*} method</li>
 * </ol>
 * No other classes need to change.
 *
 * <h3>Routing decision</h3>
 * <pre>
 * Event                     | Patient notified | Doctor notified
 * --------------------------|------------------|----------------
 * appointment.confirmed     |       YES        |      YES
 * appointment.cancelled     |       YES        |      YES
 * appointment.completed     |       YES        |       NO
 * appointment.no_show       |       YES        |       NO
 * appointment.payment_failed|       YES        |       NO
 * </pre>
 */
@Slf4j
@Component
public class NotificationFactory {

    private static final String ROLE_PATIENT = "ROLE_PATIENT";
    private static final String ROLE_DOCTOR = "ROLE_DOCTOR";

    // Public factory methods (one per routing key)

    public List<Notification> fromConfirmed(AppointmentEvent event) {
        List<Notification> notifications = new ArrayList<>();

        notifications.add(build(
                event.getPatientId(),
                ROLE_PATIENT,
                NotificationType.APPOINTMENT_CONFIRMED,
                NotificationCategory.APPOINTMENT,
                "Appointment Confirmed",
                "Your appointment has been confirmed for " + event.getAppointmentDate()
                        + " at " + event.getStartTime() + ". See you soon!",
                event.getAppointmentId()
        ));

        notifications.add(build(
                event.getDoctorId(),
                ROLE_DOCTOR,
                NotificationType.APPOINTMENT_CONFIRMED,
                NotificationCategory.APPOINTMENT,
                "New Appointment Booked",
                "A new appointment has been booked for " + event.getAppointmentDate()
                        + " at " + event.getStartTime() + ".",
                event.getAppointmentId()
        ));

        return notifications;
    }

    public List<Notification> fromCancelled(AppointmentEvent event) {
        List<Notification> notifications = new ArrayList<>();

        String reason = event.getCancellationReason() != null
                ? event.getCancellationReason()
                : "No reason provided";

        notifications.add(build(
                event.getPatientId(),
                ROLE_PATIENT,
                NotificationType.APPOINTMENT_CANCELLED,
                NotificationCategory.APPOINTMENT,
                "Appointment Cancelled",
                "Your appointment on " + event.getAppointmentDate() + " at " + event.getStartTime()
                        + " has been cancelled. Reason: " + reason,
                event.getAppointmentId()
        ));

        notifications.add(build(
                event.getDoctorId(),
                ROLE_DOCTOR,
                NotificationType.APPOINTMENT_CANCELLED,
                NotificationCategory.APPOINTMENT,
                "Appointment Cancelled",
                "An appointment on " + event.getAppointmentDate() + " at " + event.getStartTime()
                        + " has been cancelled. Reason: " + reason,
                event.getAppointmentId()
        ));

        return notifications;
    }

    public List<Notification> fromCompleted(AppointmentEvent event) {
        List<Notification> notifications = new ArrayList<>();

        notifications.add(build(
                event.getPatientId(),
                ROLE_PATIENT,
                NotificationType.APPOINTMENT_COMPLETED,
                NotificationCategory.APPOINTMENT,
                "Appointment Completed",
                "Your appointment on " + event.getAppointmentDate() + " has been completed. We'd love to hear your feedback!",
                event.getAppointmentId()
        ));

        return notifications;
    }

    public List<Notification> fromNoShow(AppointmentEvent event) {
        List<Notification> notifications = new ArrayList<>();

        notifications.add(build(
                event.getPatientId(),
                ROLE_PATIENT,
                NotificationType.APPOINTMENT_NO_SHOW,
                NotificationCategory.APPOINTMENT,
                "Missed Appointment",
                "You missed your appointment on " + event.getAppointmentDate() + " at " + event.getStartTime()
                        + ". Please reschedule if needed.",
                event.getAppointmentId()
        ));

        return notifications;
    }

    public List<Notification> fromPaymentFailed(AppointmentEvent event) {
        List<Notification> notifications = new ArrayList<>();

        notifications.add(build(
                event.getPatientId(),
                ROLE_PATIENT,
                NotificationType.APPOINTMENT_PAYMENT_FAILED,
                NotificationCategory.APPOINTMENT,
                "Payment Window Expired",
                "Your payment window for the appointment on " + event.getAppointmentDate()
                        + " at " + event.getStartTime()
                        + " has expired and the slot has been released. Please book again.",
                event.getAppointmentId()
        ));

        return notifications;
    }

    /*
     * ------- Private helpers -------
     */

    private Notification build(String recipientId,
                               String recipientRole,
                               NotificationType type,
                               NotificationCategory category,
                               String title,
                               String body,
                               String referenceId) {
        return Notification.builder()
                .recipientId(recipientId)
                .recipientRole(recipientRole)
                .type(type)
                .category(category)
                .title(title)
                .body(body)
                .referenceId(referenceId)
                .isRead(false)
                .build();
    }
}