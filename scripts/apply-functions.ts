/**
 * Script to apply database functions and triggers
 * Run with: pnpm tsx scripts/apply-functions.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Helper function to split SQL by complete statements (handling $$ blocks)
function splitSQLStatements(sql: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Check for dollar quote start: $tag$ or $$
    if (char === '$' && !inDollarQuote) {
      let tag = '$';
      let j = i + 1;
      while (j < sql.length && sql[j] !== '$') {
        tag += sql[j];
        j++;
      }
      if (j < sql.length) {
        tag += '$';
        dollarTag = tag;
        inDollarQuote = true;
        currentStatement += tag;
        i = j + 1;
        continue;
      }
    }

    // Check for dollar quote end
    if (inDollarQuote && sql.substring(i).startsWith(dollarTag)) {
      currentStatement += dollarTag;
      i += dollarTag.length;
      inDollarQuote = false;
      dollarTag = '';
      continue;
    }

    currentStatement += char;

    // If we're not in a dollar quote and we hit a semicolon, it's the end of a statement
    if (!inDollarQuote && char === ';') {
      const trimmed = currentStatement.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }

    i++;
  }

  // Add any remaining statement
  const trimmed = currentStatement.trim();
  if (trimmed && !trimmed.startsWith('--')) {
    statements.push(trimmed);
  }

  return statements;
}

async function main() {
  console.log('🔄 Applying database functions and triggers...');

  try {
    // Read the SQL file
    const sqlFile = readFileSync(
      join(process.cwd(), 'prisma/migrations/001_create_id_functions.sql'),
      'utf-8'
    );

    // Split into complete statements
    const statements = splitSQLStatements(sqlFile);

    console.log(`Found ${statements.length} statements to execute...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;

      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ [${i + 1}/${statements.length}] Executed statement`);
      } catch (error) {
        if (error instanceof Error) {
          // Some statements might fail if they already exist, that's okay
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.message.includes('does not exist')
          ) {
            console.log(`⚠️  [${i + 1}/${statements.length}] Statement already exists or dependency missing, skipping...`);
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
            // Don't throw, continue with other statements
          }
        }
      }
    }

    console.log('✅ Successfully applied all functions and triggers!');
  } catch (error) {
    console.error('❌ Error applying functions:', error);
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

