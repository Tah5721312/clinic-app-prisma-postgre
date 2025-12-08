// app/api/doctors/[id]/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDoctorSchedules, createDoctorSchedule } from '@/lib/db_utils';
import { auth } from '@/auth';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET - جلب جدول الطبيب
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const doctorId = Number(id);

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    // Check if user has permission to view schedules
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin, doctor, or the doctor themselves
    const isAdmin = session.user.roleId === 211 || session.user.roleId === 212;
    const isDoctor = session.user.roleId === 213;
    
    if (!isAdmin && !isDoctor) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const schedules = await getDoctorSchedules(doctorId);
    return NextResponse.json(schedules);

  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor schedules' },
      { status: 500 }
    );
  }
}

// POST - إنشاء جدول زمني جديد للطبيب
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const doctorId = Number(id);
    const body = await request.json();

    const dayOfWeek = Number(body.day_of_week);
    const startTime = (body.start_time || '').toString().trim();
    const endTime = (body.end_time || '').toString().trim();
    const slotDuration = body.slot_duration !== undefined ? Number(body.slot_duration) : 30;
    const isAvailable = body.is_available !== undefined ? Number(body.is_available) : 1;

    if (isNaN(doctorId)) {
      return NextResponse.json(
        { error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    // Check if user has permission to create schedules
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin or the doctor themselves
    const isAdmin = session.user.roleId === 211 || session.user.roleId === 212;
    const isDoctor = session.user.roleId === 213;
    
    if (!isAdmin && !isDoctor) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: day_of_week, start_time, end_time' },
        { status: 400 }
      );
    }

    // Validate day of week
    if (dayOfWeek < 1 || dayOfWeek > 7) {
      return NextResponse.json(
        { error: 'Invalid day_of_week. Must be between 1-7' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      );
    }

    // Validate time order
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    // Validate slot duration
    if (!Number.isInteger(slotDuration) || slotDuration <= 0 || slotDuration > 480) {
      return NextResponse.json(
        { error: 'Invalid slot_duration. Must be an integer between 1-480 minutes' },
        { status: 400 }
      );
    }

    // Validate availability flag
    if (![0, 1].includes(isAvailable)) {
      return NextResponse.json(
        { error: 'Invalid is_available. Must be 0 or 1' },
        { status: 400 }
      );
    }

    const scheduleData = {
      doctor_id: doctorId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      slot_duration: slotDuration,
      is_available: isAvailable
    };

    const scheduleId = await createDoctorSchedule(scheduleData);

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule created successfully',
        scheduleId,
        data: scheduleData
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating doctor schedule:', error);
    const message = error instanceof Error ? error.message : 'Failed to create doctor schedule';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
