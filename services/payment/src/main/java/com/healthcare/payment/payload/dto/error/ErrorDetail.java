package com.healthcare.payment.payload.dto.error;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.healthcare.payment.enums.ErrorCode;
import com.healthcare.payment.enums.ErrorType;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorDetail(
        String type,
        String code,
        String message,
        int status,
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Instant timestamp,
        String path,
        List<FieldError> errors
) {
    public static class Builder {
        private ErrorType type;
        private String code;
        private String message;
        private String path;
        private List<FieldError> errors;

        public Builder code(ErrorCode errorCode) {
            this.type = errorCode.getType();
            this.code = errorCode.name();
            this.message = errorCode.getDefaultMessage();
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder errors(List<FieldError> errors) {
            this.errors = errors;
            return this;
        }

        public ErrorDetail build() {
            if (type == null || code == null) {
                throw new IllegalStateException("ErrorDetail requires a code — call .code(ErrorCode) before .build()");
            }
            return new ErrorDetail(
                    type.name(),
                    code,
                    message,
                    type.getStatusCode(),
                    Instant.now(),
                    path,
                    errors
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}