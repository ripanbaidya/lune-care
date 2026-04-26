package com.healthcare.appointment.config;

import com.healthcare.appointment.config.properties.RabbitMQProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class RabbitMQConfig {

    // Routing keys
    private static final String ROUTING_ALL_EVENTS = "appointment.#";
    private static final String ROUTING_CONFIRMED = "appointment.confirmed";
    private static final String ROUTING_CANCELLED = "appointment.cancelled";

    private final RabbitMQProperties rabbitMQProperties;

    /**
     * Topic exchange - used for routing messages to queues.
     * <p>It allows wildcard routing keys:</p>
     * {@code appointment.*} - matches any single word routing key after appointment <br>
     * {@code appointment.#} - matches any number of words
     *
     * @return TopicExchange
     */
    @Bean
    public TopicExchange appointmentExchange() {
        return new TopicExchange(rabbitMQProperties.exchange().name(), true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(rabbitMQProperties.queues().notification()).build();
    }

    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable(rabbitMQProperties.queues().payment()).build();
    }

    /* Binding - connects queues and exchanges */

    @Bean
    public Binding notificationBinding() {
        return bind(notificationQueue(), ROUTING_ALL_EVENTS);
    }

    @Bean
    public Binding paymentConfirmedBinding() {
        return bind(paymentQueue(), ROUTING_CONFIRMED);
    }

    @Bean
    public Binding paymentCancelledBinding() {
        return bind(paymentQueue(), ROUTING_CANCELLED);
    }

    /* Message Converter */

    /**
     * Use JSON serialization — events are serialized as JSON, not Java binary.
     * This allows non-Java consumers (future Node.js services, etc.) to consume events.
     */
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

    /*
     * Helpers
     */
    private Binding bind(Queue queue, String routingKey) {
        return BindingBuilder.bind(queue).to(appointmentExchange()).with(routingKey);
    }
}
