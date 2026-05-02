# LuneCare Healthcare

## Docker ports

- redis: 6379
- auth_db: 5453
- patient_db: 5454
- doctor_db: 5455

## Microservices Architecture

| Service              | HTTP Port | DB Port | Database   | Description                                                                                      |
|----------------------|-----------|---------|------------|--------------------------------------------------------------------------------------------------|
| config-server        | 8888      |         | —          | Centralized configuration for all microservices                                                  |
| eureka-server        | 8761      |         | —          | Service registry and discovery                                                                   |
| api-gateway          | 8080      |         | —          | Single entry point, JWT validation, routing, rate limiting                                       |
| auth-service         | 8081      | 5433    | PostgreSQL | Identity provider — handles register, login, logout, refresh token, JWT issuance                 |
| patient-service      | 8082      | 5434    | PostgreSQL | Patient registration via Feign Call from auth-service, profile management, profile photo upload  |
| doctor-service       | 8083      | 5435    | PostgreSQL | Doctor registration via Feign Call, onboarding, clinic info (multiple), department/fees and info |
| appointment-service  | 8084      | 5436    | PostgreSQL | Slot management, booking with concurrency control, SAGA orchestration                            |
| payment-service      | 8085      | 5437    | PostgreSQL | Razorpay + Stripe via strategy pattern, payment history, cash automation                         |
| notification-service | 8086      | 27018   | MongoDB    | WebSocket real-time notifications, Kafka consumer, notification history                          |
| feedback-service     | 8087      | 27019   | MongoDB    | Patient and doctor feedback, ratings, category-based reviews                                     |
| admin-service        | 8088      |         | PostgreSQL | Doctor verification (future), platform-wide search, analytics                                    |

## Complete API Design — All Services

### auth-service — port 8081

| Method | Endpoint                     | Description                                               |
|--------|------------------------------|-----------------------------------------------------------|
| POST   | /api/auth/register/patient   | Register a new patient, returns JWT                       |
| POST   | /api/auth/register/doctor    | Register a new doctor with ONBOARDING status, returns JWT |
| POST   | /api/auth/login              | Single login for all roles, returns JWT                   |
| POST   | /api/auth/logout             | Blacklists the token in Redis, server-side logout         |
| POST   | /api/auth/refresh-token      | Issues new JWT with latest status from DB                 |
| PATCH  | /internal/auth/update-status | Called by doctor-service to flip status after onboarding  |

### patient-service — port 8082

| Method | Endpoint                         | Description                                               |
|--------|----------------------------------|-----------------------------------------------------------|
| POST   | /internal/patient/create-profile | Called by auth-service after patient registers            |
| GET    | /api/patient/profile             | Get own profile details                                   |
| PUT    | /api/patient/profile             | Update personal info (name, DOB, blood group, address)    |
| PATCH  | /api/patient/profile/photo       | Upload or update profile photo via Cloudinary             |
| GET    | /api/patient/doctors/search      | Search doctors by name, specialization, city, fees range  |
| GET    | /api/patient/doctors/{doctorId}  | View a doctor's full public profile with clinics and fees |
| POST   | /api/patient/addresses           | Add address for patient                                   |
| GET    | /api/patient/addresses           | Get address                                               |
| PATCH  | /api/patient/addresses           | Update address                                            |
| DELETE | /api/patient/addresses           | delete address                                            |

### doctor-service — port 8083

| Method | Endpoint                                | Description                                                  |
|--------|-----------------------------------------|--------------------------------------------------------------|
| POST   | /internal/doctor/create-profile         | Called by auth-service after doctor registers                |
| GET    | /api/doctor/profile                     | Get own full profile                                         |
| PUT    | /api/doctor/profile                     | Update personal and professional info                        |
| PATCH  | /api/doctor/profile/photo               | Upload or update profile photo via Cloudinary                |
| POST   | /api/doctor/onboarding/complete         | Submit onboarding info and documents, triggers status update |
| POST   | /api/doctor/clinics                     | Add a new clinic with address, fees, contact info            |
| GET    | /api/doctor/clinics                     | Get all clinics owned by the logged-in doctor                |
| PUT    | /api/doctor/clinics/{clinicId}          | Update a clinic's details                                    |
| DELETE | /api/doctor/clinics/{clinicId}          | Remove a clinic                                              |
| POST   | /api/doctor/clinics/{clinicId}/schedule | Set weekly recurring schedule for a clinic                   |
| GET    | /api/doctor/clinics/{clinicId}/schedule | Get current weekly schedule for a clinic                     |
| PUT    | /api/doctor/clinics/{clinicId}/schedule | Update weekly schedule, triggers slot regeneration           |
| GET    | /api/doctor/search                      | Public search — patients call this via patient-service Feign |
| GET    | /api/doctor/{doctorId}/public           | Public profile of a specific doctor                          |

