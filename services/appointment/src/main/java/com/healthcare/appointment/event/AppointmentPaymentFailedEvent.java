package com.healthcare.appointment.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentPaymentFailedEvent extends AppointmentEvent {
    private String failureReason;
}