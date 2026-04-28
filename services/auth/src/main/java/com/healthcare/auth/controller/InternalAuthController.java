package com.healthcare.auth.controller;

import com.healthcare.auth.payload.request.UpdateAccountStatusRequest;
import com.healthcare.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/auth")
@RequiredArgsConstructor
public class InternalAuthController {

    private final UserService userService;

    @PatchMapping("/update-status")
    public ResponseEntity<Void> updateStatus(
            @Valid @RequestBody UpdateAccountStatusRequest request
    ) {
        userService.updateUserStatus(request.userId(), request.newStatus());
        return ResponseEntity.ok().build();
    }
}