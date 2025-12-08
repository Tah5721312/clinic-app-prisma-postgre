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
        { name: 'الجراحة العامة', description: 'تخصص الجراحة العامة' },
        { name: 'طب الأسنان', description: 'تخصص طب الأسنان' },
        { name: 'طب الأطفال', description: 'تخصص طب الأطفال' },
        { name: 'طب الأعصاب', description: 'تخصص طب الأعصاب' },
        { name: 'طب الباطنة', description: 'تخصص طب الباطنة' },
        { name: 'طب الجلدية', description: 'تخصص طب الجلدية' },
        { name: 'طب الروماتيزم', description: 'تخصص طب الروماتيزم' },
        { name: 'طب الطوارئ', description: 'تخصص طب الطوارئ' },
        { name: 'طب العيون', description: 'تخصص طب العيون' },
        { name: 'طب القلب', description: 'تخصص طب القلب' },
        { name: 'طب النساء والتوليد', description: 'تخصص طب النساء والتوليد' },
      ];

      for (const specialtyData of specialtiesData) {
        try {
          const existing = await prisma.specialty.findUnique({
          where: { name: specialtyData.name },
          });
          if (existing) {
            specialties.push(existing);
          } else {
            specialties.push(await prisma.specialty.create({ data: specialtyData }));
          }
        } catch (error: any) {
          // If error occurs, try to find it again
          const found = await prisma.specialty.findUnique({
          where: { name: specialtyData.name },
          });
          if (found) {
            specialties.push(found);
          } else {
            console.error(`   ⚠️  Failed to create specialty: ${specialtyData.name} - ${error.message}`);
          }
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
        email: 'ahmed@gmail.com',
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
        email: 'sara@gmail.com',
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
        email: 'hassan@gmail.com',
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
        name: 'د. منى أحمد',
        email: 'mona@gmail.com',
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
    
    // Helper function to create or update user
    const createOrUpdateUser = async (userData: any) => {
      const existing = await prisma.user.findFirst({
        where: {
        OR: [
            { email: userData.email },
            { username: userData.username },
          ],
        },
      });
      
      if (existing) {
        return await prisma.user.update({
        where: { userId: existing.userId },
        data: userData,
        });
      } else {
        return await prisma.user.create({
        data: userData,
        });
      }
    };

    const usersData = [
      {
        username: 'superadmin',
        email: 'superadmin@hospital.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 211,
        fullName: 'محمد أحمد',
        phone: '01000000001',
        isAdmin: 1,
        isActive: 1,
      },
      {
        username: 'tah',
        email: 'tah@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 211,
        fullName: 'طه محمود',
        phone: '01000000002',
        isAdmin: 1,
        isActive: 1,
      },
      {
        username: 'admin',
        email: 'admin@hospital.com',
        password: '$2b$10$hashedpassword2',
        roleId: 212,
        fullName: 'أحمد محمد',
        phone: '01100000001',
        isAdmin: 0,
        isActive: 1,
      },
      {
        username: 'sara.ali',
        email: 'sara@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 213,
        fullName: 'د. سارة علي',
        phone: '01200000001',
        isAdmin: 0,
        isActive: 1,
      },
      {
        username: 'nurse1',
        email: 'nurse@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 214,
        fullName: 'فاطمة أحمد',
        phone: '01300000001',
        isAdmin: 0,
        isActive: 1,
      },
      {
        username: 'reception1',
        email: 'reception@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 215,
        fullName: 'أحمد إبراهيم',
        phone: '01400000001',
        isAdmin: 0,
        isActive: 1,
      },
      {
        username: 'tag',
        email: 'tag@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 215,
        fullName: 'تاج الدين',
        phone: '01400000002',
        isAdmin: 0,
        isActive: 1,
      },
      {
        username: 'taha',
        email: 'taha@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 216,
        fullName: 'طه محمد',
        phone: '01500000001',
        isAdmin: 0,
        isActive: 1,
      },
      {
        username: 'tah0',
        email: 'tah0@gmail.com',
        password: '$2b$10$RHiiqr3N2CYhRb1xQtlZNuqvFaZ/vrDWNxStJEXeg3QDC68K2flFa',
        roleId: 216,
        fullName: 'طه علي',
        phone: '01500000002',
        isAdmin: 0,
        isActive: 1,
      },
    ];

    const users = [];
    for (const userData of usersData) {
      users.push(await createOrUpdateUser(userData));
    }
    console.log(`   ✅ Created/Updated ${users.length} users\n`);

    // 6. Create Role Permissions
    console.log('6. Creating role permissions...');
    
    // Helper function to create role permission
    let createdCount = 0;
    let updatedCount = 0;
    
    const createRolePermission = async (
      roleId: number,
      subject: string,
      action: string,
      fieldName: string | null = null,
      canAccess: number = 1
    ) => {
      // Build where clause based on whether fieldName is null or not
      const whereClause: any = {
        roleId,
        subject,
        action,
      };
      
      if (fieldName === null) {
        whereClause.fieldName = null;
      } else {
        whereClause.fieldName = fieldName;
      }
      
      // Check if exists first
      const existing = await prisma.rolePermission.findFirst({
        where: whereClause,
      });
      
      if (existing) {
        updatedCount++;
        return existing;
      }
      
      // Create new permission
      createdCount++;
      return await prisma.rolePermission.create({
        data: {
          roleId,
          subject,
          action,
        fieldName: fieldName || null,
          canAccess,
        },
      });
    };

    const rolePermissions: any[] = [];
    let errorCount = 0;
    
    // Helper to safely create permission
    const safeCreatePermission = async (
      roleId: number,
      subject: string,
      action: string,
      fieldName: string | null = null,
      canAccess: number = 1
    ) => {
      try {
        const perm = await createRolePermission(roleId, subject, action, fieldName, canAccess);
        rolePermissions.push(perm);
        return perm;
      } catch (error: any) {
        errorCount++;
        console.error(`   ⚠️  Failed to create permission: ${roleId} ${subject} ${action} ${fieldName || ''} - ${error.message}`);
        return null;
      }
    };

    // SUPER_ADMIN
    await safeCreatePermission(211, 'ALL', 'MANAGE');
    
    // ADMIN (212)
    await safeCreatePermission(212, 'PATIENTS', 'CREATE');
    await safeCreatePermission(212, 'PATIENTS', 'READ');
    await safeCreatePermission(212, 'PATIENTS', 'UPDATE');
    await safeCreatePermission(212, 'PATIENTS', 'DELETE');
    await safeCreatePermission(212, 'DOCTORS', 'CREATE');
    await safeCreatePermission(212, 'DOCTORS', 'READ');
    await safeCreatePermission(212, 'DOCTORS', 'UPDATE');
    await safeCreatePermission(212, 'DOCTORS', 'DELETE');
    await safeCreatePermission(212, 'APPOINTMENTS', 'CREATE');
    await safeCreatePermission(212, 'APPOINTMENTS', 'READ');
    await safeCreatePermission(212, 'APPOINTMENTS', 'UPDATE');
    await safeCreatePermission(212, 'APPOINTMENTS', 'DELETE');
    await safeCreatePermission(212, 'DASHBOARD', 'READ');
    await safeCreatePermission(212, 'MEDICALRECORDS', 'CREATE');
    await safeCreatePermission(212, 'MEDICALRECORDS', 'READ');
    await safeCreatePermission(212, 'MEDICALRECORDS', 'UPDATE');
    await safeCreatePermission(212, 'MEDICALRECORDS', 'DELETE');
    await safeCreatePermission(212, 'INVOICES', 'CREATE');
    await safeCreatePermission(212, 'INVOICES', 'READ');
    await safeCreatePermission(212, 'INVOICES', 'UPDATE');
    await safeCreatePermission(212, 'INVOICES', 'DELETE');
    
    // DOCTOR (213)
    await safeCreatePermission(213, 'PATIENTS', 'READ');
    await safeCreatePermission(213, 'PATIENTS', 'UPDATE');
    await safeCreatePermission(213, 'DOCTORS', 'READ');
    await safeCreatePermission(213, 'APPOINTMENTS', 'READ');
    await safeCreatePermission(213, 'APPOINTMENTS', 'UPDATE');
    await safeCreatePermission(213, 'APPOINTMENTS', 'CREATE');
    await safeCreatePermission(213, 'APPOINTMENTS', 'DELETE');
    await safeCreatePermission(213, 'MEDICALRECORDS', 'CREATE');
    await safeCreatePermission(213, 'MEDICALRECORDS', 'READ');
    await safeCreatePermission(213, 'MEDICALRECORDS', 'UPDATE');
    await safeCreatePermission(213, 'AVAILABILITY', 'MANAGE');
    await safeCreatePermission(213, 'SCHEDULE', 'READ');
    await safeCreatePermission(213, 'SCHEDULE', 'UPDATE');
    await safeCreatePermission(213, 'APPOINTMENT_SLOTS', 'READ');
    await safeCreatePermission(213, 'APPOINTMENT_SLOTS', 'UPDATE');
    await safeCreatePermission(213, 'INVOICES', 'READ');
    await safeCreatePermission(213, 'INVOICES', 'CREATE');
    await safeCreatePermission(213, 'INVOICES', 'UPDATE');
    
    // NURSE (214)
    await safeCreatePermission(214, 'PATIENTS', 'READ');
    await safeCreatePermission(214, 'DOCTORS', 'READ');
    await safeCreatePermission(214, 'APPOINTMENTS', 'READ');
    await safeCreatePermission(214, 'AVAILABILITY', 'MANAGE');
    await safeCreatePermission(214, 'SCHEDULE', 'READ');
    await safeCreatePermission(214, 'SCHEDULE', 'UPDATE');
    await safeCreatePermission(214, 'APPOINTMENT_SLOTS', 'READ');
    await safeCreatePermission(214, 'APPOINTMENT_SLOTS', 'UPDATE');
    await safeCreatePermission(214, 'INVOICES', 'READ');
    
    // RECEPTIONIST (215)
    await safeCreatePermission(215, 'PATIENTS', 'CREATE');
    await safeCreatePermission(215, 'PATIENTS', 'READ');
    await safeCreatePermission(215, 'PATIENTS', 'UPDATE');
    await safeCreatePermission(215, 'DOCTORS', 'READ');
    await safeCreatePermission(215, 'APPOINTMENTS', 'CREATE');
    await safeCreatePermission(215, 'APPOINTMENTS', 'READ');
    await safeCreatePermission(215, 'APPOINTMENTS', 'UPDATE');
    await safeCreatePermission(215, 'APPOINTMENTS', 'DELETE');
    await safeCreatePermission(215, 'INVOICES', 'CREATE');
    await safeCreatePermission(215, 'INVOICES', 'READ');
    await safeCreatePermission(215, 'INVOICES', 'UPDATE');
    await safeCreatePermission(215, 'INVOICES', 'DELETE');
    
    // PATIENT (216) - General permissions
    await safeCreatePermission(216, 'PATIENTS', 'READ');
    await safeCreatePermission(216, 'PATIENTS', 'UPDATE');
    await safeCreatePermission(216, 'APPOINTMENTS', 'READ');
    await safeCreatePermission(216, 'APPOINTMENTS', 'CREATE');
    await safeCreatePermission(216, 'APPOINTMENTS', 'CANCEL');
    await safeCreatePermission(216, 'AVAILABLE_SLOTS', 'READ');
    await safeCreatePermission(216, 'DOCTOR_SCHEDULE', 'READ');
    await safeCreatePermission(216, 'MEDICALRECORDS', 'READ');
    await safeCreatePermission(216, 'INVOICES', 'READ');
    
    // PATIENT (216) - DOCTORS Field permissions
    await safeCreatePermission(216, 'DOCTORS', 'READ', 'FULL_NAME', 1);
    await safeCreatePermission(216, 'DOCTORS', 'READ', 'SPECIALTY', 1);
    await safeCreatePermission(216, 'DOCTORS', 'READ', 'PHONE', 1);
    await safeCreatePermission(216, 'DOCTORS', 'READ', 'EMAIL', 0);
    await safeCreatePermission(216, 'DOCTORS', 'READ', 'SALARY', 0);
    
    // PATIENT (216) - INVOICES Field permissions
    await safeCreatePermission(216, 'INVOICES', 'READ', 'patient_id', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'invoice_number', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'invoice_date', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'amount', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'total_amount', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'paid_amount', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'payment_status', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'notes', 1);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'created_by', 0);
    await safeCreatePermission(216, 'INVOICES', 'READ', 'created_at', 0);
    
    const successCount = rolePermissions.filter(p => p !== null).length;
    console.log(`   ✅ Processed ${successCount} role permissions (Created: ${createdCount}, Already existed: ${updatedCount}${errorCount > 0 ? `, Errors: ${errorCount}` : ''})\n`);

    // 7. Create Appointments
    console.log('7. Creating appointments...');
    
    // Helper function to create or skip appointment
    const createOrSkipAppointment = async (appointmentData: any) => {
      const existing = await prisma.appointment.findFirst({
        where: {
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        schedule: appointmentData.schedule,
        },
      });
      if (existing) {
        return existing;
      }
      return await prisma.appointment.create({ data: appointmentData });
    };
    
    const appointments = [
      await createOrSkipAppointment({
        patientId: patients[0].patientId,
        doctorId: doctors[2].doctorId, // د. محمد حسن
        schedule: new Date('2025-10-01T10:30:00'),
        reason: 'فحص دوري للقلب',
        note: 'يرجى إحضار التحاليل السابقة',
        status: 'scheduled',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[1].patientId,
        doctorId: doctors[0].doctorId, // د. أحمد مصطفى
        schedule: new Date('2025-10-03T14:00:00'),
        reason: 'شكوى من حرارة وألم',
        note: 'المريض يعاني من ارتفاع في الحرارة',
        status: 'pending',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[0].patientId,
        doctorId: doctors[2].doctorId,
        schedule: new Date('2025-10-05T09:00:00'),
        reason: 'متابعة بعد العملية الجراحية',
        status: 'cancelled',
        cancellationReason: 'تأجيل بسبب ظروف المريض',
        appointmentType: 'follow_up',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[4].patientId,
        doctorId: doctors[4].doctorId, // د. كريم سمير
        schedule: new Date('2025-10-07T11:00:00'),
        reason: 'صداع مستمر',
        note: 'أخذ الأدوية بانتظام',
        status: 'scheduled',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[5].patientId,
        doctorId: doctors[3].doctorId, // د. ليلى أحمد
        schedule: new Date('2025-10-10T13:00:00'),
        reason: 'فحص العيون السنوي',
        status: 'pending',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[6].patientId,
        doctorId: doctors[5].doctorId, // د. هالة فؤاد
        schedule: new Date('2025-10-12T15:30:00'),
        reason: 'حكة جلدية مزمنة',
        note: 'استخدام مرهم خاص',
        status: 'scheduled',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[7].patientId,
        doctorId: doctors[6].doctorId, // د. محمود نادر
        schedule: new Date('2025-10-15T09:30:00'),
        reason: 'وجع أسنان حاد',
        note: 'الحجز للجراحة',
        status: 'pending',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[8].patientId,
        doctorId: doctors[7].doctorId, // د. منى حسن
        schedule: new Date('2025-10-17T10:00:00'),
        reason: 'التهاب المفاصل',
        note: 'العلاج الطبيعي مستمر',
        status: 'scheduled',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[9].patientId,
        doctorId: doctors[8].doctorId, // د. سامي علي
        schedule: new Date('2025-10-20T14:00:00'),
        reason: 'حالات طارئة',
        note: 'الإسعافات الأولية تم تقديمها',
        status: 'cancelled',
        cancellationReason: 'تأجيل بناءً على توصية الطبيب',
        appointmentType: 'emergency',
        paymentStatus: 'unpaid',
      }),
      await createOrSkipAppointment({
        patientId: patients[9].patientId,
        doctorId: doctors[9].doctorId, // د. ريم عبد الله
        schedule: new Date('2025-10-22T11:15:00'),
        reason: 'فحص نسائي دوري',
        status: 'scheduled',
        appointmentType: 'consultation',
        paymentStatus: 'unpaid',
      }),
    ];
    console.log(`   ✅ Created ${appointments.length} appointments\n`);

    // 8. Create Doctor Schedules
    console.log('8. Creating doctor schedules...');
    
    // Helper function to create or skip schedule
    const createOrSkipSchedule = async (scheduleData: any) => {
      const existing = await prisma.doctorSchedule.findFirst({
        where: {
        doctorId: scheduleData.doctorId,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        },
      });
      if (existing) {
        return existing;
      }
      return await prisma.doctorSchedule.create({ data: scheduleData });
    };
    
    const schedules = [];
    // Doctor 1 (د. أحمد مصطفى) - Sunday to Thursday, 09:00-17:00
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await createOrSkipSchedule({
        doctorId: doctors[0].doctorId,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
        isAvailable: 1,
        })
      );
    }
    // Doctor 2 (د. سارة علي) - Sunday to Thursday, 08:00-16:00
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await createOrSkipSchedule({
        doctorId: doctors[1].doctorId,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '16:00',
        slotDuration: 30,
        isAvailable: 1,
        })
      );
    }
    // Doctor 3 (د. محمد حسن) - Sunday to Thursday, 10:00-18:00
    for (let day = 1; day <= 5; day++) {
      schedules.push(
        await createOrSkipSchedule({
        doctorId: doctors[2].doctorId,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '18:00',
        slotDuration: 45,
        isAvailable: 1,
        })
      );
    }
    console.log(`   ✅ Created ${schedules.length} doctor schedules\n`);

    // 9. Create Medical Records
    console.log('9. Creating medical records...');
    
    // Helper function to create or skip medical record
    const createOrSkipMedicalRecord = async (recordData: any) => {
      try {
        // Try to find existing record
        const existing = await prisma.medicalRecord.findFirst({
          where: {
            patientId: recordData.patientId,
            doctorId: recordData.doctorId,
            diagnosis: recordData.diagnosis,
          },
        });
        if (existing) {
          return existing;
        }
        // Try to create new record
        return await prisma.medicalRecord.create({ data: recordData });
      } catch (error: any) {
        // If creation fails due to unique constraint, try to find it again
        if (error.code === 'P2002') {
          const found = await prisma.medicalRecord.findFirst({
            where: {
              patientId: recordData.patientId,
              doctorId: recordData.doctorId,
              diagnosis: recordData.diagnosis,
            },
          });
          if (found) {
            return found;
          }
        }
        // If it's a different error or we still can't find it, log and return null
        console.error(`   ⚠️  Failed to create medical record: ${recordData.diagnosis} - ${error.message}`);
        return null;
      }
    };
    
    const medicalRecords = [
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      await createOrSkipMedicalRecord({
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
      }),
      // السجل الحادي عشر - طبيب القلب (حالة أخرى)
      await createOrSkipMedicalRecord({
        patientId: patients[1].patientId, // منى سامي
        doctorId: doctors[0].doctorId, // د. أحمد مصطفى
        diagnosis: 'اضطراب ضربات القلب',
        symptoms: '["خفقان القلب", "دوخة", "ضيق نفس عند المجهود", "ألم في الصدر"]',
        medications: '["بيسوبرولول 5مج", "وارفارين 2.5مج", "ديجوكسين 0.25مج"]',
        treatmentPlan: 'مراقبة دقيقة لضربات القلب، تجنب الكافيين والتوتر',
        notes: 'تحسن في انتظام ضربات القلب مع العلاج',
        bloodPressure: '145/95',
        temperature: 37.3,
        images: '["ecg_followup.jpg", "holter_monitor.pdf"]',
        height: 175.5,
        weight: 84.1,
      }),
      // السجل الثاني عشر - طبيبة الأطفال (حالة جديدة)
      await createOrSkipMedicalRecord({
        patientId: patients[2].patientId, // محمد علي
        doctorId: doctors[1].doctorId, // د. سارة علي
        diagnosis: 'التهاب الأذن الوسطى',
        symptoms: '["ألم في الأذن", "حمى", "فقدان السمع المؤقت", "إفرازات من الأذن"]',
        medications: '["أموكسيسيلين 250مج", "قطرات أذن مضادة للالتهاب", "باراسيتامول للألم"]',
        treatmentPlan: 'مضادات حيوية لمدة 10 أيام، تجنب دخول الماء للأذن',
        notes: 'التحسن ظاهر بعد 48 ساعة من بدء العلاج',
        bloodPressure: '95/60',
        temperature: 38.2,
        images: '["ear_examination.jpg"]',
        height: 125.3,
        weight: 28.5,
      }),
      // السجل الثالث عشر - جراح عام (حالة أخرى)
      await createOrSkipMedicalRecord({
        patientId: patients[3].patientId, // ندى مصطفى
        doctorId: doctors[2].doctorId, // د. محمد حسن
        diagnosis: 'فتق إربي',
        symptoms: '["انتفاخ في المنطقة الإربية", "ألم عند السعال", "ثقل في المنطقة", "ألم متزايد"]',
        medications: '["مسكن ألم خفيف", "مضاد التهاب"]',
        treatmentPlan: 'جراحة إصلاح الفتق بالمنظار، راحة لمدة أسبوعين',
        notes: 'العملية تمت بنجاح، المريض يتعافى جيداً',
        bloodPressure: '128/85',
        temperature: 37.1,
        images: '["hernia_scan.jpg", "pre_surgery.jpg", "post_surgery.jpg"]',
        height: 178.2,
        weight: 87.3,
      }),
      // السجل الرابع عشر - طبيبة الأعصاب (مريض جديد)
      await createOrSkipMedicalRecord({
        patientId: patients[4].patientId, // خالد يوسف
        doctorId: doctors[3].doctorId, // د. ليلى أحمد
        diagnosis: 'اعتلال الأعصاب الطرفية',
        symptoms: '["تنميل في القدمين", "حرقة في الأطراف", "ضعف في القبضة", "ألم ليلي"]',
        medications: '["جابابنتين 300مج", "فيتامين ب المركب", "ألفا ليبويك أسيد"]',
        treatmentPlan: 'علاج طبيعي، تحكم في سكر الدم، تمارين تقوية',
        notes: 'تحسن طفيف في الأعراض، يحتاج متابعة مستمرة',
        bloodPressure: '142/88',
        temperature: 36.9,
        images: '["nerve_conduction_study.pdf", "emg_results.pdf"]',
        height: 180.3,
        weight: 92.1,
      }),
      // السجل الخامس عشر - طبيب العيون (مريض جديد)
      await createOrSkipMedicalRecord({
        patientId: patients[6].patientId, // ياسين محمود
        doctorId: doctors[4].doctorId, // د. كريم سمير
        diagnosis: 'جفاف العين المزمن',
        symptoms: '["حرقة في العيون", "إحساس بوجود رمل", "تشويش متقطع في الرؤية", "احمرار"]',
        medications: '["دموع اصطناعية", "قطرات مضادة للالتهاب", "مرهم ليلي"]',
        treatmentPlan: 'استخدام قطرات مرطبة كل ساعتين، تجنب التيارات الهوائية',
        notes: 'تحسن ملحوظ في الراحة، استمرار العلاج المحافظ',
        bloodPressure: '135/82',
        temperature: 37.0,
        images: '["eye_surface_test.jpg", "tear_film_analysis.pdf"]',
        height: 167.9,
        weight: 69.8,
      }),
    ];
    console.log(`   ✅ Created ${medicalRecords.length} medical records\n`);

    // 10. Create Invoices
    console.log('10. Creating invoices...');
    
    // Helper function to create or skip invoice
    const createOrSkipInvoice = async (invoiceData: any) => {
      try {
        // Try to find existing invoice
        const existing = await prisma.invoice.findFirst({
          where: {
            patientId: invoiceData.patientId,
            appointmentId: invoiceData.appointmentId,
            invoiceNumber: invoiceData.invoiceNumber,
          },
        });
        if (existing) {
          return existing;
        }
        // Try to create new invoice
        return await prisma.invoice.create({ data: invoiceData });
      } catch (error: any) {
        // If creation fails due to unique constraint, try to find it again
        if (error.code === 'P2002') {
          const found = await prisma.invoice.findFirst({
            where: {
              patientId: invoiceData.patientId,
              appointmentId: invoiceData.appointmentId,
            },
          });
          if (found) {
            return found;
          }
        }
        // If it's a different error or we still can't find it, log and return null
        console.error(`   ⚠️  Failed to create invoice: ${invoiceData.invoiceNumber || 'N/A'} - ${error.message}`);
        return null;
      }
    };
    
    const baseTimestamp = Date.now();
    const invoices = [
      await createOrSkipInvoice({
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
      }),
      await createOrSkipInvoice({
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
      }),
      await createOrSkipInvoice({
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
      }),
      await createOrSkipInvoice({
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
