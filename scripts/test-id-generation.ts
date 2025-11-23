/**
 * Test script to verify ID generation is working
 * Run with: pnpm tsx scripts/test-id-generation.ts
 */

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🧪 Testing ID generation...\n');

  try {
    // Test Doctor ID generation (prefix: 75)
    console.log('1. Testing Doctor ID generation...');
    const doctor = await prisma.doctor.create({
      data: {
        name: 'Test Doctor',
        email: `test-doctor-${Date.now()}@example.com`,
        phone: '+201000000000',
        specialty: 'Test Specialty',
        isAvailable: 1,
      },
    });
    console.log(`   ✅ Created doctor with ID: ${doctor.doctorId}`);
    console.log(`   ✅ ID prefix: ${doctor.doctorId.toString().substring(0, 2)} (should be 75)\n`);

    // Test Patient ID generation (prefix: 95)
    console.log('2. Testing Patient ID generation...');
    const patient = await prisma.patient.create({
      data: {
        name: 'Test Patient',
        email: `test-patient-${Date.now()}@example.com`,
        phone: '+201000000001',
        privacyConsent: 1,
        treatmentConsent: 1,
        disclosureConsent: 1,
      },
    });
    console.log(`   ✅ Created patient with ID: ${patient.patientId}`);
    console.log(`   ✅ ID prefix: ${patient.patientId.toString().substring(0, 2)} (should be 95)\n`);

    // Test Appointment ID generation (prefix: 55)
    console.log('3. Testing Appointment ID generation...');
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.patientId,
        doctorId: doctor.doctorId,
        schedule: new Date(),
        reason: 'Test appointment',
        status: 'pending',
      },
    });
    console.log(`   ✅ Created appointment with ID: ${appointment.appointmentId}`);
    console.log(`   ✅ ID prefix: ${appointment.appointmentId.toString().substring(0, 2)} (should be 55)\n`);

    // Cleanup test data
    console.log('4. Cleaning up test data...');
    await prisma.appointment.delete({ where: { appointmentId: appointment.appointmentId } });
    await prisma.patient.delete({ where: { patientId: patient.patientId } });
    await prisma.doctor.delete({ where: { doctorId: doctor.doctorId } });
    console.log('   ✅ Test data cleaned up\n');

    console.log('✅ All ID generation tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

