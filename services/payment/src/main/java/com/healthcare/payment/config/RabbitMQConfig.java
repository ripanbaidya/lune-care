package com.healthcare.payment.config;

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

    private static final String ROUTING_CANCELLED = "appointment.cancelled";

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.queues.appointment-cancelled}")
    private String appointmentCancelledQueue;

    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public Queue paymentAppointmentCancelledQueue() {
        return QueueBuilder.durable(appointmentCancelledQueue).build();
    }

    @Bean
    public Binding cancelledBinding() {
        return BindingBuilder
                .bind(paymentAppointmentCancelledQueue())
                .to(appointmentExchange())
                .with(ROUTING_CANCELLED);
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
