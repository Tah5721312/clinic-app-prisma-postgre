import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Interface for user with role and permissions
interface UserWithRolePermissions {
  USER_ID: number;
  USERNAME: string;
  FULL_NAME: string;
  EMAIL: string;
  ROLE_ID: number;
  ROLE_NAME: string;
  PERMISSIONS: {
    SUBJECT: string;
    ACTION: string;
    FIELD_NAME: string | null;
    CAN_ACCESS: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usernameFilter = searchParams.get('username') || '';
    const roleFilter = searchParams.get('role') || '';

    // Build Prisma query
    const where: any = {};
    
    if (usernameFilter) {
      where.username = {
        contains: usernameFilter,
        mode: 'insensitive',
      };
    }

    if (roleFilter) {
      where.role = {
        name: roleFilter,
      };
    }

    const usersData = await prisma.user.findMany({
      where,
      include: {
        role: {
          include: {
            permissions: {
              orderBy: [
                { subject: 'asc' },
                { action: 'asc' },
              ],
            },
          },
        },
      },
      orderBy: {
        userId: 'asc',
      },
    });

    // Transform the result to match the expected format
    const users: UserWithRolePermissions[] = usersData.map(user => {
      const permissions = (user.role?.permissions || []).map(rp => ({
        SUBJECT: rp.subject,
        ACTION: rp.action,
        FIELD_NAME: rp.fieldName,
        CAN_ACCESS: rp.canAccess,
      }));

      return {
        USER_ID: Number(user.userId),
        USERNAME: user.username,
        FULL_NAME: user.fullName || user.username,
        EMAIL: user.email,
        ROLE_ID: user.roleId,
        ROLE_NAME: user.role?.name || '',
        PERMISSIONS: permissions,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}





export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, fullName, password, roleId } = body;

    // Validate required fields
    if (!username || !email || !fullName || !password || !roleId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password using bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword,
        roleId: Number(roleId),
        isActive: 1,
      },
    });

    return NextResponse.json({ 
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
