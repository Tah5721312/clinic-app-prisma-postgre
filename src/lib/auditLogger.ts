/**
 * Audit Logger - Tracks user actions for security and compliance
 */

import { prisma } from './prisma';

export interface AuditLog {
  user_id?: number;
  action: string;
  resource: string; // Keep in interface for backward compatibility, maps to resource_type in DB
  resource_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure';
  error_message?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(log: AuditLog): Promise<void> {
  try {
    // Insert audit log (resource maps to resource_type in database)
    // Ensure resource_id is a BigInt or null
    const resourceId = log.resource_id !== undefined && log.resource_id !== null
      ? BigInt(log.resource_id)
      : null;

    const userId = log.user_id !== undefined && log.user_id !== null
      ? BigInt(log.user_id)
      : null;

    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: log.action,
        resourceType: log.resource, // Map resource to resource_type
        resourceId: resourceId,
        details: log.details || null,
        ipAddress: log.ip_address || null,
        userAgent: log.user_agent || null,
        status: log.status,
        errorMessage: log.error_message || null,
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Audit log recorded:', {
        action: log.action,
        resource_type: log.resource,
        resource_id: log.resource_id,
        user_id: log.user_id,
        status: log.status,
      });
    }
  } catch (error) {
    // Don't throw error - audit logging should not break the application
    // In production, you might want to log to a separate service
    console.error('❌ Failed to log audit event:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        logData: log,
      });
    }
  }
}

/**
 * Get audit logs for a user
 */
export async function getAuditLogs(
  userId?: number,
  limit: number = 100
): Promise<AuditLog[]> {
  try {
    const where = userId
      ? { userId: BigInt(userId) }
      : {};

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return logs.map((row) => ({
      user_id: row.userId ? Number(row.userId) : undefined,
      action: row.action,
      resource: row.resourceType, // Map resource_type back to resource in interface
      resource_id: row.resourceId ? Number(row.resourceId) : undefined,
      details: row.details || undefined,
      ip_address: row.ipAddress || undefined,
      user_agent: row.userAgent || undefined,
      status: row.status as 'success' | 'failure',
      error_message: row.errorMessage || undefined,
    }));
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
}

