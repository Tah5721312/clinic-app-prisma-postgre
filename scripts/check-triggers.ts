/**
 * Check if triggers exist in database
 */

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔍 Checking triggers and functions...\n');

  try {
    // Check functions
    const functions = await prisma.$queryRaw<Array<{ proname: string }>>`
      SELECT proname 
      FROM pg_proc 
      WHERE proname LIKE 'generate_%_id'
      ORDER BY proname;
    `;
    console.log('Functions found:');
    functions.forEach((f) => console.log(`  ✅ ${f.proname}`));
    console.log('');

    // Check triggers
    const triggers = await prisma.$queryRaw<Array<{ tgname: string; table_name: string }>>`
      SELECT tgname, tgrelid::text as table_name
      FROM pg_trigger
      WHERE tgname LIKE 'trg_%'
      AND tgisinternal = false
      ORDER BY tgname;
    `;
    console.log('Triggers found:');
    triggers.forEach((t) => console.log(`  ✅ ${t.tgname} on ${t.table_name}`));
    console.log('');

    if (functions.length === 0) {
      console.log('❌ No functions found! Please run apply-functions.ts');
    }
    if (triggers.length === 0) {
      console.log('❌ No triggers found! Please run apply-functions.ts');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

