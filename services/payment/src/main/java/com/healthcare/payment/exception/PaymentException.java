package com.healthcare.payment.exception;

import com.healthcare.payment.enums.ErrorCode;

public class PaymentException extends BaseException {

    public PaymentException(ErrorCode errorCode) {
        super(errorCode);
    }

    public PaymentException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}