package com.healthcare.payment.payload.response;

import com.healthcare.payment.enums.PaymentGatewayType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Payment configuration exposed to the frontend")
public record PaymentConfigResponse(
        @Schema(description = "Whether demo payment mode is enabled")
        boolean demoPaymentEnabled,

        @Schema(description = "Gateways currently available to the user")
        List<PaymentGatewayType> supportedGateways
) {
}
