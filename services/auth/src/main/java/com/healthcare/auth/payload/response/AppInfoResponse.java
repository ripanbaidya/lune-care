package com.healthcare.auth.payload.response;

public record AppInfoResponse(
        String name,
        String serviceName,
        String version,
        String buildNumber,
        String copyright,
        License license,
        Social social,
        Developer developer
) {
    public record License(
            String name,
            String url
    ) {
    }

    public record Social(
            String github
    ) {
    }

    public record Developer(
            String email
    ) {
    }

}
