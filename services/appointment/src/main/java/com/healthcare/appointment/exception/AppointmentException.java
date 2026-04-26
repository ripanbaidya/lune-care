package com.healthcare.appointment.exception;

import com.healthcare.appointment.enums.ErrorCode;

public class AppointmentException extends BaseException {

    public AppointmentException(ErrorCode code) {
        super(code);
    }

    public AppointmentException(ErrorCode code, String message) {
        super(code, message);
    }
}
