/*
  Warnings:

  - You are about to alter the column `follow_up_fee` on the `doctors` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal(10,2)`.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_fkey";

-- AlterTable
CREATE SEQUENCE appointments_appointment_id_seq;
ALTER TABLE "appointments" ALTER COLUMN "appointment_id" SET DEFAULT nextval('appointments_appointment_id_seq');
ALTER SEQUENCE appointments_appointment_id_seq OWNED BY "appointments"."appointment_id";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
CREATE SEQUENCE doctor_schedules_schedule_id_seq;
ALTER TABLE "doctor_schedules" ALTER COLUMN "schedule_id" SET DEFAULT nextval('doctor_schedules_schedule_id_seq'),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE doctor_schedules_schedule_id_seq OWNED BY "doctor_schedules"."schedule_id";

-- AlterTable
CREATE SEQUENCE doctors_doctor_id_seq;
ALTER TABLE "doctors" ALTER COLUMN "doctor_id" SET DEFAULT nextval('doctors_doctor_id_seq'),
ALTER COLUMN "follow_up_fee" SET DEFAULT 0,
ALTER COLUMN "follow_up_fee" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "availability_updated_at" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE doctors_doctor_id_seq OWNED BY "doctors"."doctor_id";

-- AlterTable
CREATE SEQUENCE invoices_invoice_id_seq;
ALTER TABLE "invoices" ALTER COLUMN "invoice_id" SET DEFAULT nextval('invoices_invoice_id_seq'),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE invoices_invoice_id_seq OWNED BY "invoices"."invoice_id";

-- AlterTable
CREATE SEQUENCE medical_records_medicalrecord_id_seq;
ALTER TABLE "medical_records" ALTER COLUMN "medicalrecord_id" SET DEFAULT nextval('medical_records_medicalrecord_id_seq'),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE medical_records_medicalrecord_id_seq OWNED BY "medical_records"."medicalrecord_id";

-- AlterTable
CREATE SEQUENCE patients_patient_id_seq;
ALTER TABLE "patients" ALTER COLUMN "patient_id" SET DEFAULT nextval('patients_patient_id_seq');
ALTER SEQUENCE patients_patient_id_seq OWNED BY "patients"."patient_id";

-- AlterTable
CREATE SEQUENCE role_permissions_role_permissions_id_seq;
ALTER TABLE "role_permissions" ALTER COLUMN "role_permissions_id" SET DEFAULT nextval('role_permissions_role_permissions_id_seq'),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE role_permissions_role_permissions_id_seq OWNED BY "role_permissions"."role_permissions_id";

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
CREATE SEQUENCE users_user_id_seq;
ALTER TABLE "users" ALTER COLUMN "user_id" SET DEFAULT nextval('users_user_id_seq'),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);
ALTER SEQUENCE users_user_id_seq OWNED BY "users"."user_id";

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;
