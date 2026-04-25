package com.healthcare.auth.util;

import java.util.Optional;

public final class MaskingUtil {

    private static final String MASK_CHAR = "*";

    private MaskingUtil() {
    }

    /**
     * Masks a phone number, preserving only the last 4 digits.
     */
    public static String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return phoneNumber;
        }

        // Remove non-numeric characters to ensure consistent masking length
        String cleanNumber = phoneNumber.replaceAll("[^0-9]", "");

        // If the number is too short to mask properly, return a default mask
        if (cleanNumber.length() <= 4) {
            return "****";
        }

        return maskMiddle(cleanNumber, 0, 4);
    }

    /**
     * Generic middle-masking logic with length validation.
     */
    private static String maskMiddle(String value, int visiblePrefix, int visibleSuffix) {
        String input = Optional.ofNullable(value).orElse("");
        int length = input.length();

        if (length <= (visiblePrefix + visibleSuffix)) {
            return MASK_CHAR.repeat(length);
        }

        int maskLength = length - (visiblePrefix + visibleSuffix);

        StringBuilder sb = new StringBuilder();
        sb.append(input, 0, visiblePrefix);
        sb.repeat(MASK_CHAR, maskLength);
        sb.append(input.substring(length - visibleSuffix));

        return sb.toString();
    }
}