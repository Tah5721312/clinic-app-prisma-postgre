# Prisma Database Setup

هذا المشروع يستخدم Prisma مع PostgreSQL بدلاً من Oracle Database.

## نظام الـ Primary Keys

المشروع يستخدم نظام خاص للـ Primary Keys حيث كل جدول له prefix محدد:

- **Doctors**: 75 (مثال: 751, 752, 753...)
- **Patients**: 95 (مثال: 951, 952, 953...)
- **Appointments**: 55 (مثال: 551, 552, 553...)
- **Medical Records**: 33 (مثال: 331, 332, 333...)
- **Users**: 45 (مثال: 451, 452, 453...)
- **Role Permissions**: 65 (مثال: 651, 652, 653...)
- **Doctor Schedules**: 77 (مثال: 771, 772, 773...)

## الإعداد

### 1. تثبيت Dependencies

```bash
npm install prisma @prisma/client
# أو
pnpm add prisma @prisma/client
```

### 2. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db?schema=public"
```

### 3. تشغيل Migrations

```bash
# إنشاء قاعدة البيانات والجداول
npx prisma migrate dev --name init

# أو إذا كنت تريد تطبيق migrations موجودة فقط
npx prisma migrate deploy
```

### 4. تطبيق Functions و Triggers

بعد تشغيل Prisma migrations، قم بتطبيق ملف SQL للـ functions والـ triggers:

```bash
# باستخدام psql
psql -U username -d clinic_db -f prisma/migrations/001_create_id_functions.sql

# أو باستخدام أي PostgreSQL client
```

### 5. توليد Prisma Client

```bash
npx prisma generate
```

## استخدام Prisma Client

```typescript
import { prisma } from '@/lib/prisma';

// مثال: إنشاء طبيب جديد
const doctor = await prisma.doctor.create({
  data: {
    name: 'د. أحمد مصطفى',
    email: 'ahmed@example.com',
    phone: '+201234567890',
    specialty: 'طب القلب',
    // doctor_id سيتم توليده تلقائياً بواسطة trigger
  },
});

// مثال: جلب جميع الأطباء
const doctors = await prisma.doctor.findMany({
  where: {
    isAvailable: 1,
  },
});

// مثال: جلب مريض مع طبيبه الأساسي
const patient = await prisma.patient.findUnique({
  where: { patientId: 951 },
  include: {
    primaryPhysicianRelation: true,
  },
});
```

## ID Generator Utilities

استخدم utilities في `src/lib/idGenerator.ts` للتعامل مع الـ IDs:

```typescript
import { 
  extractPrefix, 
  extractSequence, 
  isDoctorId, 
  formatId 
} from '@/lib/idGenerator';

// التحقق من نوع ID
if (isDoctorId(someId)) {
  console.log('This is a doctor ID');
}

// استخراج prefix
const prefix = extractPrefix(751); // returns 75

// تنسيق ID للعرض
const formatted = formatId(751234567890); // returns "75-1234-5678-90"
```

## Migrations

عند إجراء تغييرات على Schema:

```bash
# إنشاء migration جديد
npx prisma migrate dev --name description_of_changes

# تطبيق migrations في production
npx prisma migrate deploy
```

## Prisma Studio

لتصفح قاعدة البيانات بشكل مرئي:

```bash
npx prisma studio
```

## ملاحظات مهمة

1. **الـ IDs**: جميع الـ IDs يتم توليدها تلقائياً بواسطة database triggers. لا تقم بتعيين ID يدوياً عند الإنشاء.

2. **BigInt**: بعض الـ IDs قد تكون كبيرة جداً. تأكد من استخدام `BigInt` في TypeScript عند الحاجة.

3. **Timestamps**: الحقول `createdAt` و `updatedAt` يتم إدارتها تلقائياً بواسطة Prisma.

4. **Relations**: تأكد من إنشاء السجلات المرتبطة (مثل Doctor قبل Patient) لتجنب أخطاء Foreign Key.

## التحويل من Oracle

إذا كنت تقوم بالتحويل من Oracle Database:

1. قم بتصدير البيانات من Oracle
2. قم بتحويل البيانات إلى تنسيق مناسب لـ PostgreSQL
3. استخدم `prisma db seed` أو scripts مخصصة لاستيراد البيانات

