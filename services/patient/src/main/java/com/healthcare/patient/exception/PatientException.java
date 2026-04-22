package com.healthcare.patient.exception;

import com.healthcare.patient.enums.ErrorCode;

public class PatientException extends BaseException {

    public PatientException(ErrorCode errorCode) {
        super(errorCode);
    }

    public PatientException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
