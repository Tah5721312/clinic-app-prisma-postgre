import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type VwPermissionRow = {
  USER_ID: number;
  USERNAME: string;
  FULL_NAME?: string | null;
  ROLE_NAME: string;
  SUBJECT: string;
  ACTION: string;
  FIELD_NAME?: string | null;
  CAN_ACCESS?: number | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);
    
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'User not found' },
        { status: 404 }
      );
    }

    const roleName = user.role?.name || '';
    const rows: VwPermissionRow[] = (user.role?.permissions || []).map(rp => ({
      USER_ID: Number(user.userId),
      USERNAME: user.username,
      FULL_NAME: user.fullName,
      ROLE_NAME: roleName,
      SUBJECT: rp.subject,
      ACTION: rp.action,
      FIELD_NAME: rp.fieldName,
      CAN_ACCESS: rp.canAccess,
    }));

    return NextResponse.json({
      status: 'success',
      data: {
        roleName,
        permissions: rows,
      },
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch user permissions' },
      { status: 500 }
    );
  }
}


