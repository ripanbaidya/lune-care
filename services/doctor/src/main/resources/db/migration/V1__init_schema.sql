CREATE TABLE clinic_schedules
(
    id          VARCHAR(255)           NOT NULL,
    clinic_id   VARCHAR(255)           NOT NULL,
    day_of_week VARCHAR(10)            NOT NULL,
    start_time  time WITHOUT TIME ZONE NOT NULL,
    end_time    time WITHOUT TIME ZONE NOT NULL,
    is_active   BOOLEAN                NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_clinic_schedules PRIMARY KEY (id)
);

CREATE TABLE clinics
(
    id                            VARCHAR(255)   NOT NULL,
    doctor_id                     VARCHAR(255)   NOT NULL,
    name                          VARCHAR(120)   NOT NULL,
    type                          VARCHAR(30)    NOT NULL,
    consultation_fees             DECIMAL(10, 2) NOT NULL,
    consultation_duration_minutes INTEGER        NOT NULL,
    contact_number                VARCHAR(15),
    is_active                     BOOLEAN        NOT NULL,
    address_line                  VARCHAR(255),
    city                          VARCHAR(80),
    state                         VARCHAR(80),
    pincode                       VARCHAR(10),
    country                       VARCHAR(60),
    created_at                    TIMESTAMP WITHOUT TIME ZONE,
    updated_at                    TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_clinics PRIMARY KEY (id)
);

CREATE TABLE doctor_documents
(
    id                   VARCHAR(255) NOT NULL,
    doctor_id            VARCHAR(255) NOT NULL,
    document_type        VARCHAR(40)  NOT NULL,
    document_url         VARCHAR(255) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    uploaded_at          TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_doctor_documents PRIMARY KEY (id)
);

CREATE TABLE doctor_languages
(
    doctor_profile_id VARCHAR(255) NOT NULL,
    language          VARCHAR(50)
);

CREATE TABLE doctor_profiles
(
    id                  VARCHAR(255) NOT NULL,
    doctor_id           VARCHAR(255) NOT NULL,
    email               VARCHAR(120),
    gender              VARCHAR(10),
    date_of_birth       date,
    specialization      VARCHAR(50),
    qualification       VARCHAR(100),
    years_of_experience INTEGER,
    bio                 VARCHAR(250),
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_doctor_profiles PRIMARY KEY (id)
);

CREATE TABLE doctors
(
    id                   VARCHAR(255) NOT NULL,
    user_id              VARCHAR(255) NOT NULL,
    first_name           VARCHAR(50)  NOT NULL,
    last_name            VARCHAR(50)  NOT NULL,
    phone_number         VARCHAR(15)  NOT NULL,
    profile_photo_url    VARCHAR(255),
    cloudinary_public_id VARCHAR(255),
    account_status       VARCHAR(30),
    onboarding_completed BOOLEAN      NOT NULL,
    document_verified    BOOLEAN      NOT NULL,
    created_at           TIMESTAMP WITHOUT TIME ZONE,
    updated_at           TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_doctors PRIMARY KEY (id)
);

ALTER TABLE doctor_profiles
    ADD CONSTRAINT uc_doctor_profiles_doctor UNIQUE (doctor_id);

ALTER TABLE doctors
    ADD CONSTRAINT uc_doctors_user UNIQUE (user_id);

ALTER TABLE clinic_schedules
    ADD CONSTRAINT uk_clinic_day UNIQUE (clinic_id, day_of_week);

CREATE UNIQUE INDEX idx_doctor_user_id ON doctors (user_id);

ALTER TABLE clinics
    ADD CONSTRAINT FK_CLINICS_ON_DOCTOR FOREIGN KEY (doctor_id) REFERENCES doctors (id);

CREATE INDEX idx_clinic_doctor_id ON clinics (doctor_id);

ALTER TABLE clinic_schedules
    ADD CONSTRAINT FK_CLINIC_SCHEDULES_ON_CLINIC FOREIGN KEY (clinic_id) REFERENCES clinics (id);

ALTER TABLE doctor_documents
    ADD CONSTRAINT FK_DOCTOR_DOCUMENTS_ON_DOCTOR FOREIGN KEY (doctor_id) REFERENCES doctors (id);

CREATE INDEX idx_doctor_document_doctor_id ON doctor_documents (doctor_id);

ALTER TABLE doctor_profiles
    ADD CONSTRAINT FK_DOCTOR_PROFILES_ON_DOCTOR FOREIGN KEY (doctor_id) REFERENCES doctors (id);

ALTER TABLE doctor_languages
    ADD CONSTRAINT fk_doctor_languages_on_doctor_profile FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles (id);