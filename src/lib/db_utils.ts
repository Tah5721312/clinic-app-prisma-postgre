/**
 * Database utility functions using Prisma Client
 * Converted from Oracle DB to Prisma PostgreSQL
 */

import { prisma } from '@/lib/prisma';
import { executeQuery } from '@/lib/database';
import { Patient, DoctorSchedule, CreateScheduleDto, UpdateScheduleDto, TimeSlot, Invoice, CreateInvoiceDto, MonthlyRevenueRow } from '@/lib/types';

// Helper function to convert BigInt to Number for compatibility
function toNumber(id: bigint | number | null | undefined): number {
  if (id === null || id === undefined) return 0;
  return typeof id === 'bigint' ? Number(id) : id;
}

// Helper function to convert Number to BigInt
function toBigInt(id: number | bigint | null | undefined): bigint {
  if (id === null || id === undefined) return BigInt(0);
  return typeof id === 'number' ? BigInt(id) : id;
}

/**
 * Calculate payment status based on paid amount and total amount
 */
function calculatePaymentStatus(paidAmount: number, totalAmount: number): 'paid' | 'partial' | 'unpaid' {
  if (paidAmount >= totalAmount && totalAmount > 0) {
    return 'paid';
  } else if (paidAmount > 0) {
    return 'partial';
  } else {
    return 'unpaid';
  }
}

// ==================== DOCTORS ====================

/**
 * جلب جميع الأطباء
 */
export async function getAllDoctors(specialty?: string) {
  const where = specialty && specialty.trim() 
    ? { specialty: { equals: specialty, mode: 'insensitive' as const } }
    : {};

  const doctors = await prisma.doctor.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  // Convert to expected format
  return doctors.map(d => ({
    DOCTOR_ID: toNumber(d.doctorId),
    NAME: d.name,
    EMAIL: d.email,
    PHONE: d.phone,
    SPECIALTY: d.specialty,
    EXPERIENCE: d.experience,
    QUALIFICATION: d.qualification,
    IMAGE: d.image,
    BIO: d.bio,
    CONSULTATION_FEE: d.consultationFee ? Number(d.consultationFee) : 0,
    IS_AVAILABLE: d.isAvailable,
    AVAILABILITY_UPDATED_AT: d.availabilityUpdatedAt,
  }));
}

/**
 * جلب طبيب by ID
 */
export async function getDoctorById(id: number) {
  const doctor = await prisma.doctor.findUnique({
    where: { doctorId: toBigInt(id) },
  });

  if (!doctor) return null;

  return {
    DOCTOR_ID: toNumber(doctor.doctorId),
    NAME: doctor.name,
    EMAIL: doctor.email,
    PHONE: doctor.phone,
    SPECIALTY: doctor.specialty,
    EXPERIENCE: doctor.experience,
    QUALIFICATION: doctor.qualification,
    IMAGE: doctor.image,
    BIO: doctor.bio,
    CONSULTATION_FEE: doctor.consultationFee ? Number(doctor.consultationFee) : 0,
    IS_AVAILABLE: doctor.isAvailable,
    AVAILABILITY_UPDATED_AT: doctor.availabilityUpdatedAt,
  };
}

/**
 * إضافة طبيب جديد
 */
export async function createDoctor(doctor: {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience?: number;
  qualification?: string;
  image?: string;
  bio?: string;
  consultation_fee?: number;
  is_available?: number;
}) {
  const newDoctor = await prisma.doctor.create({
    data: {
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      experience: doctor.experience || null,
      qualification: doctor.qualification || null,
      image: doctor.image || null,
      bio: doctor.bio || null,
      consultationFee: doctor.consultation_fee || 0,
      isAvailable: doctor.is_available || 1,
    },
  });

  return toNumber(newDoctor.doctorId);
}

/**
 * تحديث طبيب
 */
export async function updateDoctor(
  id: number,
  doctor: {
    name?: string;
    email?: string;
    phone?: string;
    specialty?: string;
    experience?: number;
    qualification?: string;
    image?: string;
    bio?: string;
    consultation_fee?: number;
    is_available?: number;
    availability_updated_at?: Date;
  }
) {
  const updateData: any = {};
  
  if (doctor.name !== undefined) updateData.name = doctor.name;
  if (doctor.email !== undefined) updateData.email = doctor.email;
  if (doctor.phone !== undefined) updateData.phone = doctor.phone;
  if (doctor.specialty !== undefined) updateData.specialty = doctor.specialty;
  if (doctor.experience !== undefined) updateData.experience = doctor.experience;
  if (doctor.qualification !== undefined) updateData.qualification = doctor.qualification;
  if (doctor.image !== undefined) updateData.image = doctor.image;
  if (doctor.bio !== undefined) updateData.bio = doctor.bio;
  if (doctor.consultation_fee !== undefined) updateData.consultationFee = doctor.consultation_fee;
  if (doctor.is_available !== undefined) updateData.isAvailable = doctor.is_available;
  if (doctor.availability_updated_at !== undefined) updateData.availabilityUpdatedAt = doctor.availability_updated_at;

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  await prisma.doctor.update({
    where: { doctorId: toBigInt(id) },
    data: updateData,
  });

  return 1; // rowsAffected
}

/**
 * حذف طبيب
 */
export async function deleteDoctor(id: number) {
  await prisma.doctor.delete({
    where: { doctorId: toBigInt(id) },
  });
  return 1; // rowsAffected
}

/**
 * حذف طبيب مرتبط بمواعيد (with cascade)
 */
