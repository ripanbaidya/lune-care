package com.healthcare.auth.exception;

import com.healthcare.auth.enums.ErrorCode;

public class DownstreamServiceException extends BaseException {

    public DownstreamServiceException(ErrorCode errorCode) {
        super(errorCode);
    }

    public DownstreamServiceException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
