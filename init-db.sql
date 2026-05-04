-- init-db.sql
-- Auto-executed by PostgreSQL on the first container boot.
-- Creates isolated schemas for each service.
-- Flyway in each service manages table creation within its schema.

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS patient;
CREATE SCHEMA IF NOT EXISTS doctor;
CREATE SCHEMA IF NOT EXISTS appointment;
CREATE SCHEMA IF NOT EXISTS payment;