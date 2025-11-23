/**
 * Apply Invoice triggers separately
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Applying Invoice triggers...\n');

  try {
    // Apply update_invoice_payment_status function
    const updateFunction = `
      CREATE OR REPLACE FUNCTION update_invoice_payment_status()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Calculate payment status based on paid_amount and total_amount
          IF NEW.paid_amount >= NEW.total_amount THEN
              NEW.payment_status := 'paid';
              IF NEW.payment_date IS NULL AND OLD.payment_date IS NULL THEN
                  NEW.payment_date := CURRENT_DATE;
              END IF;
          ELSIF NEW.paid_amount > 0 THEN
              NEW.payment_status := 'partial';
          ELSE
              NEW.payment_status := 'unpaid';
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await prisma.$executeRawUnsafe(updateFunction);
    console.log('✅ Updated update_invoice_payment_status() function\n');

    // Apply triggers
    const triggers = [
      `CREATE TRIGGER trg_invoice_id
       BEFORE INSERT ON invoices
       FOR EACH ROW
       WHEN (NEW.invoice_id = 0 OR NEW.invoice_id IS NULL)
       EXECUTE FUNCTION generate_invoice_id();`,
      
      `CREATE TRIGGER trg_invoice_update_payment_status
       BEFORE UPDATE ON invoices
       FOR EACH ROW
       WHEN (OLD.paid_amount IS DISTINCT FROM NEW.paid_amount OR OLD.total_amount IS DISTINCT FROM NEW.total_amount)
       EXECUTE FUNCTION update_invoice_payment_status();`,
    ];

    for (let i = 0; i < triggers.length; i++) {
      try {
        // Drop trigger if exists first
        const triggerName = triggers[i].match(/TRIGGER\s+(\w+)/i)?.[1];
        if (triggerName) {
          try {
            await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS ${triggerName} ON invoices;`);
          } catch (e) {
            // Ignore if doesn't exist
          }
        }
        
        await prisma.$executeRawUnsafe(triggers[i]);
        console.log(`✅ [${i + 1}/${triggers.length}] Created trigger ${triggerName}`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ [${i + 1}/${triggers.length}] Error: ${error.message.substring(0, 150)}`);
        }
      }
    }

    console.log('\n✅ All Invoice triggers applied!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