export async function deleteDoctorWithTransaction(id: number, cascade: boolean = false) {
  const doctorId = toBigInt(id);

  if (cascade) {
    // Use Prisma transaction for cascade delete
    return await prisma.$transaction(async (tx) => {
      // Delete appointments first
      const deletedAppointments = await tx.appointment.deleteMany({
        where: { doctorId },
      });

      // Delete doctor schedules
      await tx.doctorSchedule.deleteMany({
        where: { doctorId },
      });

      // Delete medical records
      await tx.medicalRecord.deleteMany({
        where: { doctorId },
      });

      // Delete the doctor
      await tx.doctor.delete({
        where: { doctorId },
      });

      return {
        rowsAffected: 1,
        appointmentsDeleted: deletedAppointments.count,
      };
    });
  } else {
    // Simple delete without cascade
    await prisma.doctor.delete({
      where: { doctorId },
    });

    return {
      rowsAffected: 1,
      appointmentsDeleted: 0,
    };
  }
}

// ==================== PATIENTS ====================

/**
 * جلب جميع المرضى
 */
export async function getAllPatients(filters?: { doctorId?: number; specialty?: string; identificationNumber?: string; patientId?: number }) {
  const where: any = {};

  if (filters?.patientId) {
    where.patientId = toBigInt(filters.patientId);
  }

  if (filters?.doctorId) {
    where.primaryPhysician = toBigInt(filters.doctorId);
  }

  if (filters?.identificationNumber && filters.identificationNumber.trim()) {
    where.identificationNumber = { contains: filters.identificationNumber };
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      primaryPhysicianRelation: filters?.specialty ? {
        where: {
          specialty: { equals: filters.specialty, mode: 'insensitive' },
        },
      } : true,
    },
    orderBy: { name: 'asc' },
  });

  // Filter by specialty if needed
  let filteredPatients = patients;
  if (filters?.specialty && filters.specialty.trim()) {
    filteredPatients = patients.filter(p => 
      p.primaryPhysicianRelation?.specialty?.toLowerCase() === filters.specialty?.toLowerCase()
    );
  }

  // Convert to expected format
  return filteredPatients.map(p => ({
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
    PRIMARYPHYSICIANNAME: p.primaryPhysicianRelation?.name || null,
  })) as Patient[];
}

/**
 * جلب مريض by ID
 */
export async function getPatientById(id: number) {
  const patient = await prisma.patient.findUnique({
    where: { patientId: toBigInt(id) },
    include: {
      primaryPhysicianRelation: true,
    },
  });

  if (!patient) return null;

  return {
    PATIENT_ID: toNumber(patient.patientId),
    NAME: patient.name,
    EMAIL: patient.email,
    PHONE: patient.phone,
    DATEOFBIRTH: patient.dateOfBirth,
    GENDER: patient.gender,
    ADDRESS: patient.address,
    OCCUPATION: patient.occupation,
    EMERGENCYCONTACTNAME: patient.emergencyContactName,
    EMERGENCYCONTACTNUMBER: patient.emergencyContactNumber,
    PRIMARYPHYSICIAN: toNumber(patient.primaryPhysician),
    INSURANCEPROVIDER: patient.insuranceProvider,
    INSURANCEPOLICYNUMBER: patient.insurancePolicyNumber,
    ALLERGIES: patient.allergies,
    CURRENTMEDICATION: patient.currentMedication,
    FAMILYMEDICALHISTORY: patient.familyMedicalHistory,
    PASTMEDICALHISTORY: patient.pastMedicalHistory,
    IDENTIFICATIONTYPE: patient.identificationType,
    IDENTIFICATIONNUMBER: patient.identificationNumber,
    PRIVACYCONSENT: patient.privacyConsent,
    TREATMENTCONSENT: patient.treatmentConsent,
    DISCLOSURECONSENT: patient.disclosureConsent,
    PRIMARYPHYSICIANNAME: patient.primaryPhysicianRelation?.name || null,
  };
}

/**
 * إضافة مريض جديد
 */
export async function createPatient(patient: {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  address?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  primaryPhysician?: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationType?: string;
  identificationNumber?: string;
  privacyConsent: boolean;
  treatmentConsent: boolean;
  disclosureConsent: boolean;
}) {
  const newPatient = await prisma.patient.create({
    data: {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address || null,
      occupation: patient.occupation || null,
      emergencyContactName: patient.emergencyContactName || null,
      emergencyContactNumber: patient.emergencyContactNumber || null,
      primaryPhysician: patient.primaryPhysician ? toBigInt(patient.primaryPhysician) : null,
      insuranceProvider: patient.insuranceProvider || null,
      insurancePolicyNumber: patient.insurancePolicyNumber || null,
      allergies: patient.allergies || null,
      currentMedication: patient.currentMedication || null,
      familyMedicalHistory: patient.familyMedicalHistory || null,
      pastMedicalHistory: patient.pastMedicalHistory || null,
      identificationType: patient.identificationType || null,
      identificationNumber: patient.identificationNumber || null,
      privacyConsent: patient.privacyConsent ? 1 : 0,
      treatmentConsent: patient.treatmentConsent ? 1 : 0,
      disclosureConsent: patient.disclosureConsent ? 1 : 0,
    },
  });

  return toNumber(newPatient.patientId);
}

/**
 * تحديث مريض
 */
