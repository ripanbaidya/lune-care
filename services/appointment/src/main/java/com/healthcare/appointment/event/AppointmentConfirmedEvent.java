package com.healthcare.appointment.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentConfirmedEvent extends AppointmentEvent {
    private String  paymentId;
    private BigDecimal consultationFees;
}