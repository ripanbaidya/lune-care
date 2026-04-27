package com.healthcare.notification.exception;

import com.healthcare.notification.enums.ErrorCode;

public class NotificationException extends BaseException {

    public NotificationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public NotificationException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}