export async function updatePatient(
  id: number,
  patient: {
    NAME?: string;
    EMAIL?: string;
    PHONE?: string;
    DATEOFBIRTH?: Date | string;
    GENDER?: string;
    ADDRESS?: string;
    OCCUPATION?: string;
    EMERGENCYCONTACTNAME?: string;
    EMERGENCYCONTACTNUMBER?: string;
    PRIMARYPHYSICIAN?: number;
    INSURANCEPROVIDER?: string;
    INSURANCEPOLICYNUMBER?: string;
    ALLERGIES?: string;
    CURRENTMEDICATION?: string;
    FAMILYMEDICALHISTORY?: string;
    PASTMEDICALHISTORY?: string;
    IDENTIFICATIONTYPE?: string;
    IDENTIFICATIONNUMBER?: string;
    PRIVACYCONSENT?: boolean;
    TREATMENTCONSENT?: boolean;
    DISCLOSURECONSENT?: boolean;
  }
) {
  const updateData: any = {};

  if (patient.NAME !== undefined) updateData.name = patient.NAME;
  if (patient.EMAIL !== undefined) updateData.email = patient.EMAIL;
  if (patient.PHONE !== undefined) updateData.phone = patient.PHONE;
  if (patient.DATEOFBIRTH !== undefined) {
    updateData.dateOfBirth = patient.DATEOFBIRTH instanceof Date ? patient.DATEOFBIRTH : new Date(patient.DATEOFBIRTH);
  }
  if (patient.GENDER !== undefined) updateData.gender = patient.GENDER;
  if (patient.ADDRESS !== undefined) updateData.address = patient.ADDRESS;
  if (patient.OCCUPATION !== undefined) updateData.occupation = patient.OCCUPATION;
  if (patient.EMERGENCYCONTACTNAME !== undefined) updateData.emergencyContactName = patient.EMERGENCYCONTACTNAME;
  if (patient.EMERGENCYCONTACTNUMBER !== undefined) updateData.emergencyContactNumber = patient.EMERGENCYCONTACTNUMBER;
  if (patient.PRIMARYPHYSICIAN !== undefined) updateData.primaryPhysician = patient.PRIMARYPHYSICIAN ? toBigInt(patient.PRIMARYPHYSICIAN) : null;
  if (patient.INSURANCEPROVIDER !== undefined) updateData.insuranceProvider = patient.INSURANCEPROVIDER;
  if (patient.INSURANCEPOLICYNUMBER !== undefined) updateData.insurancePolicyNumber = patient.INSURANCEPOLICYNUMBER;
  if (patient.ALLERGIES !== undefined) updateData.allergies = patient.ALLERGIES;
  if (patient.CURRENTMEDICATION !== undefined) updateData.currentMedication = patient.CURRENTMEDICATION;
  if (patient.FAMILYMEDICALHISTORY !== undefined) updateData.familyMedicalHistory = patient.FAMILYMEDICALHISTORY;
  if (patient.PASTMEDICALHISTORY !== undefined) updateData.pastMedicalHistory = patient.PASTMEDICALHISTORY;
  if (patient.IDENTIFICATIONTYPE !== undefined) updateData.identificationType = patient.IDENTIFICATIONTYPE;
  if (patient.IDENTIFICATIONNUMBER !== undefined) updateData.identificationNumber = patient.IDENTIFICATIONNUMBER;
  if (patient.PRIVACYCONSENT !== undefined) updateData.privacyConsent = patient.PRIVACYCONSENT ? 1 : 0;
  if (patient.TREATMENTCONSENT !== undefined) updateData.treatmentConsent = patient.TREATMENTCONSENT ? 1 : 0;
  if (patient.DISCLOSURECONSENT !== undefined) updateData.disclosureConsent = patient.DISCLOSURECONSENT ? 1 : 0;

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }

  await prisma.patient.update({
    where: { patientId: toBigInt(id) },
    data: updateData,
  });

  return 1; // rowsAffected
}

/**
 * حذف مريض
 */
export async function deletePatient(id: number) {
  await prisma.patient.delete({
    where: { patientId: toBigInt(id) },
  });
  return 1; // rowsAffected
}

// ==================== APPOINTMENTS ====================

/**
 * جلب جميع المواعيد
 */
export async function getAllAppointments(filters?: {
  doctorId?: number;
  specialty?: string;
  identificationNumber?: string;
  invoiceNumber?: string;
  scheduleDate?: string;
}) {
  const where: any = {};

  if (filters?.doctorId) {
    where.doctorId = toBigInt(filters.doctorId);
  }

  if (filters?.scheduleDate) {
    const date = new Date(filters.scheduleDate);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    where.schedule = {
      gte: date,
      lt: nextDay,
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { schedule: 'desc' },
  });

  // Apply additional filters
  let filteredAppointments = appointments;

  if (filters?.specialty && filters.specialty.trim()) {
    filteredAppointments = filteredAppointments.filter(a => 
      a.doctor.specialty.toLowerCase() === filters.specialty?.toLowerCase()
    );
  }

  if (filters?.identificationNumber && filters.identificationNumber.trim()) {
    filteredAppointments = filteredAppointments.filter(a => 
      a.patient.identificationNumber?.includes(filters.identificationNumber || '')
    );
  }

  // Note: Invoice filtering would require Invoice model - using raw query if needed
  // For now, we'll return appointments without invoice data
  return filteredAppointments.map(a => ({
    APPOINTMENT_ID: toNumber(a.appointmentId),
    PATIENT_ID: toNumber(a.patientId),
    DOCTOR_ID: toNumber(a.doctorId),
    SCHEDULE: a.schedule,
    REASON: a.reason,
    NOTE: a.note,
    STATUS: a.status as 'pending' | 'scheduled' | 'cancelled',
    CANCELLATIONREASON: a.cancellationReason,
    PATIENT_NAME: a.patient.name,
    DOCTOR_NAME: a.doctor.name,
    APPOINTMENT_TYPE: a.appointmentType as 'consultation' | 'follow_up' | 'emergency',
    PAYMENT_STATUS: a.paymentStatus as 'unpaid' | 'partial' | 'paid' | 'refunded',
    PAYMENT_AMOUNT: a.paymentAmount ? Number(a.paymentAmount) : 0,
    PAYMENT_METHOD: a.paymentMethod,
    CONSULTATION_FEE: a.doctor.consultationFee ? Number(a.doctor.consultationFee) : 0,
    FOLLOW_UP_FEE: a.doctor.followUpFee ? Number(a.doctor.followUpFee) : 0,
    HAS_INVOICE: 0, // Would need Invoice model
    INVOICE_ID: null,
    INVOICE_NUMBER: null,
    INVOICE_PAYMENT_STATUS: null,
    IDENTIFICATIONNUMBER: a.patient.identificationNumber || '',
  }));
}

