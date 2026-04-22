package com.healthcare.patient.exception;

import com.healthcare.patient.enums.ErrorCode;

public class AddressException extends BaseException {

    public AddressException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AddressException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
