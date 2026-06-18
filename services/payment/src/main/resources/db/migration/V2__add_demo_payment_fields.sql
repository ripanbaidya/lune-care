ALTER TABLE payment_gateway_details
    ADD COLUMN demo_session_id VARCHAR(255);

ALTER TABLE payment_gateway_details
    ADD CONSTRAINT uc_payment_gateway_details_demo_session UNIQUE (demo_session_id);
