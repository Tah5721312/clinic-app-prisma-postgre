import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      where: {
        isActive: 1,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform to match expected format
    const rolesResponse = roles.map(role => ({
      ROLE_ID: role.roleId,
      NAME: role.name,
      DESCRIPTION: role.description,
      IS_ACTIVE: role.isActive,
    }));

    return NextResponse.json({ roles: rolesResponse });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}
