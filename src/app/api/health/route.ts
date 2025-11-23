import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
      database: {
        status: 'up' | 'down';
        responseTime?: number;
        error?: string;
      };
    };
    version?: string;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: 'down',
      },
    },
  };

  // Check database connection
  try {
    const dbStartTime = Date.now();
    // Test query using Prisma
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;

    health.services.database.status = 'up';
    health.services.database.responseTime = dbResponseTime;
  } catch (error) {
    health.status = 'unhealthy';
    health.services.database.status = 'down';
    health.services.database.error =
      error instanceof Error ? error.message : 'Unknown error';
  }

  // Add version info if available
  if (process.env.npm_package_version) {
    health.version = process.env.npm_package_version;
  }

  const responseTime = Date.now() - startTime;

  const statusCode =
    health.status === 'healthy'
      ? 200
      : health.status === 'degraded'
        ? 200
        : 503;

  return NextResponse.json(
    {
      ...health,
      responseTime,
    },
    { status: statusCode }
  );
}

