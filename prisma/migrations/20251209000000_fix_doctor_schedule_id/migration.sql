-- Ensure doctor_schedules.schedule_id uses a proper identity/sequence

-- Drop the incorrect default of 0 if it exists
ALTER TABLE "doctor_schedules"
  ALTER COLUMN "schedule_id" DROP DEFAULT;

-- Create sequence if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S'
      AND c.relname = 'doctor_schedules_schedule_id_seq'
  ) THEN
    CREATE SEQUENCE "doctor_schedules_schedule_id_seq"
      AS BIGINT
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
  END IF;
END
$$;

-- Point the column default at the sequence
ALTER TABLE "doctor_schedules"
  ALTER COLUMN "schedule_id" SET DEFAULT nextval('doctor_schedules_schedule_id_seq');

-- Make sure the sequence is ahead of the current max id
SELECT setval(
  'doctor_schedules_schedule_id_seq',
  COALESCE((SELECT MAX("schedule_id") FROM "doctor_schedules"), 0) + 1,
  false
);

