package com.healthcare.gateway.exception;

import com.healthcare.gateway.enums.ErrorCode;

public class KeyLoadException extends BaseException {

    public KeyLoadException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public KeyLoadException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
