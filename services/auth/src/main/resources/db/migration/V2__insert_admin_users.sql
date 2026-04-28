INSERT INTO users (id,
                   phone_number,
                   password_hash,
                   role,
                   account_status,
                   created_at)
VALUES (gen_random_uuid()::text,
        '9674741683',
        '$2a$10$0QoDBqOMQrEqAYI0AUzxs.WLUtbfWwOioy3Q7P8lFQ2J2EkX8RFWW', -- password123
        'ROLE_ADMIN',
        'ACTIVE',
        NOW())
       ;