/**
 * Apply fixed ID generation functions
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Applying fixed ID generation functions...\n');

  try {
    const sqlFile = readFileSync(
      join(process.cwd(), 'scripts/fix-id-functions.sql'),
      'utf-8'
    );

    // Split by CREATE OR REPLACE FUNCTION
    const statements = sqlFile
      .split(/(?=CREATE OR REPLACE FUNCTION)/i)
      .filter(s => s.trim().length > 0 && s.includes('CREATE OR REPLACE FUNCTION'))
      .map(s => s.trim() + ';');

    console.log(`Found ${statements.length} functions to update...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await prisma.$executeRawUnsafe(statement);
        const funcName = statement.match(/FUNCTION\s+(\w+)/i)?.[1] || 'unknown';
        console.log(`✅ [${i + 1}/${statements.length}] Updated ${funcName}()`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n✅ All functions updated!');
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

