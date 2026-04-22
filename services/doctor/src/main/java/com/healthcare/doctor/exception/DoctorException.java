package com.healthcare.doctor.exception;

import com.healthcare.doctor.enums.ErrorCode;

public class DoctorException extends BaseException {

    public DoctorException(ErrorCode errorCode) {
        super(errorCode);
    }

    public DoctorException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
