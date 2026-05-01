CREATE TABLE appointments
(
    id                  VARCHAR(255)           NOT NULL,
    patient_id          VARCHAR(255)           NOT NULL,
    doctor_id           VARCHAR(255)           NOT NULL,
    clinic_id           VARCHAR(255)           NOT NULL,
    slot_id             VARCHAR(255)           NOT NULL,
    appointment_date    date                   NOT NULL,
    start_time          time WITHOUT TIME ZONE NOT NULL,
    end_time            time WITHOUT TIME ZONE NOT NULL,
    status              VARCHAR(25)            NOT NULL,
    consultation_fees   DECIMAL(10, 2)         NOT NULL,
    payment_id          VARCHAR(255),
    cancellation_reason VARCHAR(255),
    cancelled_by        VARCHAR(10),
    version             BIGINT                 NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE,
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_appointments PRIMARY KEY (id)
);

CREATE TABLE slots
(
    id         VARCHAR(255)           NOT NULL,
    doctor_id  VARCHAR(255)           NOT NULL,
    clinic_id  VARCHAR(255)           NOT NULL,
    slot_date  date                   NOT NULL,
    start_time time WITHOUT TIME ZONE NOT NULL,
    end_time   time WITHOUT TIME ZONE NOT NULL,
    status     VARCHAR(20)            NOT NULL,
    version    BIGINT                 NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_slots PRIMARY KEY (id)
);

ALTER TABLE slots
    ADD CONSTRAINT uk_slot_doctor_clinic_date_time UNIQUE (doctor_id, clinic_id, slot_date, start_time);

CREATE INDEX idx_appointment_date ON appointments (appointment_date);

CREATE INDEX idx_appointment_doctor_id ON appointments (doctor_id);

CREATE INDEX idx_appointment_patient_id ON appointments (patient_id);

CREATE INDEX idx_appointment_status ON appointments (status);

CREATE INDEX idx_slot_doctor_clinic_date ON slots (doctor_id, clinic_id, slot_date);

CREATE INDEX idx_slot_status ON slots (status);