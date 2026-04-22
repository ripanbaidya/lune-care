package com.healthcare.gateway.exception;

import com.healthcare.gateway.enums.ErrorCode;

public class JwtAuthenticationException extends BaseException {

    public JwtAuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public JwtAuthenticationException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}