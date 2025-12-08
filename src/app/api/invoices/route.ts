// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllInvoices,
  createInvoice,
  getMonthlyRevenue,
  getPatientIdByUserEmail,
  getDoctorIdByUserEmail,
} from '@/lib/db_utils';
import { auth } from '@/auth';
import { logAuditEvent } from '@/lib/auditLogger';
import { getClientIP } from '@/lib/rateLimit';

// GET - جلب جميع الفواتير
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const paymentStatus = searchParams.get('payment_status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const doctorId = searchParams.get('doctor_id');
    const specialty = searchParams.get('specialty');
    const identificationNumber = searchParams.get('identificationNumber');
    const monthlyRevenue = searchParams.get('monthly_revenue') === 'true';

    // Get current user session
    const session = await auth();
    const currentUserId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.roleId;
    const isAdmin = (session?.user as any)?.isAdmin;

    let finalPatientId = patientId ? Number(patientId) : undefined;
    let finalDoctorId = doctorId ? Number(doctorId) : undefined;

    // إذا كان المستخدم مريض، احصل على patient_id من user email وتجاهل أي patientId في query params
    if (userRole === 216 && currentUserId) {
      const userEmail = (session?.user as any)?.email;
      if (userEmail) {
        try {
          const userPatientId = await getPatientIdByUserEmail(userEmail);
          if (userPatientId) {
            // المريض يرى فقط فواتيره - تجاهل أي patientId في query params
            finalPatientId = userPatientId;
          } else {
            // إذا لم يكن للمريض سجل، أرجع مصفوفة فارغة
            return NextResponse.json([]);
          }
        } catch (error) {
          console.error('Error getting patient ID:', error);
          return NextResponse.json([]);
        }
      } else {
        return NextResponse.json([]);
      }
    }

    // إذا كان المستخدم دكتور، احصل على doctor_id من user email
    // الدكتور يرى فواتير مرضاه فقط
    if (userRole === 213 && currentUserId) {
      const userEmail = (session?.user as any)?.email;
      if (userEmail) {
        try {
          const userDoctorId = await getDoctorIdByUserEmail(userEmail);
          if (userDoctorId) {
            // الدكتور يرى فواتير مرضاه فقط
            finalDoctorId = userDoctorId;
          } else {
            // إذا لم يكن للدكتور سجل، أرجع مصفوفة فارغة
            return NextResponse.json([]);
          }
        } catch (error) {
          console.error('Error getting doctor ID:', error);
          return NextResponse.json([]);
        }
      } else {
        return NextResponse.json([]);
      }
    }

    // If requesting monthly revenue data
    if (monthlyRevenue) {
      const revenue = await getMonthlyRevenue();
      return NextResponse.json(revenue);
    }

    const filters = {
      patient_id: finalPatientId,
      payment_status: paymentStatus || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      doctor_id: finalDoctorId, // Use finalDoctorId instead of doctorId
      specialty: specialty || undefined,
      identificationNumber: identificationNumber || undefined,
    };

    const invoices = await getAllInvoices(filters);

    console.log('🔍 Retrieved invoices count:', invoices?.length || 0);

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: 'Failed to fetch invoices',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}

// POST - إضافة فاتورة جديدة
export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const ip = getClientIP(request.headers);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    console.log('بيانات الفاتورة المستلمة:', body);

    const createdBy = userId !== undefined ? Number(userId) : undefined;
    const invoiceId = await createInvoice(body, createdBy);

    // Log successful creation
    await logAuditEvent({
      user_id: userId,
      action: 'create',
      resource: 'Invoice',
      resource_id: Number(invoiceId),
      ip_address: ip,
      user_agent: userAgent,
      status: 'success',
      details: `Created invoice for patient ${body.patient_id || 'unknown'}`,
    });

    return NextResponse.json(
      {
        message: 'تم إضافة الفاتورة بنجاح',
        id: invoiceId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log failure
    await logAuditEvent({
      user_id: userId,
      action: 'create',
      resource: 'Invoice',
      ip_address: ip,
      user_agent: userAgent,
      status: 'failure',
      error_message: errorMessage,
    });

    console.error('خطأ في إضافة الفاتورة:', error);
    return NextResponse.json(
      {
        error: 'فشل في إضافة الفاتورة',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
