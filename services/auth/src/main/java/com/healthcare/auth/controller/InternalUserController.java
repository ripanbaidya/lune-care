package com.healthcare.auth.controller;

import com.healthcare.auth.enums.Role;
import com.healthcare.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/count")
    public ResponseEntity<Integer> getUsersCountByRole(
            @RequestParam("role") Role role
    ) {
        return ResponseEntity.ok(userService.countUsersByRole(role));
    }
}