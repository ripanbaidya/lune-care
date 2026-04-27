package com.healthcare.feedback.exception;

import com.healthcare.feedback.enums.ErrorCode;

public class FeedbackException extends BaseException {

    public FeedbackException(ErrorCode errorCode) {
        super(errorCode);
    }

    public FeedbackException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}