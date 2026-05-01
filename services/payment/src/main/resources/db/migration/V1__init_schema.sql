CREATE TABLE payment_gateway_details
(
    id                       VARCHAR(255) NOT NULL,
    payment_record_id        VARCHAR(255) NOT NULL,
    razorpay_order_id        VARCHAR(255),
    razorpay_payment_id      VARCHAR(255),
    razorpay_refund_id       VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    client_secret            VARCHAR(255),
    stripe_refund_id         VARCHAR(255),
    CONSTRAINT pk_payment_gateway_details PRIMARY KEY (id)
);

CREATE TABLE payment_records
(
    id             VARCHAR(255)   NOT NULL,
    appointment_id VARCHAR(255)   NOT NULL,
    patient_id     VARCHAR(255)   NOT NULL,
    doctor_id      VARCHAR(255)   NOT NULL,
    amount         DECIMAL(10, 2) NOT NULL,
    currency       VARCHAR(10)    NOT NULL,
    status         VARCHAR(20)    NOT NULL,
    gateway        VARCHAR(20)    NOT NULL,
    failure_reason VARCHAR(255),
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_payment_records PRIMARY KEY (id)
);

ALTER TABLE payment_gateway_details
    ADD CONSTRAINT uc_payment_gateway_details_payment_record UNIQUE (payment_record_id);

ALTER TABLE payment_gateway_details
    ADD CONSTRAINT uc_payment_gateway_details_razorpay_order UNIQUE (razorpay_order_id);

ALTER TABLE payment_gateway_details
    ADD CONSTRAINT uc_payment_gateway_details_stripe_payment_intent UNIQUE (stripe_payment_intent_id);

ALTER TABLE payment_records
    ADD CONSTRAINT uc_payment_records_appointment UNIQUE (appointment_id);

CREATE UNIQUE INDEX idx_payment_appointment_id ON payment_records (appointment_id);

CREATE INDEX idx_payment_patient_id ON payment_records (patient_id);

CREATE INDEX idx_payment_status ON payment_records (status);

ALTER TABLE payment_gateway_details
    ADD CONSTRAINT FK_PAYMENT_GATEWAY_DETAILS_ON_PAYMENT_RECORD FOREIGN KEY (payment_record_id) REFERENCES payment_records (id);