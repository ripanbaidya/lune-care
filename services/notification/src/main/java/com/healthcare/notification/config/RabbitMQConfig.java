package com.healthcare.notification.config;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class RabbitMQConfig {

    /**
     * Wildcard routing key — catches every event published by appointment-service:
     * appointment.confirmed, appointment.cancelled, appointment.completed etc.
     * Future appointment events are received automatically with no config change.
     */
    private static final String ROUTING_ALL_APPOINTMENT_EVENTS = "appointment.#";

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.queues.appointment-events}")
    private String appointmentEventsQueue;

    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public Queue notificationAppointmentEventsQueue() {
        return QueueBuilder.durable(appointmentEventsQueue).build();
    }

    @Bean
    public Binding appointmentEventsBinding() {
        return BindingBuilder
                .bind(notificationAppointmentEventsQueue())
                .to(appointmentExchange())
                .with(ROUTING_ALL_APPOINTMENT_EVENTS);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}