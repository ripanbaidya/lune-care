package com.healthcare.appointment.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rabbitmq")
public record RabbitMQProperties(

        Exchange exchange,
        Queues queues
) {

    public record Exchange(
            String name
    ) {
    }

    public record Queues(
            String notification,
            String payment
    ) {
    }
}
