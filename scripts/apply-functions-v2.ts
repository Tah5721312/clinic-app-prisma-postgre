/**
 * Script to apply database functions and triggers (Improved version)
 * Run with: pnpm tsx scripts/apply-functions-v2.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Extract complete SQL statements (handling $$ blocks properly)
function extractStatements(sql: string): string[] {
  const statements: string[] = [];
  const lines = sql.split('\n');
  let currentStatement = '';
  let inFunction = false;
  let dollarTag = '';
  let dollarTagCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments at the start
    if (!trimmed || trimmed.startsWith('--')) {
      if (!inFunction) continue;
    }

    currentStatement += line + '\n';

    // Detect start of function (CREATE OR REPLACE FUNCTION)
    if (trimmed.toUpperCase().startsWith('CREATE OR REPLACE FUNCTION')) {
      inFunction = true;
      continue;
    }

    // Detect dollar quote start
    if (inFunction && trimmed.includes('$$')) {
      if (!dollarTag) {
        // Extract the tag (could be $$ or $tag$)
        const match = trimmed.match(/\$([^$]*)\$/);
        if (match) {
          dollarTag = match[0];
          dollarTagCount = 1;
        }
      } else {
        // Count closing tags
        const matches = trimmed.match(new RegExp(dollarTag.replace(/\$/g, '\\$'), 'g'));
        if (matches) {
          dollarTagCount += matches.length;
          // If even number, we've closed all tags
          if (dollarTagCount % 2 === 0) {
            inFunction = false;
            dollarTag = '';
            dollarTagCount = 0;
            // Check if this line ends with semicolon
            if (trimmed.endsWith(';')) {
              statements.push(currentStatement.trim());
              currentStatement = '';
            }
          }
        }
      }
      continue;
    }

    // If we're in a function and hit semicolon after closing $$
    if (inFunction && trimmed.endsWith(';') && !dollarTag) {
      inFunction = false;
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }

    // Regular statement (not in function)
    if (!inFunction && trimmed.endsWith(';')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements.filter(s => s.length > 0 && !s.startsWith('--'));
}

async function main() {
  console.log('🔄 Applying database functions and triggers (v2)...\n');

  try {
    const sqlFile = readFileSync(
      join(process.cwd(), 'prisma/migrations/001_create_id_functions.sql'),
      'utf-8'
    );

    // Try a simpler approach: split by CREATE statements
    const createStatements = sqlFile
      .split(/(?=CREATE (?:OR REPLACE )?(?:FUNCTION|TRIGGER|INDEX|TABLE|SEQUENCE|VIEW))/i)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());

    // Also handle ALTER statements
    const alterStatements = sqlFile
      .split(/(?=ALTER TABLE)/i)
      .filter(s => s.trim().length > 0 && s.includes('ALTER TABLE'))
      .map(s => s.trim());

    const allStatements = [...createStatements, ...alterStatements]
      .filter(s => !s.startsWith('--') && s.length > 10);

    console.log(`Found ${allStatements.length} statements to execute...\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allStatements.length; i++) {
      const statement = allStatements[i];
      
      // Clean up statement - ensure it ends with semicolon
      let cleanStatement = statement.trim();
      if (!cleanStatement.endsWith(';')) {
        cleanStatement += ';';
      }

      try {
        await prisma.$executeRawUnsafe(cleanStatement);
        successCount++;
        const name = cleanStatement.substring(0, 50).replace(/\n/g, ' ');
        console.log(`✅ [${i + 1}/${allStatements.length}] ${name}...`);
      } catch (error) {
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();
          if (
            errorMsg.includes('already exists') ||
            errorMsg.includes('duplicate') ||
            errorMsg.includes('does not exist')
          ) {
            skipCount++;
            console.log(`⚠️  [${i + 1}/${allStatements.length}] Already exists, skipping...`);
          } else {
            errorCount++;
            console.error(`❌ [${i + 1}/${allStatements.length}] Error: ${error.message.substring(0, 100)}`);
          }
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`\n✅ Process completed!`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
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

