package com.healthcare.admin.client;

import com.healthcare.admin.enums.Role;
import com.healthcare.admin.payload.request.UpdateAccountStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "AUTH",
        path = "/api/internal"
)
public interface AuthServiceClient {

    @PatchMapping("/auth/update-status")
    void updateStatus(@RequestBody UpdateAccountStatusRequest request);

    @GetMapping("/users/count")
    int getUsersCountByRole(@RequestParam("role") Role role);
}