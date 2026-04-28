package com.healthcare.doctor.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNAUTHENTICATED(ErrorType.AUTHENTICATION, "Authentication is required to access this resource"),
    ACCESS_DENIED(ErrorType.AUTHORIZATION, "You do not have permission to access this resource"),

    /*
     * Doctor
     */
    DOCTOR_NOT_FOUND(ErrorType.NOT_FOUND, "The doctor associated with the provided credentials was not found"),
    DOCTOR_ALREADY_EXISTS(ErrorType.CONFLICT, "A doctor with the provided phone number already exists"),
    DOCTOR_PROFILE_PHOTO_NOT_FOUND(ErrorType.NOT_FOUND, "The doctor's profile photo was not found"),

    /*
     * Cloudinary photo upload
     */
    PHOTO_UPLOAD_FAILED(ErrorType.INTERNAL, "Failed to upload the photo. Please try again later"),
    PHOTO_DELETION_FAILED(ErrorType.INTERNAL, "Failed to delete the photo. Please try again later"),

    /*
     * Clinic
     */
    CLINIC_NOT_FOUND(ErrorType.NOT_FOUND, "The clinic associated with the doctor was not found"),

    /*
     * Onboarding
     */
    ONBOARDING_ALREADY_COMPLETED(ErrorType.CONFLICT, "Onboarding already completed"),

    /**
     * Document
     */
    NO_FILE_PROVIDED(ErrorType.VALIDATION, "No file provided"),
    DOCTOR_DOCUMENT_NOT_FOUND(ErrorType.NOT_FOUND, "Doctor document not found"),

    // General
    VALIDATION_FAILED(ErrorType.VALIDATION, "One or more request fields are invalid"),
    INTERNAL_ERROR(ErrorType.INTERNAL, "An unexpected internal server error occurred"),
    SERVICE_UNAVAILABLE(ErrorType.SERVICE_UNAVAILABLE, "The service is temporarily unavailable. Please try again later"),
    REMOTE_SERVICE_FAILURE(ErrorType.INTERNAL, "Failed to communicate with remote service"),

    CLINIC_SCHEDULE_NOT_FOUND(ErrorType.NOT_FOUND, "Clinic schedule not found for the provided date");

    private final ErrorType type;
    private final String defaultMessage;
}