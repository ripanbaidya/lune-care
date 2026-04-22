package com.healthcare.auth.controller;

import com.healthcare.auth.payload.request.UpdateAccountStatusRequest;
import com.healthcare.auth.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(
        name = "Internal Auth",
        description = "Internal authentication endpoints for service-to-service communication"
)
@RestController
@RequestMapping("/api/internal/auth")
@RequiredArgsConstructor
public class InternalAuthController {

    private final AuthService authService;

    /**
     * This endpoint updates the account status of a user.
     * Used by other services internally
     */
    @PatchMapping("/update-status")
    public ResponseEntity<Void> updateStatus(
            @Valid @RequestBody UpdateAccountStatusRequest request
    ) {

        authService.updateUserStatus(request.userId(), request.newStatus());

        return ResponseEntity.ok().build();
    }

}