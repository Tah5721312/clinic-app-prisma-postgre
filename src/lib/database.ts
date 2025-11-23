/**
 * Database utilities using Prisma Client
 * Replaced Oracle DB with Prisma PostgreSQL
 */

import { prisma } from './prisma';

// Re-export prisma for backward compatibility
export { prisma };

/**
 * Check if database is connected
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`❌ Database connection check failed: ${err.message}`);
    } else {
      console.error('❌ Database connection check failed: غير معروف');
    }
    return false;
  }
}

/**
 * Execute a raw SQL query (for complex queries that Prisma doesn't support)
 * Note: Use Prisma methods whenever possible for type safety
 */
export async function executeQuery<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<{
  rows: T[];
  rowsAffected?: number;
}> {
  try {
    // Convert named parameters to Prisma format
    // Prisma uses $1, $2, etc. for parameters
    const paramKeys = Object.keys(params);
    let sqlQuery = query;
    const paramValues: any[] = [];

    // Replace :paramName with $1, $2, etc.
    paramKeys.forEach((key, index) => {
      const placeholder = `:${key}`;
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      sqlQuery = sqlQuery.replace(regex, `$${index + 1}`);
      paramValues.push(params[key]);
    });

    // Execute raw query
    const result = await prisma.$queryRawUnsafe<T>(sqlQuery, ...paramValues);

    return {
      rows: Array.isArray(result) ? result : [],
      rowsAffected: Array.isArray(result) ? result.length : 0,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`❌ Error executing query: ${err.message}`);
    } else {
      console.error('❌ Error executing query: غير معروف');
    }
    throw err;
  }
}

/**
 * Execute a query with RETURNING clause (for INSERT operations)
 * Note: Prisma handles this automatically with create operations
 */
export async function executeReturningQuery<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<{
  rows: T[];
  outBinds?: Record<string, any[]>;
}> {
  try {
    // For Prisma, we'll execute the query and return the result
    // The outBinds will be extracted from the result
    const result = await executeQuery<T>(query, params);

    // Extract outBinds if present (for compatibility)
    const outBinds: Record<string, any[]> = {};
    if (params.id && Array.isArray(params.id)) {
      outBinds.id = params.id;
    }

    return {
      rows: result.rows,
      outBinds,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`❌ Error executing returning query: ${err.message}`);
    } else {
      console.error('❌ Error executing returning query: غير معروف');
    }
    throw err;
  }
}

/**
 * Get a connection (for backward compatibility)
 * Note: Prisma manages connections automatically, so this just returns prisma
 */
export async function getConnection() {
  return prisma;
}

/**
 * Initialize database connection
 * Note: Prisma initializes automatically on first use
 */
export async function initializePool() {
  try {
    await checkDatabaseConnection();
    console.log('✅ Database connection initialized successfully');
    return prisma;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`❌ Failed to initialize database: ${err.message}`);
    } else {
      console.error('❌ Failed to initialize database: غير معروف');
    }
    throw err;
  }
}

/**
 * Disconnect from database (useful for cleanup)
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
