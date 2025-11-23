-- CreateTable
CREATE TABLE "roles" (
    "role_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGINT NOT NULL DEFAULT 0,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "full_name" VARCHAR(200),
    "is_admin" INTEGER NOT NULL DEFAULT 0,
    "phone" VARCHAR(20),
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_permissions_id" BIGINT NOT NULL DEFAULT 0,
    "role_id" INTEGER NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "field_name" VARCHAR(100),
    "can_access" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_permissions_id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "doctor_id" BIGINT NOT NULL DEFAULT 0,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "specialty" VARCHAR(255) NOT NULL,
    "experience" SMALLINT,
    "qualification" VARCHAR(500),
    "image" VARCHAR(500),
    "bio" VARCHAR(1000),
    "consultation_fee" DECIMAL(10,2) DEFAULT 0,
    "follow_up_fee" DECIMAL(10,0),
    "is_available" INTEGER NOT NULL DEFAULT 1,
    "availability_updated_at" TIMESTAMP(6),

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "patients" (
    "patient_id" BIGINT NOT NULL DEFAULT 0,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "date_of_birth" DATE,
    "gender" VARCHAR(10),
    "address" VARCHAR(500),
    "occupation" VARCHAR(255),
    "emergency_contact_name" VARCHAR(255),
    "emergency_contact_number" VARCHAR(20),
    "primary_physician" BIGINT,
    "insurance_provider" VARCHAR(255),
    "insurance_policy_number" VARCHAR(100),
    "allergies" VARCHAR(1000),
    "current_medication" VARCHAR(1000),
    "family_medical_history" VARCHAR(1000),
    "past_medical_history" VARCHAR(1000),
    "identification_type" VARCHAR(50),
    "identification_number" VARCHAR(100),
    "identification_document" BYTEA,
    "privacy_consent" INTEGER NOT NULL DEFAULT 0,
    "treatment_consent" INTEGER NOT NULL DEFAULT 0,
    "disclosure_consent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" BIGINT NOT NULL DEFAULT 0,
    "patient_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "appointment_type" VARCHAR(20) NOT NULL DEFAULT 'consultation',
    "schedule" TIMESTAMP(6) NOT NULL,
    "schedule_at" VARCHAR(10),
    "reason" VARCHAR(500) NOT NULL,
    "note" VARCHAR(1000),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "cancellation_reason" VARCHAR(500),
    "payment_method" VARCHAR(50),
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    "payment_amount" DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "schedule_id" BIGINT NOT NULL DEFAULT 0,
    "doctor_id" BIGINT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(8) NOT NULL,
    "end_time" VARCHAR(8) NOT NULL,
    "slot_duration" INTEGER NOT NULL DEFAULT 30,
    "is_available" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "medicalrecord_id" BIGINT NOT NULL DEFAULT 0,
    "patient_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "diagnosis" VARCHAR(1000),
    "symptoms" VARCHAR(4000),
    "medications" VARCHAR(4000),
    "treatmentplan" VARCHAR(2000),
    "notes" VARCHAR(2000),
    "blood_pressure" VARCHAR(20),
    "temperature" DECIMAL(4,2),
    "images" VARCHAR(4000),
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("medicalrecord_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT,
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" BIGINT,
    "details" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL,
    "error_message" VARCHAR(1000),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_subject_action_field_name_key" ON "role_permissions"("role_id", "subject", "action", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_phone_key" ON "doctors"("phone");

-- CreateIndex
CREATE INDEX "doctors_is_available_idx" ON "doctors"("is_available");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phone_key" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "appointments_appointment_type_idx" ON "appointments"("appointment_type");

-- CreateIndex
CREATE INDEX "appointments_payment_status_idx" ON "appointments"("payment_status");

-- CreateIndex
CREATE INDEX "appointments_status_payment_status_idx" ON "appointments"("status", "payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_id_schedule_schedule_at_key" ON "appointments"("doctor_id", "schedule", "schedule_at");

-- CreateIndex
CREATE INDEX "doctor_schedules_doctor_id_idx" ON "doctor_schedules"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_schedules_day_of_week_idx" ON "doctor_schedules"("day_of_week");

-- CreateIndex
CREATE INDEX "doctor_schedules_is_available_idx" ON "doctor_schedules"("is_available");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_doctor_id_idx" ON "medical_records"("doctor_id");

-- CreateIndex
CREATE INDEX "medical_records_created_at_idx" ON "medical_records"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs"("resource_type");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_primary_physician_fkey" FOREIGN KEY ("primary_physician") REFERENCES "doctors"("doctor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
