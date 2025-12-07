/**
 * Prisma Seed Script - Complete Data
 * Run with: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with complete data...\n');

  try {
    // 1. Create Roles
    console.log('1. Creating roles...');
    const rolesData = [
      {
        roleId: 211,
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with all permissions',
        isActive: 1,
      },
      {
        roleId: 212,
        name: 'ADMIN',
        description: 'Administrator',
        isActive: 1,
      },
      {
        roleId: 213,
        name: 'DOCTOR',
        description: 'Doctor',
        isActive: 1,
      },
      {
        roleId: 214,
        name: 'NURSE',
        description: 'Nurse',
        isActive: 1,
      },
      {
        roleId: 215,
        name: 'RECEPTIONIST',
        description: 'Receptionist',
        isActive: 1,
      },
      {
        roleId: 216,
        name: 'PATIENT',
        description: 'Patient',
        isActive: 1,
      },
    ];

    const roles = [];
    for (const roleData of rolesData) {
      const existing = await prisma.role.findUnique({
        where: { roleId: roleData.roleId },
      });
      if (existing) {
        roles.push(
          await prisma.role.update({
            where: { roleId: roleData.roleId },
            data: roleData,
          })
        );
      } else {
        roles.push(await prisma.role.create({ data: roleData }));
      }
    }
    console.log(`   ✅ Created/Updated ${roles.length} roles\n`);

    // 2. Create Specialties
    console.log('2. Creating specialties...');
    let specialties = [];
    try {
      const specialtiesData = [
        { name: 'طب القلب', description: 'تخصص في أمراض القلب والشرايين' },
        { name: 'طب الأطفال', description: 'تخصص في علاج الأطفال وحديثي الولادة' },
        { name: 'الجراحة العامة', description: 'تخصص في الجراحة العامة' },
        { name: 'طب الأعصاب', description: 'تخصص في أمراض الجهاز العصبي' },
        { name: 'طب العيون', description: 'تخصص في أمراض العيون وجراحاتها' },
        { name: 'طب الجلدية', description: 'تخصص في الأمراض الجلدية' },
        { name: 'طب الأسنان', description: 'تخصص في جراحة الفم والأسنان' },
        { name: 'طب الروماتيزم', description: 'تخصص في أمراض المفاصل والروماتيزم' },
        { name: 'طب الطوارئ', description: 'تخصص في التعامل مع الحالات الطارئة' },
        { name: 'طب النساء والتوليد', description: 'تخصص في متابعة الحمل والولادة' },
      ];

      for (const specialtyData of specialtiesData) {
        const existing = await prisma.specialty.findUnique({
          where: { name: specialtyData.name },
        });
        if (existing) {
          specialties.push(existing);
        } else {
          specialties.push(await prisma.specialty.create({ data: specialtyData }));
        }
      }
      console.log(`   ✅ Created/Updated ${specialties.length} specialties\n`);
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log(`   ⚠️  Specialties table does not exist, skipping...\n`);
      } else {
        throw error;
      }
    }

    // 3. Create Doctors (sequentially to avoid ID conflicts)
    console.log('3. Creating doctors...');
    
    // Helper function to create or update doctor
    const createOrUpdateDoctor = async (doctorData: any) => {
      const existing = await prisma.doctor.findFirst({
        where: {
          OR: [
            { email: doctorData.email },
            { phone: doctorData.phone },
          ],
        },
      });
      
      if (existing) {
        return await prisma.doctor.update({
          where: { doctorId: existing.doctorId },
          data: doctorData,
        });
      } else {
        return await prisma.doctor.create({
          data: doctorData,
        });
      }
    };

    const doctorsData = [
      {
        name: 'د. أحمد مصطفى',
        email: 'ahmed.mostafa11@example.com',
        phone: '+201234567110',
        specialty: 'طب القلب',
        experience: 11,
        qualification: 'دكتوراه في طب القلب',
        image: 'https://example.com/images/doctor2.jpg',
        bio: 'خبير في أمراض القلب والشرايين.',
        consultationFee: 300,
        followUpFee: 200,
        isAvailable: 1,
      },
      {
        name: 'د. سارة علي',
        email: 'sara.ali1@example.com',
        phone: '+201981654321',
        specialty: 'طب الأطفال',
        experience: 8,
        qualification: 'ماجستير طب الأطفال',
        image: 'https://example.com/images/doctor2.jpg',
        bio: 'متخصصة في علاج الأطفال وحديثي الولادة.',
        consultationFee: 250,
        followUpFee: 150,
        isAvailable: 1,
      },
      {
        name: 'د. محمد حسن',
        email: 'mohamed.hassan1@example.com',
        phone: '+201112123344',
        specialty: 'الجراحة العامة',
        experience: 20,
        qualification: 'زمالة الجراحة العامة',
        image: 'https://example.com/images/doctor3.jpg',
        bio: 'جراح معتمد مع خبرة واسعة.',
        consultationFee: 350,
        followUpFee: 250,
        isAvailable: 1,
      },
      {
        name: 'د. ليلى أحمد',
        email: 'leila.ahmed1@example.com',
        phone: '+201122114455',
        specialty: 'طب الأعصاب',
        experience: 12,
        qualification: 'دكتوراه في الأعصاب',
        image: 'https://example.com/images/doctor4.jpg',
        bio: 'متخصصة في أمراض الجهاز العصبي.',
        consultationFee: 320,
        followUpFee: 220,
        isAvailable: 1,
      },
      {
        name: 'د. كريم سمير',
        email: 'karim.samir1@example.com',
        phone: '+201133145566',
        specialty: 'طب العيون',
        experience: 10,
        qualification: 'ماجستير طب العيون',
        image: 'https://example.com/images/doctor5.jpg',
        bio: 'خبرة في جراحات العيون الحديثة.',
        consultationFee: 280,
        followUpFee: 180,
        isAvailable: 1,
      },
      {
        name: 'د. هالة فؤاد',
        email: 'hala.foua1d1@example.com',
        phone: '+201144551577',
        specialty: 'طب الجلدية',
        experience: 7,
        qualification: 'بكالوريوس طب وجراحة',
        image: 'https://example.com/images/doctor6.jpg',
        bio: 'تعالج الأمراض الجلدية وحساسية الجلد.',
        consultationFee: 200,
        followUpFee: 120,
        isAvailable: 1,
      },
      {
        name: 'د. محمود نادر',
        email: 'mahmoud.nader1@example.com',
        phone: '+201155617788',
        specialty: 'طب الأسنان',
        experience: 14,
        qualification: 'دكتوراه في طب الأسنان',
        image: 'https://example.com/images/doctor7.jpg',
        bio: 'مختص في جراحة الفم والأسنان.',
        consultationFee: 250,
        followUpFee: 150,
        isAvailable: 1,
      },
      {
        name: 'د. منى حسن',
        email: 'mona.hassan1@example.com',
        phone: '+201161778899',
        specialty: 'طب الروماتيزم',
        experience: 9,
        qualification: 'ماجستير في الروماتيزم',
        image: 'https://example.com/images/doctor8.jpg',
        bio: 'تعالج الأمراض المزمنة والمفاصل.',
        consultationFee: 270,
        followUpFee: 170,
        isAvailable: 1,
      },
      {
        name: 'د. سامي علي',
        email: 'sami.ali1@example.com',
        phone: '+201177819900',
        specialty: 'طب الطوارئ',
        experience: 11,
        qualification: 'بكالوريوس طب الطوارئ',
        image: 'https://example.com/images/doctor9.jpg',
        bio: 'خبرة في التعامل مع الحالات الطارئة.',
        consultationFee: 300,
        followUpFee: 200,
        isAvailable: 1,
      },
      {
        name: 'د. ريم عبد الله',
        email: 'reem.abdullah1@example.com',
        phone: '+201181990011',
        specialty: 'طب النساء والتوليد',
        experience: 13,
        qualification: 'ماجستير في النساء والتوليد',
        image: 'https://example.com/images/doctor10.jpg',
        bio: 'تتابع الحمل والولادة.',
        consultationFee: 290,
        followUpFee: 190,
        isAvailable: 1,
      },
    ];

    const doctors = [];
    for (const doctorData of doctorsData) {
      doctors.push(await createOrUpdateDoctor(doctorData));
    }
    console.log(`   ✅ Created/Updated ${doctors.length} doctors\n`);

    // 4. Create Patients (sequentially)
    console.log('4. Creating patients...');
    
    // Helper function to create or update patient
    const createOrUpdatePatient = async (patientData: any) => {
      const existing = await prisma.patient.findFirst({
        where: {
          OR: [
            { email: patientData.email },
            { phone: patientData.phone },
          ],
        },
      });
      
      if (existing) {
        return await prisma.patient.update({
          where: { patientId: existing.patientId },
          data: patientData,
        });
      } else {
        return await prisma.patient.create({
          data: patientData,
        });
      }
    };

    const patientsData = [
      {
          name: 'أحمد إبراهيم',
          email: 'ahmed.ibrahim1@example.com',
          phone: '+201901112223',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'ذكر',
          address: 'شارع النيل، القاهرة',
          occupation: 'مهندس',
          emergencyContactName: 'منى إبراهيم',
          emergencyContactNumber: '+201011223344',
          primaryPhysician: doctors[0].doctorId, // د. أحمد مصطفى
          insuranceProvider: 'شركة التأمين المتحدة',
          insurancePolicyNumber: 'INS123456789',
          allergies: 'لا يوجد',
          currentMedication: 'لا يوجد',
          familyMedicalHistory: 'ضغط دم',
          pastMedicalHistory: 'التهاب مزمن في الجهاز التنفسي',
          identificationType: 'بطاقة شخصية',
          identificationNumber: '12345678901234',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'منى سامي',
          email: 'mona.sami1@example.com',
          phone: '+201022314455',
          dateOfBirth: new Date('1990-11-20'),
          gender: 'أنثى',
          address: 'شارع التحرير، الإسكندرية',
          occupation: 'مدرسة',
          emergencyContactName: 'أحمد سامي',
          emergencyContactNumber: '+201033445566',
          primaryPhysician: doctors[0].doctorId,
          insuranceProvider: 'شركة الحياة للتأمين',
          insurancePolicyNumber: 'INS987654321',
          allergies: 'حساسية من البنسلين',
          currentMedication: 'مضاد حيوي',
          familyMedicalHistory: 'سكري',
          pastMedicalHistory: 'التهاب مزمن في المفاصل',
          identificationType: 'جواز سفر',
          identificationNumber: 'A1234567',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'محمد علي',
          email: 'mohamed.ali1@example.com',
          phone: '+201041556677',
          dateOfBirth: new Date('1978-03-05'),
          gender: 'ذكر',
          address: 'شارع الهرم، الجيزة',
          occupation: 'محاسب',
          emergencyContactName: 'سعاد علي',
          emergencyContactNumber: '+201055667788',
          primaryPhysician: doctors[1].doctorId, // د. سارة علي
          insuranceProvider: 'شركة الشروق للتأمين',
          insurancePolicyNumber: 'INS112233445',
          allergies: 'لا يوجد',
          currentMedication: 'دواء ضغط',
          familyMedicalHistory: 'سرطان في العائلة',
          pastMedicalHistory: 'تاريخ جراحة',
          identificationType: 'بطاقة شخصية',
          identificationNumber: '98765432109876',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'ندى مصطفى',
          email: 'nada.mostafa1@example.com',
          phone: '+201016778899',
          dateOfBirth: new Date('1988-08-25'),
          gender: 'أنثى',
          address: 'شارع الثورة، بورسعيد',
          occupation: 'محامية',
          emergencyContactName: 'علي مصطفى',
          emergencyContactNumber: '+201077889900',
          primaryPhysician: doctors[1].doctorId,
          insuranceProvider: 'شركة الأمان للتأمين',
          insurancePolicyNumber: 'INS445566778',
          allergies: 'حساسية الغلوتين',
          currentMedication: 'مضاد التهاب',
          familyMedicalHistory: 'ضغط دم',
          pastMedicalHistory: 'تاريخ ولادة مبكر',
          identificationType: 'بطاقة شخصية',
          identificationNumber: '56789012345678',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'خالد يوسف',
          email: 'khaled.yousef1@example.com',
          phone: '+201018990011',
          dateOfBirth: new Date('1975-12-12'),
          gender: 'ذكر',
          address: 'شارع الملك فيصل، طنطا',
          occupation: 'مهندس',
          emergencyContactName: 'سلمى يوسف',
          emergencyContactNumber: '+201099001122',
          primaryPhysician: doctors[1].doctorId,
          insuranceProvider: 'شركة الأمل للتأمين',
          insurancePolicyNumber: 'INS223344556',
          allergies: 'لا يوجد',
          currentMedication: 'مهدئ',
          familyMedicalHistory: 'سكري',
          pastMedicalHistory: 'كسر في العظم',
          identificationType: 'جواز سفر',
          identificationNumber: 'B2345678',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'سارة أحمد',
          email: 'sara.ahmed1@example.com',
          phone: '+201011213344',
          dateOfBirth: new Date('1992-04-18'),
          gender: 'أنثى',
          address: 'شارع الأزهر، أسيوط',
          occupation: 'معلمة',
          emergencyContactName: 'طارق أحمد',
          emergencyContactNumber: '+201022334455',
          primaryPhysician: doctors[2].doctorId, // د. محمد حسن
          insuranceProvider: 'شركة الشفاء للتأمين',
          insurancePolicyNumber: 'INS334455667',
          allergies: 'حساسية دوائية',
          currentMedication: 'فيتامينات',
          familyMedicalHistory: 'ضغط دم',
          pastMedicalHistory: 'التهاب مزمن في الكبد',
          identificationType: 'بطاقة شخصية',
          identificationNumber: '67890123456789',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'ياسين محمود',
          email: 'yassin.mahmoud1@example.com',
          phone: '+201013445566',
          dateOfBirth: new Date('1980-01-30'),
          gender: 'ذكر',
          address: 'شارع الجامعة، المنصورة',
          occupation: 'محاسب',
          emergencyContactName: 'هدى محمود',
          emergencyContactNumber: '+201044556677',
          primaryPhysician: doctors[2].doctorId,
          insuranceProvider: 'شركة الأمانة للتأمين',
          insurancePolicyNumber: 'INS556677889',
          allergies: 'لا يوجد',
          currentMedication: 'مضاد حيوي',
          familyMedicalHistory: 'سرطان',
          pastMedicalHistory: 'التهاب في الكلى',
          identificationType: 'جواز سفر',
          identificationNumber: 'C3456789',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'ريم عبد الرحمن',
          email: 'reem.abdulrahman1@example.com',
          phone: '+201015667788',
          dateOfBirth: new Date('1983-07-07'),
          gender: 'أنثى',
          address: 'شارع الحرية، الأقصر',
          occupation: 'طبيبة',
          emergencyContactName: 'محمد عبد الرحمن',
          emergencyContactNumber: '+201066778899',
          primaryPhysician: doctors[3].doctorId, // د. ليلى أحمد
          insuranceProvider: 'شركة الحياة الجديدة',
          insurancePolicyNumber: 'INS667788990',
          allergies: 'حساسية الطعام',
          currentMedication: 'مضاد حيوي',
          familyMedicalHistory: 'ضغط دم',
          pastMedicalHistory: 'التهاب مزمن في الرئة',
          identificationType: 'بطاقة شخصية',
          identificationNumber: '78901234567890',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'طارق حسني',
          email: 'tarek.hosny2@example.com',
          phone: '+201072889900',
          dateOfBirth: new Date('1979-09-15'),
          gender: 'ذكر',
          address: 'شارع البحر، الإسكندرية',
          occupation: 'مدير',
          emergencyContactName: 'هالة حسني',
          emergencyContactNumber: '+201088990011',
          primaryPhysician: doctors[3].doctorId,
          insuranceProvider: 'شركة الأمل الجديدة',
          insurancePolicyNumber: 'INS778899001',
          allergies: 'لا يوجد',
          currentMedication: 'مهدئ',
          familyMedicalHistory: 'سكري',
          pastMedicalHistory: 'تاريخ جراحة',
          identificationType: 'جواز سفر',
          identificationNumber: 'D4567890',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
      {
          name: 'هالة جمال',
          email: 'hala.gamal2@example.com',
          phone: '+201099021122',
          dateOfBirth: new Date('1995-05-23'),
          gender: 'أنثى',
          address: 'شارع النصر، بني سويف',
          occupation: 'مهندسة',
          emergencyContactName: 'سعيد جمال',
          emergencyContactNumber: '+201011223344',
          primaryPhysician: doctors[4].doctorId, // د. كريم سمير
          insuranceProvider: 'شركة الأمان للتأمين',
          insurancePolicyNumber: 'INS889900112',
          allergies: 'حساسية اللاتكس',
          currentMedication: 'مضاد التهاب',
          familyMedicalHistory: 'ضغط دم',
          pastMedicalHistory: 'التهاب مزمن في الأذن',
          identificationType: 'بطاقة شخصية',
          identificationNumber: '89012345678901',
          privacyConsent: 1,
          treatmentConsent: 1,
          disclosureConsent: 1,
        },
    ];

    const patients = [];
    for (const patientData of patientsData) {
      patients.push(await createOrUpdatePatient(patientData));
    }
    console.log(`   ✅ Created/Updated ${patients.length} patients\n`);

    // 5. Create Users
    console.log('5. Creating users...');
    const users = [
      await prisma.user.upsert({
        where: { email: 'superadmin@hospital.com' },
        update: {},
        create: {
          username: 'superadmin',
          email: 'superadmin@hospital.com',
          password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
          roleId: 211,
          fullName: 'محمد أحمد',
          phone: '01000000001',
          isAdmin: 1,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'tah@gmail.com' },
        update: {},
        create: {
          username: 'tah',
          email: 'tah@gmail.com',
          password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
          roleId: 211,
          fullName: 'طه محمود',
          phone: '01000000002',
          isAdmin: 1,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'admin@hospital.com' },
        update: {},
        create: {
          username: 'admin',
          email: 'admin@hospital.com',
          password: '$2b$10$hashedpassword2',
          roleId: 212,
          fullName: 'أحمد محمد',
          phone: '01100000001',
          isAdmin: 0,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'sara.ali@example.com' },
        update: {},
        create: {
          username: 'sara.ali',
          email: 'sara.ali@example.com',
          password: '$2b$10$hashedpassword4',
          roleId: 213,
          fullName: 'د. سارة علي',
          phone: '01200000001',
          isAdmin: 0,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'nurse1@hospital.com' },
        update: {},
        create: {
          username: 'nurse1',
          email: 'nurse1@hospital.com',
          password: '$2b$10$hashedpassword5',
          roleId: 214,
          fullName: 'فاطمة أحمد',
          phone: '01300000001',
          isAdmin: 0,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'reception@hospital.com' },
        update: {},
        create: {
          username: 'reception1',
          email: 'reception@hospital.com',
          password: '$2b$10$hashedpassword6',
          roleId: 215,
          fullName: 'أحمد إبراهيم',
          phone: '01400000001',
          isAdmin: 0,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'tag@gmail.com' },
        update: {},
        create: {
          username: 'tag',
          email: 'tag@gmail.com',
          password: '$2b$10$U0Pn9va0UGCz1f.ELBu1i.J4wpMvQL89Iq2GLbsIQsvGs2/YKAE.i',
          roleId: 215,
          fullName: 'تاج الدين',
          phone: '01400000002',
          isAdmin: 0,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'taha@gmail.com' },
        update: {},
        create: {
          username: 'taha',
          email: 'taha@gmail.com',
          password: '$2b$10$R424EWT39jqoRGGZnuRxnOzV.uaIgHkznZ.OeBrkXC5cHQ0RoErwq',
          roleId: 216,
          fullName: 'طه محمد',
          phone: '01500000001',
          isAdmin: 0,
          isActive: 1,
        },
      }),
      await prisma.user.upsert({
        where: { email: 'tah0@gmail.com' },
        update: {},
        create: {
          username: 'tah0',
          email: 'tah0@gmail.com',
          password: '$2b$10$BZhUtKQCVkUXQ/gmAGJMr.1xDGk58Gp.gHzU5i5J5M4afFLJlxPr.',
          roleId: 216,
          fullName: 'طه علي',
          phone: '01500000002',
          isAdmin: 0,
          isActive: 1,
        },
      }),
    ];
    console.log(`   ✅ Created ${users.length} users\n`);

    // 6. Create Role Permissions
    console.log('6. Creating role permissions...');
    
    // Helper function to create role permission
    const createRolePermission = async (
      roleId: number,
      subject: string,
      action: string,
      fieldName: string | null = null,
      canAccess: number = 1
    ) => {
      // For unique constraint, we need to handle null fieldName differently
      if (fieldName === null) {
        // Check if exists first
        const existing = await prisma.rolePermission.findFirst({
          where: {
            roleId,
            subject,
            action,
            fieldName: null,
          },
        });
        if (existing) {
          return existing;
        }
        return await prisma.rolePermission.create({
          data: {
            roleId,
            subject,
            action,
            fieldName: null,
            canAccess,
          },
        });
      } else {
        // Check if exists first for field-based permissions
        const existing = await prisma.rolePermission.findFirst({
          where: {
            roleId,
            subject,
            action,
            fieldName,
          },
        });
        if (existing) {
          return existing;
        }
        return await prisma.rolePermission.create({
          data: {
            roleId,
            subject,
            action,
            fieldName,
            canAccess,
          },
        });
      }
    };

    const rolePermissions = [
      // SUPER_ADMIN
      await createRolePermission(211, 'ALL', 'MANAGE'),
      
      // ADMIN (212)
      await createRolePermission(212, 'PATIENTS', 'CREATE'),
      await createRolePermission(212, 'PATIENTS', 'READ'),
      await createRolePermission(212, 'PATIENTS', 'UPDATE'),
      await createRolePermission(212, 'PATIENTS', 'DELETE'),
      await createRolePermission(212, 'DOCTORS', 'CREATE'),
      await createRolePermission(212, 'DOCTORS', 'READ'),
      await createRolePermission(212, 'DOCTORS', 'UPDATE'),
      await createRolePermission(212, 'DOCTORS', 'DELETE'),
      await createRolePermission(212, 'APPOINTMENTS', 'CREATE'),
      await createRolePermission(212, 'APPOINTMENTS', 'READ'),
      await createRolePermission(212, 'APPOINTMENTS', 'UPDATE'),
      await createRolePermission(212, 'APPOINTMENTS', 'DELETE'),
      await createRolePermission(212, 'DASHBOARD', 'READ'),
      await createRolePermission(212, 'MEDICALRECORDS', 'CREATE'),
      await createRolePermission(212, 'MEDICALRECORDS', 'READ'),
      await createRolePermission(212, 'MEDICALRECORDS', 'UPDATE'),
      await createRolePermission(212, 'MEDICALRECORDS', 'DELETE'),
      await createRolePermission(212, 'INVOICES', 'CREATE'),
      await createRolePermission(212, 'INVOICES', 'READ'),
      await createRolePermission(212, 'INVOICES', 'UPDATE'),
      await createRolePermission(212, 'INVOICES', 'DELETE'),
      
      // DOCTOR (213)
      await createRolePermission(213, 'PATIENTS', 'READ'),
      await createRolePermission(213, 'PATIENTS', 'UPDATE'),
      await createRolePermission(213, 'DOCTORS', 'READ'),
      await createRolePermission(213, 'APPOINTMENTS', 'READ'),
      await createRolePermission(213, 'APPOINTMENTS', 'UPDATE'),
      await createRolePermission(213, 'APPOINTMENTS', 'CREATE'),
      await createRolePermission(213, 'APPOINTMENTS', 'DELETE'),
      await createRolePermission(213, 'MEDICALRECORDS', 'CREATE'),
      await createRolePermission(213, 'MEDICALRECORDS', 'READ'),
      await createRolePermission(213, 'MEDICALRECORDS', 'UPDATE'),
      await createRolePermission(213, 'AVAILABILITY', 'MANAGE'),
      await createRolePermission(213, 'SCHEDULE', 'READ'),
      await createRolePermission(213, 'SCHEDULE', 'UPDATE'),
      await createRolePermission(213, 'APPOINTMENT_SLOTS', 'READ'),
      await createRolePermission(213, 'APPOINTMENT_SLOTS', 'UPDATE'),
      await createRolePermission(213, 'INVOICES', 'READ'),
      await createRolePermission(213, 'INVOICES', 'CREATE'),
      await createRolePermission(213, 'INVOICES', 'UPDATE'),
      
      // NURSE (214)
      await createRolePermission(214, 'PATIENTS', 'READ'),
      await createRolePermission(214, 'DOCTORS', 'READ'),
      await createRolePermission(214, 'APPOINTMENTS', 'READ'),
      await createRolePermission(214, 'AVAILABILITY', 'MANAGE'),
      await createRolePermission(214, 'SCHEDULE', 'READ'),
      await createRolePermission(214, 'SCHEDULE', 'UPDATE'),
      await createRolePermission(214, 'APPOINTMENT_SLOTS', 'READ'),
      await createRolePermission(214, 'APPOINTMENT_SLOTS', 'UPDATE'),
      await createRolePermission(214, 'INVOICES', 'READ'),
      
      // RECEPTIONIST (215)
      await createRolePermission(215, 'PATIENTS', 'CREATE'),
      await createRolePermission(215, 'PATIENTS', 'READ'),
      await createRolePermission(215, 'PATIENTS', 'UPDATE'),
      await createRolePermission(215, 'DOCTORS', 'READ'),
      await createRolePermission(215, 'APPOINTMENTS', 'CREATE'),
      await createRolePermission(215, 'APPOINTMENTS', 'READ'),
      await createRolePermission(215, 'APPOINTMENTS', 'UPDATE'),
      await createRolePermission(215, 'APPOINTMENTS', 'DELETE'),
      await createRolePermission(215, 'INVOICES', 'CREATE'),
      await createRolePermission(215, 'INVOICES', 'READ'),
      await createRolePermission(215, 'INVOICES', 'UPDATE'),
      await createRolePermission(215, 'INVOICES', 'DELETE'),
      
      // PATIENT (216) - General permissions
      await createRolePermission(216, 'PATIENTS', 'READ'),
      await createRolePermission(216, 'PATIENTS', 'UPDATE'),
      await createRolePermission(216, 'APPOINTMENTS', 'READ'),
      await createRolePermission(216, 'APPOINTMENTS', 'CREATE'),
      await createRolePermission(216, 'APPOINTMENTS', 'CANCEL'),
      await createRolePermission(216, 'AVAILABLE_SLOTS', 'READ'),
      await createRolePermission(216, 'DOCTOR_SCHEDULE', 'READ'),
      await createRolePermission(216, 'MEDICALRECORDS', 'READ'),
      await createRolePermission(216, 'INVOICES', 'READ'),
      
      // PATIENT (216) - DOCTORS Field permissions
      await createRolePermission(216, 'DOCTORS', 'READ', 'FULL_NAME', 1),
      await createRolePermission(216, 'DOCTORS', 'READ', 'SPECIALTY', 1),
      await createRolePermission(216, 'DOCTORS', 'READ', 'PHONE', 1),
      await createRolePermission(216, 'DOCTORS', 'READ', 'EMAIL', 0),
      await createRolePermission(216, 'DOCTORS', 'READ', 'SALARY', 0),
      
      // PATIENT (216) - INVOICES Field permissions
      await createRolePermission(216, 'INVOICES', 'READ', 'patient_id', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'invoice_number', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'invoice_date', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'amount', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'total_amount', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'paid_amount', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'payment_status', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'notes', 1),
      await createRolePermission(216, 'INVOICES', 'READ', 'created_by', 0),
      await createRolePermission(216, 'INVOICES', 'READ', 'created_at', 0),
    ];
    console.log(`   ✅ Created ${rolePermissions.length} role permissions\n`);

    // 7. Create Appointments
    console.log('7. Creating appointments...');
    const appointments = [
      await prisma.appointment.create({
        data: {
          patientId: patients[0].patientId,
          doctorId: doctors[2].doctorId, // د. محمد حسن
          schedule: new Date('2025-10-01T10:30:00'),
          reason: 'فحص دوري للقلب',
          note: 'يرجى إحضار التحاليل السابقة',
          status: 'scheduled',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[1].patientId,
          doctorId: doctors[0].doctorId, // د. أحمد مصطفى
          schedule: new Date('2025-10-03T14:00:00'),
          reason: 'شكوى من حرارة وألم',
          note: 'المريض يعاني من ارتفاع في الحرارة',
          status: 'pending',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[0].patientId,
          doctorId: doctors[2].doctorId,
          schedule: new Date('2025-10-05T09:00:00'),
          reason: 'متابعة بعد العملية الجراحية',
          status: 'cancelled',
          cancellationReason: 'تأجيل بسبب ظروف المريض',
          appointmentType: 'follow_up',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[4].patientId,
          doctorId: doctors[4].doctorId, // د. كريم سمير
          schedule: new Date('2025-10-07T11:00:00'),
          reason: 'صداع مستمر',
          note: 'أخذ الأدوية بانتظام',
          status: 'scheduled',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[5].patientId,
          doctorId: doctors[3].doctorId, // د. ليلى أحمد
          schedule: new Date('2025-10-10T13:00:00'),
          reason: 'فحص العيون السنوي',
          status: 'pending',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[6].patientId,
          doctorId: doctors[5].doctorId, // د. هالة فؤاد
          schedule: new Date('2025-10-12T15:30:00'),
          reason: 'حكة جلدية مزمنة',
          note: 'استخدام مرهم خاص',
          status: 'scheduled',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[7].patientId,
          doctorId: doctors[6].doctorId, // د. محمود نادر
          schedule: new Date('2025-10-15T09:30:00'),
          reason: 'وجع أسنان حاد',
          note: 'الحجز للجراحة',
          status: 'pending',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[8].patientId,
          doctorId: doctors[7].doctorId, // د. منى حسن
          schedule: new Date('2025-10-17T10:00:00'),
          reason: 'التهاب المفاصل',
          note: 'العلاج الطبيعي مستمر',
          status: 'scheduled',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[9].patientId,
          doctorId: doctors[8].doctorId, // د. سامي علي
          schedule: new Date('2025-10-20T14:00:00'),
          reason: 'حالات طارئة',
          note: 'الإسعافات الأولية تم تقديمها',
          status: 'cancelled',
          cancellationReason: 'تأجيل بناءً على توصية الطبيب',
          appointmentType: 'emergency',
          paymentStatus: 'unpaid',
        },
      }),
      await prisma.appointment.create({
        data: {
          patientId: patients[9].patientId,
          doctorId: doctors[9].doctorId, // د. ريم عبد الله
          schedule: new Date('2025-10-22T11:15:00'),
          reason: 'فحص نسائي دوري',
          status: 'scheduled',
          appointmentType: 'consultation',
          paymentStatus: 'unpaid',
        },
      }),
    ];
    console.log(`   ✅ Created ${appointments.length} appointments\n`);

    // 8. Create Doctor Schedules
    console.log('8. Creating doctor schedules...');
    const schedules = [];
    // Doctor 1 (د. أحمد مصطفى) - Sunday to Thursday, 09:00-17:00
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await prisma.doctorSchedule.create({
          data: {
            doctorId: doctors[0].doctorId,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            isAvailable: 1,
          },
        })
      );
    }
    // Doctor 2 (د. سارة علي) - Sunday to Thursday, 08:00-16:00
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await prisma.doctorSchedule.create({
          data: {
            doctorId: doctors[1].doctorId,
            dayOfWeek: day,
            startTime: '08:00',
            endTime: '16:00',
            slotDuration: 30,
            isAvailable: 1,
          },
        })
      );
    }
    // Doctor 3 (د. محمد حسن) - Sunday to Thursday, 10:00-18:00
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await prisma.doctorSchedule.create({
          data: {
            doctorId: doctors[2].doctorId,
            dayOfWeek: day,
            startTime: '10:00',
            endTime: '18:00',
            slotDuration: 45,
            isAvailable: 1,
          },
        })
      );
    }
    console.log(`   ✅ Created ${schedules.length} doctor schedules\n`);

    // 9. Create Medical Records
    console.log('9. Creating medical records...');
    const medicalRecords = [
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[0].patientId,
          doctorId: doctors[0].doctorId,
          diagnosis: 'ارتفاع ضغط الدم',
          symptoms: '["صداع", "دوخة", "ضيق في التنفس", "ألم في الصدر"]',
          medications: '["أملوديبين 5مج", "ليسينوبريل 10مج", "أسبرين 81مج"]',
          treatmentPlan: 'تغيير نمط الحياة، تقليل الملح، ممارسة الرياضة المنتظمة',
          notes: 'المريض يحتاج متابعة دورية كل 3 أشهر',
          bloodPressure: '140/90',
          temperature: 37.2,
          images: '["chest_xray_001.jpg", "ecg_001.pdf"]',
          height: 175.5,
          weight: 82.3,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[5].patientId,
          doctorId: doctors[4].doctorId,
          diagnosis: 'التهاب اللوزتين الحاد',
          symptoms: '["ألم في الحلق", "حمى", "صعوبة في البلع", "تضخم الغدد الليمفاوية"]',
          medications: '["أموكسيسيلين 500مج", "باراسيتامول 500مج", "مضمضة بالماء المالح"]',
          treatmentPlan: 'راحة في السرير، السوائل الدافئة، مضادات حيوية لمدة 7 أيام',
          notes: 'تحسن ملحوظ بعد 3 أيام من العلاج',
          bloodPressure: '110/70',
          temperature: 38.5,
          images: '["throat_examination.jpg"]',
          height: 162.0,
          weight: 58.7,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[4].patientId,
          doctorId: doctors[2].doctorId,
          diagnosis: 'التهاب الزائدة الدودية',
          symptoms: '["ألم في الجانب الأيمن", "غثيان", "قيء", "حمى خفيفة"]',
          medications: '["مضاد حيوي وريدي", "مسكن ألم", "سوائل وريدية"]',
          treatmentPlan: 'استئصال الزائدة الدودية بالمنظار، متابعة ما بعد الجراحة',
          notes: 'الجراحة تمت بنجاح، الشفاء يسير بشكل طبيعي',
          bloodPressure: '125/80',
          temperature: 37.8,
          images: '["ct_scan_abdomen.jpg", "post_surgery.jpg"]',
          height: 178.2,
          weight: 89.1,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[8].patientId,
          doctorId: doctors[3].doctorId,
          diagnosis: 'الصداع النصفي المزمن',
          symptoms: '["صداع شديد", "غثيان", "حساسية للضوء", "اضطراب في الرؤية"]',
          medications: '["سوماتريبتان 50مج", "بروبرانولول 40مج", "مكملات المغنيسيوم"]',
          treatmentPlan: 'تجنب المحفزات، تنظيم النوم، تقنيات الاسترخاء',
          notes: 'تحسن ملحوظ في تكرار النوبات',
          bloodPressure: '118/75',
          temperature: 36.9,
          images: '["brain_mri.jpg", "neurological_exam.pdf"]',
          height: 165.8,
          weight: 64.2,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[5].patientId,
          doctorId: doctors[4].doctorId,
          diagnosis: 'إعتام عدسة العين',
          symptoms: '["تشويش في الرؤية", "حساسية للضوء", "صعوبة الرؤية الليلية", "رؤية هالات حول الأضواء"]',
          medications: '["قطرات عين مرطبة", "نظارات طبية مؤقتة"]',
          treatmentPlan: 'جراحة إزالة المياه البيضاء وزرع عدسة اصطناعية',
          notes: 'الجراحة مجدولة الأسبوع القادم',
          bloodPressure: '130/85',
          temperature: 36.7,
          images: '["eye_examination.jpg", "lens_opacity_scan.jpg"]',
          height: 172.1,
          weight: 76.8,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[6].patientId,
          doctorId: doctors[5].doctorId,
          diagnosis: 'الأكزيما التأتبية',
          symptoms: '["طفح جلدي", "حكة شديدة", "جفاف الجلد", "التهاب"]',
          medications: '["كورتيكوستيرويد موضعي", "مرطب جلدي", "مضاد هيستامين"]',
          treatmentPlan: 'ترطيب مستمر، تجنب المهيجات، استخدام الكريمات الطبية',
          notes: 'تحسن تدريجي مع الالتزام بالعلاج',
          bloodPressure: '122/78',
          temperature: 37.1,
          images: '["skin_condition.jpg", "treatment_progress.jpg"]',
          height: 158.5,
          weight: 52.3,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[7].patientId,
          doctorId: doctors[6].doctorId,
          diagnosis: 'تسوس متقدم في الضرس العلوي',
          symptoms: '["ألم شديد في الأسنان", "تورم في اللثة", "حساسية للبرد والحر", "رائحة فم كريهة"]',
          medications: '["مضاد حيوي - أموكسيسيلين", "مسكن ألم - إيبوبروفين", "غسول فم مضاد للبكتيريا"]',
          treatmentPlan: 'حشو العصب، تركيب تاج، تنظيف الأسنان العميق',
          notes: 'تم حشو العصب بنجاح، المريض بحاجة لمتابعة',
          bloodPressure: '125/82',
          temperature: 37.4,
          images: '["dental_xray.jpg", "tooth_condition.jpg"]',
          height: 180.3,
          weight: 94.7,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[8].patientId,
          doctorId: doctors[7].doctorId,
          diagnosis: 'التهاب المفاصل الروماتويدي',
          symptoms: '["ألم المفاصل", "تيبس صباحي", "تورم في المفاصل", "إرهاق عام"]',
          medications: '["ميثوتريكسات 15مج", "فولات 5مج", "بريدنيزولون 5مج", "أوميبرازول 20مج"]',
          treatmentPlan: 'علاج دوائي مستمر، علاج طبيعي، تمارين خفيفة',
          notes: 'الاستجابة جيدة للعلاج، تحسن في الأعراض',
          bloodPressure: '135/88',
          temperature: 37.0,
          images: '["joint_xray.jpg", "blood_test_results.pdf"]',
          height: 167.9,
          weight: 71.5,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[9].patientId,
          doctorId: doctors[8].doctorId,
          diagnosis: 'كسر في عظم الساعد',
          symptoms: '["ألم شديد في الذراع", "تورم", "عدم القدرة على الحركة", "تشوه ظاهري"]',
          medications: '["مسكن ألم قوي", "مضاد التهاب", "مضاد تجلط"]',
          treatmentPlan: 'تجبيس الذراع، متابعة في العيادة الخارجية، علاج طبيعي',
          notes: 'كسر بسيط، الشفاء متوقع خلال 6-8 أسابيع',
          bloodPressure: '140/90',
          temperature: 37.6,
          images: '["arm_xray.jpg", "cast_application.jpg"]',
          height: 174.2,
          weight: 68.9,
        },
      }),
      await prisma.medicalRecord.create({
        data: {
          patientId: patients[9].patientId,
          doctorId: doctors[9].doctorId,
          diagnosis: 'متابعة الحمل - الثلث الثاني',
          symptoms: '["غثيان صباحي خفيف", "إرهاق", "آلام الظهر", "تغيرات في الثدي"]',
          medications: '["حمض الفوليك", "فيتامينات الحمل", "مكملات الحديد"]',
          treatmentPlan: 'متابعة دورية، فحوصات منتظمة، تغذية صحية',
          notes: 'الحمل يسير بشكل طبيعي، الجنين في وضع جيد',
          bloodPressure: '118/75',
          temperature: 36.8,
          images: '["ultrasound_20weeks.jpg", "pregnancy_progress.pdf"]',
          height: 163.4,
          weight: 67.2,
        },
      }),
    ];
    console.log(`   ✅ Created ${medicalRecords.length} medical records\n`);

    // 10. Create Invoices
    console.log('10. Creating invoices...');
    const baseTimestamp = Date.now();
    const invoices = [
      await prisma.invoice.create({
        data: {
          patientId: patients[0].patientId, // أحمد إبراهيم
          appointmentId: appointments[0].appointmentId,
          invoiceNumber: `INV-${baseTimestamp}-001`,
          amount: 500,
          discount: 50,
          totalAmount: 450,
          paidAmount: 450,
          paymentStatus: 'paid',
          paymentMethod: 'Cash',
          paymentDate: new Date(),
          notes: 'دفع كامل',
          createdBy: users[1].userId, // tah@gmail.com
        },
      }),
      await prisma.invoice.create({
        data: {
          patientId: patients[1].patientId, // منى سامي
          appointmentId: appointments[1].appointmentId,
          invoiceNumber: `INV-${baseTimestamp + 1}-002`,
          amount: 1000,
          discount: 100,
          totalAmount: 900,
          paidAmount: 500,
          paymentStatus: 'partial',
          paymentMethod: 'Credit Card',
          paymentDate: new Date(),
          notes: 'دفع جزئي',
          createdBy: users[1].userId,
        },
      }),
      await prisma.invoice.create({
        data: {
          patientId: patients[2].patientId, // محمد علي
          appointmentId: appointments[2].appointmentId,
          invoiceNumber: `INV-${baseTimestamp + 2}-003`,
          amount: 750,
          discount: 0,
          totalAmount: 750,
          paidAmount: 0,
          paymentStatus: 'unpaid',
          paymentMethod: null,
          paymentDate: null,
          notes: 'لم يتم الدفع بعد',
          createdBy: users[2].userId, // admin@hospital.com
        },
      }),
      await prisma.invoice.create({
        data: {
          patientId: patients[3].patientId, // ندى مصطفى
          appointmentId: appointments[3].appointmentId,
          invoiceNumber: `INV-${baseTimestamp + 3}-004`,
          amount: 600,
          discount: 60,
          totalAmount: 540,
          paidAmount: 540,
          paymentStatus: 'paid',
          paymentMethod: 'Bank Transfer',
          paymentDate: new Date(),
          notes: 'دفع كامل',
          createdBy: users[1].userId,
        },
      }),
    ];
    console.log(`   ✅ Created ${invoices.length} invoices\n`);

    console.log('✅ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Roles: ${roles.length}`);
    if (specialties.length > 0) {
      console.log(`   - Specialties: ${specialties.length}`);
    }
    console.log(`   - Doctors: ${doctors.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Role Permissions: ${rolePermissions.length}`);
    console.log(`   - Appointments: ${appointments.length}`);
    console.log(`   - Doctor Schedules: ${schedules.length}`);
    console.log(`   - Medical Records: ${medicalRecords.length}`);
    console.log(`   - Invoices: ${invoices.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
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
