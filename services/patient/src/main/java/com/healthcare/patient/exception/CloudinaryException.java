package com.healthcare.patient.exception;

import com.healthcare.patient.enums.ErrorCode;

public class CloudinaryException extends BaseException {

    public CloudinaryException(ErrorCode errorCode) {
        super(errorCode);
    }

    public CloudinaryException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
