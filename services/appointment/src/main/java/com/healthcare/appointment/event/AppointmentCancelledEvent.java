package com.healthcare.appointment.event;

import com.healthcare.appointment.enums.CancelledBy;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentCancelledEvent extends AppointmentEvent {
    private String cancellationReason;
    private CancelledBy cancelledBy;

    // true if was CONFIRMED before cancellation
    private boolean refundRequired;
}