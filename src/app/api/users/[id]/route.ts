import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);

    const userData = await prisma.user.findUnique({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              orderBy: [
                { subject: 'asc' },
                { action: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const permissions = (userData.role?.rolePermissions || []).map(rp => ({
      SUBJECT: rp.subject,
      ACTION: rp.action,
      FIELD_NAME: rp.fieldName,
      CAN_ACCESS: rp.canAccess,
    }));

    const user = {
      USER_ID: Number(userData.userId),
      USERNAME: userData.username,
      FULL_NAME: userData.fullName || userData.username,
      EMAIL: userData.email,
      ROLE_ID: userData.roleId,
      ROLE_NAME: userData.role?.name || '',
      PERMISSIONS: permissions,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}


// ***************

// update user roles

// ***************

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);
    const body = await request.json();
    const { username, email, fullName, roleId, newUserId } = body;

    // Validate required fields
    if (!username || !email || !fullName || roleId === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: username, email, fullName, and roleId are required' },
        { status: 400 }
      );
    }

    // If the client requests changing the USER_ID, validate uniqueness first
    let effectiveUserId = userId;
    if (typeof newUserId === 'number' && newUserId !== Number(userId)) {
      const newUserIdBigInt = BigInt(newUserId);
      const existingUser = await prisma.user.findUnique({
        where: { userId: newUserIdBigInt },
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'USER_ID already exists' },
          { status: 409 }
        );
      }

      // Update the primary key - we need to delete and recreate with new ID
      // Note: This is a complex operation, we'll use a transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { userId } });
        if (!user) throw new Error('User not found');
        
        // Delete old user
        await tx.user.delete({ where: { userId } });
        
        // Create new user with new ID
        await tx.user.create({
          data: {
            userId: newUserIdBigInt,
            username: username || user.username,
            email: email || user.email,
            password: user.password,
            roleId: Number(roleId) || user.roleId,
            fullName: fullName || user.fullName,
            isAdmin: user.isAdmin,
            phone: user.phone,
            isActive: user.isActive,
          },
        });
      });
      
      effectiveUserId = BigInt(newUserId);
    } else {
      // Update user data - update all provided fields
      await prisma.user.update({
        where: { userId: effectiveUserId },
        data: {
          username: username,
          email: email,
          fullName: fullName,
          roleId: Number(roleId),
        },
      });
    }

    // Fetch updated user data with permissions
    const userData = await prisma.user.findUnique({
      where: { userId: effectiveUserId },
      include: {
        role: {
          include: {
            rolePermissions: {
              orderBy: [
                { subject: 'asc' },
                { action: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found after update' },
        { status: 404 }
      );
    }

    const permissions = (userData.role?.rolePermissions || []).map(rp => ({
      SUBJECT: rp.subject,
      ACTION: rp.action,
      FIELD_NAME: rp.fieldName,
      CAN_ACCESS: rp.canAccess,
    }));

    const updatedUser = {
      USER_ID: Number(userData.userId),
      USERNAME: userData.username,
      FULL_NAME: userData.fullName || userData.username,
      EMAIL: userData.email,
      ROLE_ID: userData.roleId,
      ROLE_NAME: userData.role?.name || '',
      PERMISSIONS: permissions,
    };

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}


// ***************

// DELETE user roles

// ***************
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    const userId = BigInt(id);

    await prisma.user.delete({
      where: { userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