/**
 * جلب مواعيد المريض
 */
export async function getPatientAppointments(patientId: number) {
  const appointments = await prisma.appointment.findMany({
    where: { patientId: toBigInt(patientId) },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { schedule: 'desc' },
  });

  return appointments.map(a => ({
    APPOINTMENT_ID: toNumber(a.appointmentId),
    PATIENT_ID: toNumber(a.patientId),
    DOCTOR_ID: toNumber(a.doctorId),
    SCHEDULE: a.schedule,
    REASON: a.reason,
    NOTE: a.note,
    STATUS: a.status as 'pending' | 'scheduled' | 'cancelled',
    CANCELLATIONREASON: a.cancellationReason,
    PATIENT_NAME: a.patient.name,
    DOCTOR_NAME: a.doctor.name,
    APPOINTMENT_TYPE: a.appointmentType as 'consultation' | 'follow_up' | 'emergency',
    PAYMENT_STATUS: a.paymentStatus as 'unpaid' | 'partial' | 'paid' | 'refunded',
    PAYMENT_AMOUNT: a.paymentAmount ? Number(a.paymentAmount) : 0,
    PAYMENT_METHOD: a.paymentMethod,
    CONSULTATION_FEE: a.doctor.consultationFee ? Number(a.doctor.consultationFee) : 0,
    FOLLOW_UP_FEE: a.doctor.followUpFee ? Number(a.doctor.followUpFee) : 0,
    HAS_INVOICE: 0,
    INVOICE_ID: null,
    INVOICE_NUMBER: null,
    INVOICE_PAYMENT_STATUS: null,
  }));
}

/**
 * جلب موعد by ID
 */
export async function getAppointmentById(id: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { appointmentId: toBigInt(id) },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!appointment) return null;

  return {
    APPOINTMENT_ID: toNumber(appointment.appointmentId),
    PATIENT_ID: toNumber(appointment.patientId),
    DOCTOR_ID: toNumber(appointment.doctorId),
    SCHEDULE: appointment.schedule,
    REASON: appointment.reason,
    NOTE: appointment.note,
    STATUS: appointment.status as 'pending' | 'scheduled' | 'cancelled',
    CANCELLATIONREASON: appointment.cancellationReason,
    PATIENT_NAME: appointment.patient.name,
    DOCTOR_NAME: appointment.doctor.name,
    APPOINTMENT_TYPE: appointment.appointmentType as 'consultation' | 'follow_up' | 'emergency',
    PAYMENT_STATUS: appointment.paymentStatus as 'unpaid' | 'partial' | 'paid' | 'refunded',
    PAYMENT_AMOUNT: appointment.paymentAmount ? Number(appointment.paymentAmount) : 0,
  };
}

/**
 * إنشاء موعد جديد
 */
export async function createAppointment(appointment: {
  patient_id: number;
  doctor_id: number;
  schedule: Date;
  reason: string;
  note?: string;
  status?: string;
  appointment_type?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_method?: string;
}) {
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const localHours = pad2(appointment.schedule.getHours());
  const localMinutes = pad2(appointment.schedule.getMinutes());
  const scheduleAt = `${localHours}:${localMinutes}`;

  const newAppointment = await prisma.appointment.create({
    data: {
      patientId: toBigInt(appointment.patient_id),
      doctorId: toBigInt(appointment.doctor_id),
      schedule: appointment.schedule,
      scheduleAt: scheduleAt,
      reason: appointment.reason,
      note: appointment.note || null,
      status: (appointment.status || 'pending') as 'pending' | 'scheduled' | 'cancelled' | 'completed',
      appointmentType: (appointment.appointment_type || 'consultation') as 'consultation' | 'follow_up' | 'emergency',
      paymentStatus: (appointment.payment_status || 'unpaid') as 'unpaid' | 'partial' | 'paid' | 'refunded',
      paymentAmount: appointment.payment_amount || 0,
      paymentMethod: appointment.payment_method || null,
    },
  });

  return {
    outBinds: {
      id: [toNumber(newAppointment.appointmentId)],
    },
    rows: [],
  };
}

/**
 * تحديث موعد
 */
