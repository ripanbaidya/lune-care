package com.healthcare.admin.exception;

import com.healthcare.admin.enums.ErrorCode;

public class AdminException extends BusinessException {

    public AdminException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AdminException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}