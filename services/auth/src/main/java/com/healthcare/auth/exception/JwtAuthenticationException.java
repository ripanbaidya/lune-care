package com.healthcare.auth.exception;

import com.healthcare.auth.enums.ErrorCode;

public class JwtAuthenticationException extends BaseException {

    public JwtAuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public JwtAuthenticationException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

}