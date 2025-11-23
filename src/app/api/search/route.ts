import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SearchResult {
  type: 'patient' | 'doctor' | 'appointment' | 'invoice';
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  href: string;
  relevance: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const searchTerm = query.trim().toUpperCase();
    const results: SearchResult[] = [];

    try {
      // Search Patients
      const patients = await prisma.patient.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { identificationNumber: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: [
          {
            name: {
              sort: 'asc',
            },
          },
        ],
      });

      patients.forEach((patient) => {
        const relevance = calculateRelevance(searchTerm, [
          patient.name,
          patient.identificationNumber || '',
          patient.phone || '',
          patient.email || '',
        ]);

        results.push({
          type: 'patient',
          id: Number(patient.patientId),
          title: patient.name,
          subtitle: `ID: ${patient.identificationNumber || 'N/A'}`,
          description: `${patient.phone || 'N/A'} • ${patient.email || 'No email'}`,
          href: `/patients/${patient.patientId}`,
          relevance,
        });
      });

      // Search Doctors
      const doctors = await prisma.doctor.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
            { specialty: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: {
          name: 'asc',
        },
      });

      doctors.forEach((doctor) => {
        const relevance = calculateRelevance(searchTerm, [
          doctor.name,
          doctor.email,
          doctor.phone,
          doctor.specialty,
        ]);

        results.push({
          type: 'doctor',
          id: Number(doctor.doctorId),
          title: doctor.name,
          subtitle: doctor.specialty || 'No specialty',
          description: `${doctor.email || 'No email'} • ${doctor.phone || 'No phone'}`,
          href: `/doctors/${doctor.doctorId}`,
          relevance,
        });
      });

      // Search Appointments
      const appointments = await prisma.appointment.findMany({
        where: {
          OR: [
            { patient: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { doctor: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        include: {
          patient: true,
          doctor: true,
        },
        take: limit,
        orderBy: {
          schedule: 'desc',
        },
      });

      appointments.forEach((appointment) => {
        const date = appointment.schedule;
        const relevance = calculateRelevance(searchTerm, [
          appointment.patient?.name || '',
          appointment.doctor?.name || '',
        ]);

        results.push({
          type: 'appointment',
          id: Number(appointment.appointmentId),
          title: `${appointment.patient?.name || 'Unknown'} - ${appointment.doctor?.name || 'Unknown'}`,
          subtitle: `Date: ${date.toLocaleDateString()}`,
          description: `Status: ${appointment.status || 'N/A'} • Payment: ${appointment.paymentStatus || 'N/A'}`,
          href: `/appointments/${appointment.appointmentId}`,
          relevance,
        });
      });

      // Search Invoices (using raw query since Invoice model doesn't exist in schema)
      const invoiceSearchTerm = `%${searchTerm}%`;
      const invoiceResults = await prisma.$queryRawUnsafe<Array<{
        invoice_id: bigint;
        invoice_date: Date;
        total_amount: number;
        payment_status: string;
        patient_name: string | null;
        doctor_name: string | null;
      }>>(`
        SELECT 
          i.invoice_id,
          i.invoice_date,
          i.total_amount,
          i.payment_status,
          p.name AS patient_name,
          d.name AS doctor_name
        FROM invoices i
        LEFT JOIN patients p ON i.patient_id = p.patient_id
        LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
        LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
        WHERE UPPER(p.name) LIKE UPPER($1)
           OR UPPER(d.name) LIKE UPPER($1)
           OR CAST(i.invoice_id AS TEXT) LIKE $1
           OR TO_CHAR(i.invoice_date, 'YYYY-MM-DD') LIKE $1
        ORDER BY i.invoice_date DESC
        LIMIT $2
      `, invoiceSearchTerm, limit);

      invoiceResults.forEach((invoice) => {
        const date = new Date(invoice.invoice_date);
        const relevance = calculateRelevance(searchTerm, [
          invoice.patient_name || '',
          invoice.doctor_name || '',
          invoice.invoice_id.toString(),
        ]);

        results.push({
          type: 'invoice',
          id: Number(invoice.invoice_id),
          title: `Invoice #${invoice.invoice_id}`,
          subtitle: `${invoice.patient_name || 'Unknown'} - ${invoice.doctor_name || 'Unknown'}`,
          description: `${date.toLocaleDateString()} • ${Number(invoice.total_amount) || 0} EGP • ${invoice.payment_status || 'N/A'}`,
          href: `/invoices/${invoice.invoice_id}`,
          relevance,
        });
      });

      // Sort by relevance (higher relevance first)
      results.sort((a, b) => b.relevance - a.relevance);

      return NextResponse.json({
        results: results.slice(0, limit),
        total: results.length,
        query: searchTerm,
      });
    } catch (dbError) {
      throw dbError;
    }
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform search',
        details: error.message,
        results: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate relevance score
function calculateRelevance(searchTerm: string, fields: string[]): number {
  let relevance = 0;
  const upperSearch = searchTerm.toUpperCase();

  fields.forEach((field, index) => {
    if (!field) return;

    const upperField = field.toUpperCase();

    // Exact match = highest score
    if (upperField === upperSearch) {
      relevance += 100 * (fields.length - index);
    }
    // Starts with search term = high score
    else if (upperField.startsWith(upperSearch)) {
      relevance += 50 * (fields.length - index);
    }
    // Contains search term = medium score
    else if (upperField.includes(upperSearch)) {
      relevance += 25 * (fields.length - index);
    }
  });

  return relevance;
}