### appointment-service — port 8084

| Method | Endpoint                                     | Description                                                   |
|--------|----------------------------------------------|---------------------------------------------------------------|
| GET    | /api/appointment/slots/{doctorId}/{clinicId} | Get available slots for a doctor at a clinic for a given date |
| POST   | /api/appointment/book                        | Patient books a slot, triggers concurrency lock via Redis     |
| GET    | /api/appointment/{appointmentId}             | Get full appointment details                                  |
| PATCH  | /api/appointment/{appointmentId}/cancel      | Patient or doctor cancels, triggers refund flow               |
| PATCH  | /api/appointment/{appointmentId}/complete    | Doctor marks appointment as completed                         |
| PATCH  | /api/appointment/{appointmentId}/no-show     | Doctor marks patient as no-show                               |
| GET    | /api/appointment/patient/history             | Patient views their full appointment history with filters     |
| GET    | /api/appointment/doctor/today                | Doctor views all appointments for today across all clinics    |
| GET    | /api/appointment/doctor/history              | Doctor views full appointment history with filters            |

### payment-service — port 8085

| Method | Endpoint                            | Description                                                   |
|--------|-------------------------------------|---------------------------------------------------------------|
| POST   | /api/payment/initiate               | Creates a Razorpay order, returns order ID to frontend        |
| POST   | /api/payment/verify                 | Verifies Razorpay signature after frontend payment completion |
| GET    | /api/payment/history                | Patient views their full payment history                      |
| GET    | /api/payment/{paymentId}            | Get details of a specific payment                             |
| POST   | /api/payment/refund/{appointmentId} | Initiates Razorpay refund when appointment is cancelled       |

### notification-service — port 8086

| Method | Endpoint                                | Description                                  |
|--------|-----------------------------------------|----------------------------------------------|
| GET    | /api/notification                       | Get all notifications for the logged-in user |
| GET    | /api/notification/unread-count          | Get count of unread notifications            |
| PATCH  | /api/notification/{notificationId}/read | Mark a single notification as read           |
| PATCH  | /api/notification/read-all              | Mark all notifications as read               |

* Will use Firebase Cloud Messaging for real-time notifications.

### feedback-service — port 8087

| Method | Endpoint                        | Description                                                     |
|--------|---------------------------------|-----------------------------------------------------------------|
| POST   | /api/feedback/doctor/{doctorId} | Patient submits rating and review for a doctor post-appointment |
| GET    | /api/feedback/doctor/{doctorId} | Get all feedback for a specific doctor (public)                 |
| GET    | /api/feedback/patient/my        | Patient views all feedback they have submitted                  |
| GET    | /api/feedback/doctor/my         | Doctor views all feedback they have received                    |

### admin-service — port 8088

| Method | Endpoint                                | Description                                              |
|--------|-----------------------------------------|----------------------------------------------------------|
| GET    | /api/admin/doctors/pending              | List all doctors with PENDING_VERIFICATION status        |
| PATCH  | /api/admin/doctors/{doctorId}/verify    | Approve a doctor, triggers status update in auth-service |
| PATCH  | /api/admin/doctors/{doctorId}/reject    | Reject a doctor with a reason                            |
| PATCH  | /api/admin/doctors/{doctorId}/suspend   | Suspend a doctor account                                 |
| PATCH  | /api/admin/patients/{patientId}/suspend | Suspend a patient account                                |
| GET    | /api/admin/analytics/overview           | Platform stats — total users, appointments, revenue      |
| GET    | /api/admin/users                        | List all users with filters by role and status           |