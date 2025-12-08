// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllPatients, createPatient, getPatientIdByUserEmail, getDoctorIdByUserEmail } from '@/lib/db_utils';
import { auth } from '@/auth';
import { logAuditEvent } from '@/lib/auditLogger';
import { getClientIP } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

// Helper functions to convert BigInt to Number and vice versa
function toNumber(id: bigint | number | null | undefined): number {
  if (id === null || id === undefined) return 0;
  return typeof id === 'bigint' ? Number(id) : id;
}

function toBigInt(id: number | bigint | null | undefined): bigint {
  if (id === null || id === undefined) return BigInt(0);
  return typeof id === 'number' ? BigInt(id) : id;
}

// GET - جلب جميع المرضى
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const specialty = searchParams.get('specialty') || undefined;
    const identificationNumber = searchParams.get('identificationNumber') || undefined;
    const name = searchParams.get('name') || undefined;

    // Get current user session
    const session = await auth();
    let finalDoctorId = doctorId ? Number(doctorId) : undefined;
    let patientId = undefined;
    let filterByAppointments = false;

    // If user is a doctor (role ID 213), get their doctor ID and filter by appointments
    if (session?.user?.roleId === 213 && session?.user?.email) {
      console.log('🔍 Doctor user detected:', session.user.email, 'Role ID:', session.user.roleId);
      const userDoctorId = await getDoctorIdByUserEmail(session.user.email);
      console.log('🔍 Doctor ID lookup result:', userDoctorId);
      if (userDoctorId) {
        finalDoctorId = userDoctorId;
        filterByAppointments = true; // Filter patients by appointments with this doctor
        console.log('🔍 Filtering patients by appointments with doctor ID:', finalDoctorId);
      } else {
        console.log('⚠️ No doctor record found for email:', session.user.email);
        console.log('🔍 Returning empty array for doctor without record');
        // If doctor user has no doctor record, return empty array
        return NextResponse.json([]);
      }
    }

    // If user is a patient (role ID 216), filter patients to only show their own data
    if (session?.user?.roleId === 216 && session?.user?.email) {
      console.log('🔍 Patient user detected:', session.user.email, 'Role ID:', session.user.roleId);
      const userPatientId = await getPatientIdByUserEmail(session.user.email);
      console.log('🔍 Patient ID lookup result:', userPatientId);
      if (userPatientId) {
        patientId = userPatientId;
        console.log('🔍 Filtering by patient ID:', patientId);
      } else {
        console.log('⚠️ No patient record found for email:', session.user.email);
        console.log('🔍 Returning empty array for patient without record');
        // If patient user has no patient record, return empty array
        return NextResponse.json([]);
      }
    }

    // If filtering by appointments, get patient IDs from appointments table first
    let patientIdsFromAppointments: number[] | undefined = undefined;
    if (filterByAppointments && finalDoctorId) {
      console.log('🔍 Searching for appointments with doctorId:', finalDoctorId, 'as BigInt:', toBigInt(finalDoctorId));
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: toBigInt(finalDoctorId),
        },
        select: {
          patientId: true,
        },
      });
      
      // Get unique patient IDs using Set
      const uniquePatientIds = new Set(appointments.map(apt => toNumber(apt.patientId)));
      patientIdsFromAppointments = Array.from(uniquePatientIds);
      console.log('🔍 Found', patientIdsFromAppointments.length, 'unique patients with appointments for doctor ID:', finalDoctorId);
      console.log('🔍 Patient IDs from appointments:', patientIdsFromAppointments);
      
      // If no appointments found, return empty array
      if (patientIdsFromAppointments.length === 0) {
        console.log('⚠️ No appointments found for doctor, returning empty array');
        return NextResponse.json([]);
      }
    }

    // Build the where clause for patient filtering
    let patientIdFilter: number | number[] | undefined = undefined;
    if (patientId) {
      // For patient users, filter by their own patient ID
      patientIdFilter = patientId;
    } else if (filterByAppointments && patientIdsFromAppointments && patientIdsFromAppointments.length > 0) {
      // For doctors, filter by patient IDs from appointments
      patientIdFilter = patientIdsFromAppointments;
    }

    // If we have patient ID filter(s), use direct Prisma query for better performance
    let patients;
    if (patientIdFilter) {
      const patientIdsArray = Array.isArray(patientIdFilter) ? patientIdFilter : [patientIdFilter];
      console.log('🔍 Filtering patients by IDs:', patientIdsArray);
      
      const whereClause: any = {
        patientId: {
          in: patientIdsArray.map(id => toBigInt(id)),
        },
      };

      // Add additional filters
      if (identificationNumber && identificationNumber.trim()) {
        whereClause.identificationNumber = { contains: identificationNumber, mode: 'insensitive' };
      }
      if (name && name.trim()) {
        whereClause.name = { contains: name.trim(), mode: 'insensitive' };
      }

      const patientsData = await prisma.patient.findMany({
        where: whereClause,
        include: {
          doctor: true,
        },
        orderBy: { name: 'asc' },
      });

      // Convert to expected format (matching getAllPatients format)
      patients = patientsData.map(p => ({
        PATIENT_ID: toNumber(p.patientId),
        NAME: p.name,
        EMAIL: p.email,
        PHONE: p.phone,
        DATEOFBIRTH: p.dateOfBirth,
        GENDER: p.gender,
        ADDRESS: p.address,
        OCCUPATION: p.occupation,
        EMERGENCYCONTACTNAME: p.emergencyContactName,
        EMERGENCYCONTACTNUMBER: p.emergencyContactNumber,
        PRIMARYPHYSICIAN: toNumber(p.primaryPhysician),
        INSURANCEPROVIDER: p.insuranceProvider,
        INSURANCEPOLICYNUMBER: p.insurancePolicyNumber,
        ALLERGIES: p.allergies,
        CURRENTMEDICATION: p.currentMedication,
        FAMILYMEDICALHISTORY: p.familyMedicalHistory,
        PASTMEDICALHISTORY: p.pastMedicalHistory,
        IDENTIFICATIONTYPE: p.identificationType,
        IDENTIFICATIONNUMBER: p.identificationNumber,
        PRIVACYCONSENT: p.privacyConsent,
        TREATMENTCONSENT: p.treatmentConsent,
        DISCLOSURECONSENT: p.disclosureConsent,
        PRIMARYPHYSICIANNAME: p.doctor?.name || null,
        DOCTOR_NAME: p.doctor?.name || null,
        DOCTOR_SPECIALTY: p.doctor?.specialty || null,
      }));

      // Filter by specialty if needed
      if (specialty && specialty.trim()) {
        patients = patients.filter(p => 
          p.DOCTOR_SPECIALTY?.toLowerCase() === specialty.toLowerCase()
        );
      }
    } else {
      // Use getAllPatients for other cases
      patients = await getAllPatients({
        doctorId: finalDoctorId,
        specialty,
        identificationNumber,
        name,
        patientId: patientId,
      });
    }
    
    console.log('🔍 Retrieved patients count:', patients?.length || 0);
    if (session?.user?.roleId === 216) {
      console.log('🔍 Patient user should see only their own data. Filter applied:', !!patientId);
    } else if (session?.user?.roleId === 213) {
      console.log('🔍 Doctor user should see only patients with appointments. Filter applied:', filterByAppointments);
    }
    
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST - إضافة مريض جديد (مصحح)

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const ip = getClientIP(request.headers);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    console.log('بيانات المريض المستلمة:', body);

    // قم بمعالجة التاريخ هنا قبل تمريره إلى دالة createPatient
    if (body.dateOfBirth) {
      // تحويل السلسلة النصية إلى كائن Date
      // هذا لضمان أن الكائن لديه النوع الصحيح للمتغير
      body.dateOfBirth = new Date(body.dateOfBirth);
    }

    const id = await createPatient(body);

    // Log successful creation
    await logAuditEvent({
      user_id: userId,
      action: 'create',
      resource: 'Patient',
      resource_id: Number(id), // Ensure it's a number
      ip_address: ip,
      user_agent: userAgent,
      status: 'success',
      details: `Created patient: ${body.name || body.NAME || 'unknown'}`,
    });

    return NextResponse.json(
      {
        message: 'تم إضافة المريض بنجاح',
        id: id
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failure
    await logAuditEvent({
      user_id: userId,
      action: 'create',
      resource: 'Patient',
      ip_address: ip,
      user_agent: userAgent,
      status: 'failure',
      error_message: errorMessage,
    });

    console.error('خطأ في إضافة المريض:', error);
    return NextResponse.json(
      {
        error: 'فشل في إضافة المريض',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}