export async function updateAppointment(
  id: number,
  appointment: {
    patient_id?: number;
    doctor_id?: number;
    schedule?: Date;
    reason?: string;
    note?: string;
    status?: string;
    cancellationReason?: string;
    appointment_type?: string;
    payment_status?: string;
    payment_amount?: number;
  }
) {
  const updateData: any = {};

  if (appointment.patient_id !== undefined) updateData.patientId = toBigInt(appointment.patient_id);
  if (appointment.doctor_id !== undefined) updateData.doctorId = toBigInt(appointment.doctor_id);
  if (appointment.schedule !== undefined) {
    updateData.schedule = appointment.schedule;
    // Update scheduleAt if schedule is provided
    const pad2 = (n: number) => n.toString().padStart(2, '0');
    const localHours = pad2(appointment.schedule.getHours());
    const localMinutes = pad2(appointment.schedule.getMinutes());
    updateData.scheduleAt = `${localHours}:${localMinutes}`;
  }
  if (appointment.reason !== undefined) updateData.reason = appointment.reason;
  if (appointment.note !== undefined) updateData.note = appointment.note;
  if (appointment.status !== undefined) updateData.status = appointment.status as 'pending' | 'scheduled' | 'cancelled' | 'completed';
  if (appointment.cancellationReason !== undefined) updateData.cancellationReason = appointment.cancellationReason;
  if (appointment.appointment_type !== undefined) updateData.appointmentType = appointment.appointment_type as 'consultation' | 'follow_up' | 'emergency';
  if (appointment.payment_status !== undefined) updateData.paymentStatus = appointment.payment_status as 'unpaid' | 'partial' | 'paid' | 'refunded';
  if (appointment.payment_amount !== undefined) updateData.paymentAmount = appointment.payment_amount;

  // Auto-calculate payment status if payment_amount is updated but payment_status is not
  if (appointment.payment_amount !== undefined && appointment.payment_status === undefined) {
    try {
      const currentAppointment = await prisma.appointment.findUnique({
        where: { appointmentId: toBigInt(id) },
        include: { doctor: true },
      });

      if (currentAppointment) {
        const appointmentType = currentAppointment.appointmentType || 'consultation';
        const expectedFee = appointmentType === 'follow_up' 
          ? (currentAppointment.doctor.followUpFee ? Number(currentAppointment.doctor.followUpFee) : 0)
          : (currentAppointment.doctor.consultationFee ? Number(currentAppointment.doctor.consultationFee) : 0);
        const paidAmount = appointment.payment_amount || 0;
        updateData.paymentStatus = calculatePaymentStatus(paidAmount, expectedFee);
      }
    } catch (error) {
      console.error('Error calculating payment status:', error);
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  await prisma.appointment.update({
    where: { appointmentId: toBigInt(id) },
    data: updateData,
  });

  // Note: Invoice updates would require Invoice model - using raw queries if needed
  return 1; // rowsAffected
}

/**
 * تحديث حالة الموعد فقط
 */
export async function updateAppointmentStatus(
  appointmentId: number,
  status: string
): Promise<number> {
  await prisma.appointment.update({
    where: { appointmentId: toBigInt(appointmentId) },
    data: { status: status as 'pending' | 'scheduled' | 'cancelled' | 'completed' },
  });
  return 1;
}

/**
 * حذف موعد
 */
export async function deleteAppointment(id: number) {
  await prisma.appointment.delete({
    where: { appointmentId: toBigInt(id) },
  });
  return 1; // rowsAffected
}

/**
 * جلب معرف الطبيب بواسطة البريد الإلكتروني للمستخدم
 */
export async function getDoctorIdByUserEmail(email: string) {
  // Try exact match first
  const doctor = await prisma.doctor.findFirst({
    where: {
      email: { equals: email, mode: 'insensitive' },
    },
  });

  if (doctor) {
    return toNumber(doctor.doctorId);
  }

  // Try partial match (remove numbers from email)
  const emailWithoutNumbers = email.replace(/\d/g, '');
  const doctors = await prisma.doctor.findMany({
    where: {
      email: {
        contains: emailWithoutNumbers,
        mode: 'insensitive',
      },
    },
  });

  // Find the best match (email without numbers matches)
  for (const d of doctors) {
    const doctorEmailWithoutNumbers = d.email.replace(/\d/g, '');
    if (doctorEmailWithoutNumbers.toLowerCase() === emailWithoutNumbers.toLowerCase()) {
      return toNumber(d.doctorId);
    }
  }

  return null;
}

/**
 * جلب معرف المريض بواسطة البريد الإلكتروني للمستخدم
 */
export async function getPatientIdByUserEmail(email: string) {
  // Try exact match first
  const patient = await prisma.patient.findFirst({
    where: {
      email: { equals: email, mode: 'insensitive' },
    },
  });

  if (patient) {
    return toNumber(patient.patientId);
  }

  // Try partial match (remove numbers from email)
  const emailWithoutNumbers = email.replace(/\d/g, '');
  const patients = await prisma.patient.findMany({
    where: {
      email: {
        contains: emailWithoutNumbers,
        mode: 'insensitive',
      },
    },
  });

  // Find the best match
  for (const p of patients) {
    const patientEmailWithoutNumbers = p.email.replace(/\d/g, '');
    if (patientEmailWithoutNumbers.toLowerCase() === emailWithoutNumbers.toLowerCase()) {
      return toNumber(p.patientId);
    }
  }

  return null;
}

// ==================== INVOICES ====================

export async function getAllInvoices(filters?: {
  patient_id?: number;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  doctor_id?: number;
  specialty?: string;
  identificationNumber?: string;
}): Promise<Invoice[]> {
  try {
    const where: any = {};

    if (filters?.patient_id) {
      where.patientId = toBigInt(filters.patient_id);
    }
    if (filters?.payment_status) {
      where.paymentStatus = filters.payment_status;
    }
    if (filters?.date_from) {
      where.invoiceDate = { ...where.invoiceDate, gte: new Date(filters.date_from) };
    }
    if (filters?.date_to) {
      where.invoiceDate = { ...where.invoiceDate, lte: new Date(filters.date_to) };
    }
    // Handle doctor_id and specialty filters
    if (filters?.doctor_id || (filters?.specialty && filters.specialty.trim())) {
      where.appointment = {};
      
      if (filters?.doctor_id) {
        where.appointment.doctorId = toBigInt(filters.doctor_id);
      }
      
      if (filters?.specialty && filters.specialty.trim()) {
        where.appointment.doctor = {
          specialty: {
            contains: filters.specialty,
            mode: 'insensitive',
          },
        };
      }
    }
    if (filters?.identificationNumber && filters.identificationNumber.trim()) {
      where.patient = {
        identificationNumber: {
          contains: filters.identificationNumber,
          mode: 'insensitive',
        },
      };
    }

    const invoices = await prisma.invoice.findMany({
    where,
    include: {
      patient: true,
      appointment: {
        include: {
          doctor: true,
        },
      },
      creator: true,
    },
    orderBy: [
      { invoiceDate: 'desc' },
      { invoiceId: 'desc' },
    ],
  });

  return invoices.map((i: any) => ({
    INVOICE_ID: toNumber(i.invoiceId),
    INVOICE_NUMBER: i.invoiceNumber || '',
    INVOICE_DATE: i.invoiceDate,
    AMOUNT: Number(i.amount),
    DISCOUNT: Number(i.discount),
    TOTAL_AMOUNT: Number(i.totalAmount),
    PAID_AMOUNT: Number(i.paidAmount),
    REMAINING_AMOUNT: Number(i.totalAmount) - Number(i.paidAmount),
    PAYMENT_STATUS: i.paymentStatus,
    PAYMENT_METHOD: i.paymentMethod || undefined,
    PAYMENT_DATE: i.paymentDate || undefined,
    PATIENT_ID: toNumber(i.patientId),
    APPOINTMENT_ID: i.appointmentId ? toNumber(i.appointmentId) : undefined,
    PATIENT_NAME: i.patient.name,
    PATIENT_PHONE: i.patient.phone,
    PATIENT_EMAIL: i.patient.email,
    APPOINTMENT_DATE: i.appointment?.schedule,
    DOCTOR_ID: i.appointment?.doctorId ? toNumber(i.appointment.doctorId) : undefined,
    DOCTOR_NAME: i.appointment?.doctor?.name,
    DOCTOR_SPECIALTY: i.appointment?.doctor?.specialty,
    CREATED_BY_NAME: i.creator?.fullName,
    CREATED_AT: i.createdAt,
    NOTES: i.notes || undefined,
  }));
  } catch (error) {
    console.error('Error in getAllInvoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack, error });
    throw new Error(`Failed to fetch invoices: ${errorMessage}`);
  }
}

export async function getInvoiceById(invoiceId: number): Promise<Invoice | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceId: toBigInt(invoiceId) },
    include: {
      patient: true,
      appointment: {
        include: {
          doctor: true,
        },
      },
      creator: true,
    },
  });

  if (!invoice) return null;

  return {
    INVOICE_ID: toNumber(invoice.invoiceId),
    INVOICE_NUMBER: invoice.invoiceNumber || '',
    INVOICE_DATE: invoice.invoiceDate,
    AMOUNT: Number(invoice.amount),
    DISCOUNT: Number(invoice.discount),
    TOTAL_AMOUNT: Number(invoice.totalAmount),
    PAID_AMOUNT: Number(invoice.paidAmount),
    REMAINING_AMOUNT: Number(invoice.totalAmount) - Number(invoice.paidAmount),
    PAYMENT_STATUS: invoice.paymentStatus as 'paid' | 'partial' | 'unpaid' | 'cancelled',
    PAYMENT_METHOD: invoice.paymentMethod || undefined,
    PAYMENT_DATE: invoice.paymentDate || undefined,
    PATIENT_ID: toNumber(invoice.patientId),
    APPOINTMENT_ID: invoice.appointmentId ? toNumber(invoice.appointmentId) : undefined,
    PATIENT_NAME: invoice.patient.name,
    PATIENT_PHONE: invoice.patient.phone,
    PATIENT_EMAIL: invoice.patient.email,
    APPOINTMENT_DATE: invoice.appointment?.schedule,
    DOCTOR_ID: invoice.appointment?.doctorId ? toNumber(invoice.appointment.doctorId) : undefined,
    DOCTOR_NAME: invoice.appointment?.doctor?.name,
    DOCTOR_SPECIALTY: invoice.appointment?.doctor?.specialty,
    CREATED_BY_NAME: invoice.creator?.fullName,
    CREATED_AT: invoice.createdAt,
    NOTES: invoice.notes || undefined,
  };
}

