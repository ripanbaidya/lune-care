CREATE TABLE address
(
    id           VARCHAR(255) NOT NULL,
    address_line VARCHAR(255),
    city         VARCHAR(255),
    state        VARCHAR(255),
    pincode      VARCHAR(10),
    country      VARCHAR(60),
    CONSTRAINT pk_address PRIMARY KEY (id)
);

CREATE TABLE patients
(
    id                   VARCHAR(255) NOT NULL,
    user_id              VARCHAR(255) NOT NULL,
    first_name           VARCHAR(50)  NOT NULL,
    last_name            VARCHAR(50)  NOT NULL,
    phone_number         VARCHAR(10)  NOT NULL,
    email                VARCHAR(120),
    date_of_birth        date,
    gender               VARCHAR(10),
    blood_group          VARCHAR(15),
    profile_photo_url    VARCHAR(255),
    cloudinary_public_id VARCHAR(255),
    address_id           VARCHAR(255),
    created_at           TIMESTAMP WITHOUT TIME ZONE,
    updated_at           TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_patients PRIMARY KEY (id)
);

ALTER TABLE patients
    ADD CONSTRAINT uc_patients_address UNIQUE (address_id);

ALTER TABLE patients
    ADD CONSTRAINT uc_patients_phone_number UNIQUE (phone_number);

ALTER TABLE patients
    ADD CONSTRAINT uc_patients_user UNIQUE (user_id);

CREATE UNIQUE INDEX idx_patient_user_id ON patients (user_id);

ALTER TABLE patients
    ADD CONSTRAINT FK_PATIENTS_ON_ADDRESS FOREIGN KEY (address_id) REFERENCES address (id);