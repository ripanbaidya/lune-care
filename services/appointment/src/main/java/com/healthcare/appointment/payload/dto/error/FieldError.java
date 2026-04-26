package com.healthcare.appointment.payload.dto.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"field", "message"})
public record FieldError(
        String field,
        String message
) {
}