export async function createInvoice(
  data: CreateInvoiceDto,
  createdBy?: number
): Promise<number> {
  // Calculate amount based on appointment type if appointment_id is provided
  let calculatedAmount = data.amount;
  
  if (data.appointment_id) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { appointmentId: toBigInt(data.appointment_id) },
        include: { doctor: true },
      });

      if (appointment) {
        const appointmentType = appointment.appointmentType || 'consultation';
        const fee = appointmentType === 'follow_up'
          ? (appointment.doctor.followUpFee ? Number(appointment.doctor.followUpFee) : 0)
          : (appointment.doctor.consultationFee ? Number(appointment.doctor.consultationFee) : 0);
        calculatedAmount = fee;
      }
    } catch (error) {
      console.error('Error fetching appointment/doctor details:', error);
    }
  }

  const total = Math.max(0, (data.total_amount ?? calculatedAmount - (data.discount || 0)));
  const paid = data.paid_amount ?? 0;
  const paymentStatus = calculatePaymentStatus(paid, total);

  // Create invoice using Prisma (ID will be auto-generated by trigger)
  const invoiceData: any = {
    patientId: toBigInt(data.patient_id),
    appointmentId: data.appointment_id ? toBigInt(data.appointment_id) : null,
    invoiceDate: data.invoice_date ? new Date(data.invoice_date) : new Date(),
    amount: calculatedAmount,
    discount: data.discount ?? 0,
    totalAmount: total,
    paidAmount: paid,
    paymentStatus: paymentStatus as 'unpaid' | 'partial' | 'paid' | 'cancelled',
    paymentMethod: data.payment_method || null,
    paymentDate: paid > 0 ? new Date() : null,
    notes: data.notes || null,
    createdBy: createdBy ? toBigInt(createdBy) : null,
  };
  
  // Only include invoiceNumber if provided (otherwise trigger will generate it)
  if (data.invoice_number) {
    invoiceData.invoiceNumber = data.invoice_number;
  }
  
  const invoice = await prisma.invoice.create({
    data: invoiceData,
  });

  // Update appointment payment info if appointment_id exists
  if (data.appointment_id) {
    try {
      await prisma.appointment.update({
        where: { appointmentId: toBigInt(data.appointment_id) },
        data: {
          paymentAmount: paid,
          paymentMethod: data.payment_method || null,
          paymentStatus: paymentStatus as 'unpaid' | 'partial' | 'paid' | 'refunded',
        },
      });
    } catch (error) {
      console.error('Error updating appointment payment info:', error);
    }
  }

  return toNumber(invoice.invoiceId);
}

