// app/api/specialties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ قائمة تخصصات احتياطية (Fallback)
const fallbackSpecialties = [
  'طب الباطنة',
  'طب الأطفال',
  'طب النساء والتوليد',
  'طب الجراحة',
  'طب العظام',
  'طب القلب',
  'طب الأعصاب',
  'طب العيون',
  'طب الأنف والأذن والحنجرة',
  'طب الجلدية',
  'طب الأسنان',
  'الطب النفسي',
  'الطب الطبيعي والتأهيل',
  'التخدير والعناية المركزة',
  'الأشعة',
  'المختبرات الطبية'
];

// ✅ GET - جلب التخصصات الفريدة من قاعدة البيانات أو fallback
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting specialties API call...');

    const doctors = await prisma.doctor.findMany({
      where: {
        specialty: {
          not: '',
        },
      },
      select: {
        specialty: true,
      },
      distinct: ['specialty'],
      orderBy: {
        specialty: 'asc',
      },
    });

    console.log('📊 Raw database result:', doctors);

    // ✅ تحويل النتائج إلى مصفوفة تخصصات
    const specialties = doctors
      .map((doctor) => doctor.specialty?.trim())
      .filter((spec): spec is string => spec !== undefined && spec !== '');

    console.log('🎯 Processed specialties:', specialties);

    // ✅ إذا لم يتم العثور على نتائج، استخدام fallback
    if (specialties.length === 0) {
      console.warn('⚠️ No specialties found in database. Using fallback list.');
      return NextResponse.json(fallbackSpecialties);
    }

    return NextResponse.json(specialties);

  } catch (error) {
    console.error('❌ Error fetching specialties:', error);
    console.warn('⚠️ Using fallback specialties due to error.');

    return NextResponse.json(fallbackSpecialties);
  }
}
