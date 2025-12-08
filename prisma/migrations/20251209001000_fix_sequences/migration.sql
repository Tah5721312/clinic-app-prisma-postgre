-- Fix broken identity/sequence defaults for appointments and audit logs

-- Appointments: ensure appointment_id uses a sequence instead of default 0
ALTER TABLE "appointments"
  ALTER COLUMN "appointment_id" DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S'
      AND c.relname = 'appointments_appointment_id_seq'
  ) THEN
    CREATE SEQUENCE "appointments_appointment_id_seq"
      AS BIGINT
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
  END IF;
END
$$;

ALTER TABLE "appointments"
  ALTER COLUMN "appointment_id" SET DEFAULT nextval('appointments_appointment_id_seq');

-- Make sure the sequence is ahead of current max
SELECT setval(
  'appointments_appointment_id_seq',
  COALESCE((SELECT MAX("appointment_id") FROM "appointments"), 0) + 1,
  false
);

-- Audit logs: ensure id sequence is present and aligned
ALTER TABLE "audit_logs"
  ALTER COLUMN "id" DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S'
      AND c.relname = 'audit_logs_id_seq'
  ) THEN
    CREATE SEQUENCE "audit_logs_id_seq"
      AS BIGINT
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
  END IF;
END
$$;

ALTER TABLE "audit_logs"
  ALTER COLUMN "id" SET DEFAULT nextval('audit_logs_id_seq');

SELECT setval(
  'audit_logs_id_seq',
  COALESCE((SELECT MAX("id") FROM "audit_logs"), 0) + 1,
  false
);

