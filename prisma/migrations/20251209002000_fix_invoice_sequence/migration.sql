-- Fix invoice_id sequence to avoid duplicate primary keys

-- Remove incorrect default
ALTER TABLE "invoices"
  ALTER COLUMN "invoice_id" DROP DEFAULT;

-- Ensure sequence exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S'
      AND c.relname = 'invoices_invoice_id_seq'
  ) THEN
    CREATE SEQUENCE "invoices_invoice_id_seq"
      AS BIGINT
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
  END IF;
END
$$;

-- Point column default to sequence
ALTER TABLE "invoices"
  ALTER COLUMN "invoice_id" SET DEFAULT nextval('invoices_invoice_id_seq');

-- Align sequence with current max value
SELECT setval(
  'invoices_invoice_id_seq',
  COALESCE((SELECT MAX("invoice_id") FROM "invoices"), 0) + 1,
  false
);

