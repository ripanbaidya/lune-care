package com.healthcare.feedback.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    private static final String ROUTING_COMPLETED = "appointment.completed";

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.queues.appointment-completed}")
    private String appointmentCompletedQueue;

    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public Queue feedbackAppointmentCompletedQueue() {
        return QueueBuilder.durable(appointmentCompletedQueue).build();
    }

    @Bean
    public Binding appointmentCompletedBinding() {
        return BindingBuilder
                .bind(feedbackAppointmentCompletedQueue())
                .to(appointmentExchange())
                .with(ROUTING_COMPLETED);
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