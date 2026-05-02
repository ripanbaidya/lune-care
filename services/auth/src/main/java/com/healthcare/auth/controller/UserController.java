package com.healthcare.auth.controller;

import com.healthcare.auth.enums.ErrorCode;
import com.healthcare.auth.exception.AuthException;
import com.healthcare.auth.payload.dto.success.ResponseWrapper;
import com.healthcare.auth.payload.request.LogoutRequest;
import com.healthcare.auth.payload.response.UserProfileResponse;
import com.healthcare.auth.service.AuthService;
import com.healthcare.auth.service.UserService;
import com.healthcare.auth.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Tag(name = "User", description = "Endpoints for user session and profile management")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class UserController {

    private final AuthService authService;
    private final UserService userService;

    @Operation(
            summary = "Logout",
            description = "Revokes the refresh token and invalidates the current session"
    )
    @ApiResponse(responseCode = "204", description = "Logged out successfully")
    @ApiResponse(responseCode = "400", description = "Invalid or missing Authorization header")
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

    @Operation(
            summary = "Get current user profile",
            description = "Returns profile details of the currently authenticated user"
    )
    @ApiResponse(responseCode = "200", description = "User fetched successfully")
    @GetMapping("/me")
    public ResponseEntity<ResponseWrapper<UserProfileResponse>> getUser(
            @AuthenticationPrincipal String userId
    ) {
        var response = userService.getUser(userId);
        return ResponseUtil.ok("User fetched Successfully", response);
    }
}