export async function updateInvoice(invoiceId: number, data: Partial<CreateInvoiceDto>): Promise<number> {
  const updateData: any = {};

  if (data.patient_id !== undefined) {
    updateData.patientId = toBigInt(data.patient_id);
  }
  if (data.appointment_id !== undefined) {
    updateData.appointmentId = data.appointment_id ? toBigInt(data.appointment_id) : null;
  }
  if (data.invoice_number !== undefined) {
    updateData.invoiceNumber = data.invoice_number;
  }
  if (data.invoice_date !== undefined) {
    updateData.invoiceDate = new Date(data.invoice_date);
  }
  if (data.amount !== undefined) {
    updateData.amount = data.amount;
  }
  if (data.discount !== undefined) {
    updateData.discount = data.discount ?? 0;
  }
  if (data.total_amount !== undefined) {
    updateData.totalAmount = Math.max(0, data.total_amount);
  } else if (data.amount !== undefined || data.discount !== undefined) {
    // Recalculate total_amount
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceId: toBigInt(invoiceId) },
    });
    if (invoice) {
      const amount = data.amount ?? Number(invoice.amount);
      const discount = data.discount ?? Number(invoice.discount);
      updateData.totalAmount = Math.max(0, amount - discount);
    }
  }
  if (data.paid_amount !== undefined) {
    updateData.paidAmount = Math.max(0, data.paid_amount ?? 0);
  }
  if (data.payment_method !== undefined) {
    updateData.paymentMethod = data.payment_method || null;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes || null;
  }

  if (Object.keys(updateData).length === 0) return 0;

  // Payment status will be updated automatically by trigger
  // But we can also calculate it here for consistency
  if (data.paid_amount !== undefined || data.total_amount !== undefined) {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceId: toBigInt(invoiceId) },
    });
    if (invoice) {
      const paidAmount = data.paid_amount ?? Number(invoice.paidAmount);
      const totalAmount = data.total_amount ?? Number(invoice.totalAmount);
      const paymentStatus = calculatePaymentStatus(paidAmount, totalAmount);
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && paidAmount > 0) {
        updateData.paymentDate = new Date();
      }
    }
  }

  const result = await prisma.invoice.update({
    where: { invoiceId: toBigInt(invoiceId) },
    data: updateData,
  });

  return result ? 1 : 0;
}

export async function updateInvoicePayment(invoiceId: number, paidAmount: number, paymentMethod?: string): Promise<number> {
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceId: toBigInt(invoiceId) },
  });

  if (!invoice) throw new Error('Invoice not found');

  const paymentStatus = calculatePaymentStatus(paidAmount, Number(invoice.totalAmount));

  await prisma.invoice.update({
    where: { invoiceId: toBigInt(invoiceId) },
    data: {
      paidAmount: paidAmount,
      paymentMethod: paymentMethod || null,
      paymentDate: paidAmount > 0 ? new Date() : invoice.paymentDate,
      paymentStatus: paymentStatus as 'unpaid' | 'partial' | 'paid' | 'cancelled',
    },
  });

  // Update related appointment if exists
  if (invoice.appointmentId) {
    try {
      await prisma.appointment.update({
        where: { appointmentId: invoice.appointmentId },
        data: {
          paymentAmount: paidAmount,
          paymentMethod: paymentMethod || null,
          paymentStatus: paymentStatus as 'unpaid' | 'partial' | 'paid' | 'refunded',
        },
      });
    } catch (error) {
      console.error('Error updating appointment payment info:', error);
    }
  }

  return 1;
}

export async function deleteInvoice(invoiceId: number): Promise<number> {
  try {
    await prisma.invoice.delete({
      where: { invoiceId: toBigInt(invoiceId) },
    });
    return 1;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return 0;
  }
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenueRow[]> {
  const result = await executeQuery<MonthlyRevenueRow>(
    `
    SELECT 
      TO_CHAR(invoice_date, 'YYYY-MM') AS "MONTH",
      TO_CHAR(invoice_date, 'YYYY') AS "YEAR",
      TO_CHAR(invoice_date, 'Month') AS "MONTH_NAME",
      COUNT(*) AS "TOTAL_INVOICES",
      SUM(total_amount) AS "TOTAL_REVENUE",
      SUM(paid_amount) AS "TOTAL_PAID",
      SUM(total_amount - paid_amount) AS "TOTAL_REMAINING",
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS "PAID_COUNT",
      SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) AS "UNPAID_COUNT",
      SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) AS "PARTIAL_COUNT"
    FROM invoices
    GROUP BY TO_CHAR(invoice_date, 'YYYY-MM'), 
             TO_CHAR(invoice_date, 'YYYY'),
             TO_CHAR(invoice_date, 'Month')
    ORDER BY TO_CHAR(invoice_date, 'YYYY-MM') DESC
    `
  );
  return result.rows;
}

export async function getTotalRevenue(): Promise<number> {
  const result = await executeQuery<{ total_revenue: number }>(
    `SELECT SUM(total_amount) AS total_revenue FROM invoices`
  );
  return Number(result.rows[0]?.total_revenue || 0);
}

export async function getCurrentMonthRevenue(): Promise<number> {
  const result = await executeQuery<{ monthly_revenue: number }>(
    `SELECT SUM(total_amount) AS monthly_revenue 
     FROM invoices 
     WHERE TO_CHAR(invoice_date, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')`
  );
  return Number(result.rows[0]?.monthly_revenue || 0);
}

export async function getCurrentDayRevenue(): Promise<number> {
  const result = await executeQuery<{ daily_revenue: number }>(
    `SELECT SUM(total_amount) AS daily_revenue 
     FROM invoices 
     WHERE DATE(invoice_date) = CURRENT_DATE`
  );
  return Number(result.rows[0]?.daily_revenue || 0);
}

export async function getTotalPaidRevenue(): Promise<number> {
  const result = await executeQuery<{ total_paid: number }>(
    `SELECT SUM(paid_amount) AS total_paid FROM invoices`
  );
  return Number(result.rows[0]?.total_paid || 0);
}

export async function getTotalRemainingRevenue(): Promise<number> {
  const result = await executeQuery<{ total_remaining: number }>(
    `SELECT SUM(total_amount - paid_amount) AS total_remaining FROM invoices`
  );
  return Number(result.rows[0]?.total_remaining || 0);
}

// ==================== DOCTOR SCHEDULE MANAGEMENT ====================

/**
 * جلب جدول الطبيب
 */
export async function getDoctorSchedules(doctorId: number) {
  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: toBigInt(doctorId) },
    include: { doctor: true },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  });

  const dayNames: Record<number, string> = {
    1: 'الأحد',
    2: 'الاثنين',
    3: 'الثلاثاء',
    4: 'الأربعاء',
    5: 'الخميس',
    6: 'الجمعة',
    7: 'السبت',
  };

  return schedules.map(s => ({
    SCHEDULE_ID: toNumber(s.scheduleId),
    DOCTOR_ID: toNumber(s.doctorId),
    DOCTOR_NAME: s.doctor.name,
    SPECIALTY: s.doctor.specialty,
    DAY_OF_WEEK: s.dayOfWeek,
    DAY_NAME_AR: dayNames[s.dayOfWeek] || '',
    START_TIME: s.startTime,
    END_TIME: s.endTime,
    SLOT_DURATION: s.slotDuration,
    IS_AVAILABLE: s.isAvailable,
    CREATED_AT: s.createdAt,
    UPDATED_AT: s.updatedAt,
  })) as DoctorSchedule[];
}

