package com.healthcare.doctor.exception;

import com.healthcare.doctor.enums.ErrorCode;

public class CloudinaryException extends BaseException {

    public CloudinaryException(ErrorCode errorCode) {
        super(errorCode);
    }

    public CloudinaryException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
