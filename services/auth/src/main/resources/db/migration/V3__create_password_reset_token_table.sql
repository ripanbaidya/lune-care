CREATE TABLE password_reset_token (
    id           VARCHAR(36) PRIMARY KEY,
    user_id      VARCHAR(36) NOT NULL,
    token_hash   VARCHAR(64) NOT NULL UNIQUE,
    expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    used_at      TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_password_reset_token_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_token_user
    ON password_reset_token (user_id);

CREATE INDEX idx_password_reset_token_hash
    ON password_reset_token (token_hash);