/**
 * إنشاء جدول زمني جديد للطبيب
 */
export async function createDoctorSchedule(scheduleData: CreateScheduleDto) {
  const newSchedule = await prisma.doctorSchedule.create({
    data: {
      doctorId: toBigInt(scheduleData.doctor_id),
      dayOfWeek: scheduleData.day_of_week,
      startTime: scheduleData.start_time,
      endTime: scheduleData.end_time,
      slotDuration: scheduleData.slot_duration || 30,
      isAvailable: scheduleData.is_available || 1,
    },
  });

  return toNumber(newSchedule.scheduleId);
}

/**
 * تحديث جدول زمني للطبيب
 */
export async function updateDoctorSchedule(scheduleId: number, updateData: UpdateScheduleDto) {
  const updateFields: any = {};

  if (updateData.day_of_week !== undefined) updateFields.dayOfWeek = updateData.day_of_week;
  if (updateData.start_time !== undefined) updateFields.startTime = updateData.start_time;
  if (updateData.end_time !== undefined) updateFields.endTime = updateData.end_time;
  if (updateData.slot_duration !== undefined) updateFields.slotDuration = updateData.slot_duration;
  if (updateData.is_available !== undefined) updateFields.isAvailable = updateData.is_available;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('No fields to update');
  }

  await prisma.doctorSchedule.update({
    where: { scheduleId: toBigInt(scheduleId) },
    data: updateFields,
  });

  return 1; // rowsAffected
}

/**
 * حذف جدول زمني للطبيب
 */
export async function deleteDoctorSchedule(scheduleId: number) {
  await prisma.doctorSchedule.delete({
    where: { scheduleId: toBigInt(scheduleId) },
  });
  return 1; // rowsAffected
}

/**
 * جلب الأوقات المتاحة للطبيب في يوم معين
 */
export async function getAvailableTimeSlots(doctorId: number, date: Date) {
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert: Sunday = 0 -> 7, Monday = 1 -> 1, etc.
  const scheduleDate = date.toISOString().split('T')[0];

  // Get doctor's schedule for this day
  const schedules = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: toBigInt(doctorId),
      dayOfWeek: dayOfWeek,
      isAvailable: 1,
    },
    orderBy: { startTime: 'asc' },
  });

  if (schedules.length === 0) {
    return [];
  }

  // Get existing appointments for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: toBigInt(doctorId),
      schedule: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['scheduled', 'pending'],
      },
    },
    select: {
      scheduleAt: true,
      appointmentId: true,
    },
  });

  const bookedTimes = new Set(appointments.map(apt => apt.scheduleAt).filter(Boolean));

  // Generate time slots
  const timeSlots: TimeSlot[] = [];

  for (const schedule of schedules) {
    const startTime = schedule.startTime;
    const endTime = schedule.endTime;
    const slotDuration = schedule.slotDuration;

    // Convert time strings to minutes
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Generate slots
    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotDuration) {
      const slotStartTime = minutesToTime(currentMinutes);
      const slotEndTime = minutesToTime(Math.min(currentMinutes + slotDuration, endMinutes));
      
      const appointment = appointments.find(apt => apt.scheduleAt === slotStartTime);
      
      timeSlots.push({
        start_time: slotStartTime,
        end_time: slotEndTime,
        is_available: true,
        is_booked: bookedTimes.has(slotStartTime),
        appointment_id: appointment ? toNumber(appointment.appointmentId) : undefined,
      });
    }
  }

  return timeSlots;
}

/**
 * التحقق من توفر موعد في وقت معين
 */
export async function isTimeSlotAvailable(doctorId: number, date: Date, time: string) {
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
  
  // Check if doctor has schedule for this day and time
  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId: toBigInt(doctorId),
      dayOfWeek: dayOfWeek,
      startTime: { lte: time },
      endTime: { gt: time },
      isAvailable: 1,
    },
  });

  if (!schedule) {
    return false;
  }

  // Check if time slot is already booked
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointment = await prisma.appointment.findFirst({
    where: {
      doctorId: toBigInt(doctorId),
      schedule: {
        gte: startOfDay,
        lte: endOfDay,
      },
      scheduleAt: time,
      status: {
        in: ['scheduled', 'pending'],
      },
    },
  });

  return !appointment;
}
