package com.healthcare.payment.payload.dto.success;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.springframework.data.domain.Page;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder(value = {"number", "size", "totalElements", "totalPages"})
public record PageInfo(
    int number,
    int size,
    long totalElements,
    int totalPages
) {
    public static PageInfo from(Page<?> page) {
        return new PageInfo(page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}