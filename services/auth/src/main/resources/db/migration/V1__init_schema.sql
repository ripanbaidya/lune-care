CREATE TABLE refresh_token
(
    id         VARCHAR(255) NOT NULL,
    token      TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked    BOOLEAN      NOT NULL,
    revoked_at TIMESTAMP WITHOUT TIME ZONE,
    user_id    VARCHAR(255) NOT NULL,
    CONSTRAINT pk_refresh_token PRIMARY KEY (id)
);

CREATE TABLE users
(
    id             VARCHAR(255) NOT NULL,
    phone_number   VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(255) NOT NULL,
    account_status VARCHAR(255) NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT chk_users_role CHECK (
        role IN ('ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_ADMIN')
        ),
    CONSTRAINT chk_users_account_status CHECK (
        account_status IN ('INACTIVE', 'ACTIVE', 'ONBOARDING', 'PENDING_VERIFICATION', 'SUSPENDED')
        )
);

ALTER TABLE refresh_token
    ADD CONSTRAINT uc_refresh_token_token UNIQUE (token);

ALTER TABLE users
    ADD CONSTRAINT uc_users_phone_number UNIQUE (phone_number);

CREATE INDEX idx_users_phone_number ON users (phone_number);

ALTER TABLE refresh_token
    ADD CONSTRAINT FK_REFRESH_TOKEN_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_refresh_token_user ON refresh_token (user_id);