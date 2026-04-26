package com.healthcare.appointment.exception;

import com.healthcare.appointment.enums.ErrorCode;

public class SlotException extends BaseException {

    public SlotException(ErrorCode code) {
        super(code);
    }

    public SlotException(ErrorCode code, String message) {
        super(code, message);
    }
}
