package com.healthcare.doctor.client;

import com.healthcare.doctor.payload.dto.auth.UpdateAccountStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "AUTH")
public interface AuthServiceClient {

    @PatchMapping("/api/internal/auth/update-status")
    void updateStatus(@RequestBody UpdateAccountStatusRequest request);
}
