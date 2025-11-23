import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UpdateUserDto, UserFromDB } from "@/lib/types";
import { updateUserSchema } from "@/lib/validationSchemas";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 *  @method  DELETE
 *  @route   ~/api/users/profile/:id
 *  @desc    Delete Profile
 *  @access  private (only user himself can delete his account)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);

    // ✅ تحقق هل المستخدم موجود
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    // ✅ تحقق من الجلسة
    const session = await auth();
    if (session?.user && (Number((session.user as any).id) === Number(user.userId) || (session.user as any).isAdmin)) {
      await prisma.user.delete({
        where: { userId },
      });
      return NextResponse.json({ message: "your profile has been deleted" }, { status: 200 });
    }

    return NextResponse.json(
      { message: "only user himself can delete his profile" },
      { status: 403 }
    );
  } catch (error) {
    console.error("DELETE PROFILE ERROR:", error);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}

/**
 *  @method  GET
 *  @route   ~/api/users/profile/:id
 *  @desc    Get Profile By Id
 *  @access  private
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);
    
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
        roleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    const session = await auth();
    if (!session?.user || (Number((session.user as any).id) !== Number(user.userId) && !(session.user as any).isAdmin)) {
      return NextResponse.json({ message: "access denied" }, { status: 403 });
    }

    const userResponse: UserFromDB = {
      ID: Number(user.userId),
      USERNAME: user.username,
      EMAIL: user.email,
      ROLE_ID: user.roleId,
      CREATED_AT: user.createdAt,
    };

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}

/**
 *  @method  PUT
 *  @route   ~/api/users/profile/:id
 *  @desc    Update Profile
 *  @access  private
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = BigInt(id);

    // ✅ تحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
        password: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    // ✅ تحقق من الجلسة
    const session = await auth();
    if (!session?.user || Number(session.user.id) !== Number(user.userId)) {
      return NextResponse.json({ message: "access denied" }, { status: 403 });
    }

    // ✅ تحقق من البيانات
    const body = (await request.json()) as UpdateUserDto;
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
    }

    // ✅ تحديث البيانات
    let hashedPassword = user.password;
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        username: body.username || user.username,
        email: body.email || user.email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { id: Number(updatedUser.userId), username: updatedUser.username, email: updatedUser.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
