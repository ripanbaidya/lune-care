package com.healthcare.feedback.security;

/**
 * Simple holder for the authenticated user's details extracted from
 * gateway-injected headers.
 */
public record UserContext(String userId, String role) {
}