package com.healthcare.auth.controller;

import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.payload.dto.success.ResponseWrapper;
import com.healthcare.auth.payload.request.LogoutRequest;
import com.healthcare.auth.payload.response.UserProfileResponse;
import com.healthcare.auth.service.AuthService;
import com.healthcare.auth.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody LogoutRequest request
    ) {

        String accessToken = Optional.ofNullable(authHeader)
                .filter(s -> s.startsWith("Bearer "))
                .map(s -> s.substring(7))
                .orElseThrow(() -> new AuthException(ErrorCode.INVALID_AUTH_HEADER));

        authService.logout(accessToken, request.refreshToken());
        return ResponseUtil.noContent();
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseWrapper<UserProfileResponse>> getUser(
            @AuthenticationPrincipal String userId
    ) {
        var response = authService.getUser(userId);
        return ResponseUtil.ok("User fetched Successfully", response);
    }
}