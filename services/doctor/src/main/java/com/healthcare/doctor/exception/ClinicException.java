package com.healthcare.doctor.exception;

import com.healthcare.doctor.enums.ErrorCode;

public class ClinicException extends BaseException {

    public ClinicException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ClinicException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
