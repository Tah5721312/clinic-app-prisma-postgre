# دليل التحويل من Oracle إلى PostgreSQL مع Prisma

هذا الدليل يشرح كيفية التحويل من Oracle Database إلى PostgreSQL باستخدام Prisma مع الحفاظ على نظام الـ Primary Keys المخصص.

## 📋 المتطلبات

1. PostgreSQL 12 أو أحدث
2. Node.js 18 أو أحدث
3. npm أو pnpm

## 🚀 خطوات الإعداد

### 1. تثبيت Dependencies

```bash
npm install prisma @prisma/client
npm install -D tsx
```

أو باستخدام pnpm:

```bash
pnpm add prisma @prisma/client
pnpm add -D tsx
```

### 2. إعداد قاعدة البيانات

#### إنشاء قاعدة بيانات PostgreSQL

```sql
CREATE DATABASE clinic_db;
```

#### إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db?schema=public"
```

### 3. تشغيل Prisma Migrations

```bash
# إنشاء migration أولي
npx prisma migrate dev --name init

# هذا سينشئ الجداول في قاعدة البيانات
```

### 4. تطبيق Functions و Triggers

بعد إنشاء الجداول، قم بتطبيق ملف SQL للـ functions والـ triggers:

```bash
# باستخدام psql
psql -U username -d clinic_db -f prisma/migrations/001_create_id_functions.sql

# أو باستخدام أي PostgreSQL client (مثل pgAdmin, DBeaver)
```

### 5. توليد Prisma Client

```bash
npx prisma generate
```

## 🔑 نظام الـ Primary Keys

المشروع يستخدم نظام خاص للـ Primary Keys حيث كل جدول له prefix محدد:

| الجدول | Prefix | مثال |
|--------|--------|------|
| Doctors | 75 | 751, 752, 753... |
| Patients | 95 | 951, 952, 953... |
| Appointments | 55 | 551, 552, 553... |
| Medical Records | 33 | 331, 332, 333... |
| Users | 45 | 451, 452, 453... |
| Role Permissions | 65 | 651, 652, 653... |
| Doctor Schedules | 77 | 771, 772, 773... |

**ملاحظة مهمة**: الـ IDs يتم توليدها تلقائياً بواسطة database triggers. لا تقم بتعيين ID يدوياً عند الإنشاء.

## 💻 استخدام Prisma Client

### استيراد Prisma Client

```typescript
import { prisma } from '@/lib/prisma';
```

### أمثلة على الاستخدام

#### إنشاء سجل جديد

```typescript
// إنشاء طبيب جديد (ID سيتم توليده تلقائياً)
const doctor = await prisma.doctor.create({
  data: {
    name: 'د. أحمد مصطفى',
    email: 'ahmed@example.com',
    phone: '+201234567890',
    specialty: 'طب القلب',
    experience: 11,
    consultationFee: 300,
    isAvailable: 1,
  },
});

console.log(doctor.doctorId); // سيكون مثل: 751
```

#### جلب السجلات

```typescript
// جلب جميع الأطباء المتاحين
const doctors = await prisma.doctor.findMany({
  where: {
    isAvailable: 1,
  },
  orderBy: {
    name: 'asc',
  },
});

// جلب مريض مع طبيبه الأساسي
const patient = await prisma.patient.findUnique({
  where: { patientId: BigInt(951) },
  include: {
    primaryPhysicianRelation: {
      select: {
        name: true,
        specialty: true,
        phone: true,
      },
    },
  },
});
```

#### تحديث سجل

```typescript
// تحديث حالة توفر الطبيب
await prisma.doctor.update({
  where: { doctorId: BigInt(751) },
  data: {
    isAvailable: 0,
    availabilityUpdatedAt: new Date(),
  },
});
```

#### حذف سجل

```typescript
// حذف موعد
await prisma.appointment.delete({
  where: { appointmentId: BigInt(551) },
});
```

#### استخدام Relations

```typescript
// جلب جميع مواعيد مريض مع بيانات الطبيب
const appointments = await prisma.appointment.findMany({
  where: {
    patientId: BigInt(951),
  },
  include: {
    doctor: {
      select: {
        name: true,
        specialty: true,
        phone: true,
      },
    },
    patient: {
      select: {
        name: true,
        phone: true,
      },
    },
  },
});
```

## 🛠️ استخدام ID Generator Utilities

استخدم utilities في `src/lib/idGenerator.ts` للتعامل مع الـ IDs:

```typescript
import { 
  extractPrefix, 
  extractSequence, 
  isDoctorId, 
  formatId,
  ID_PREFIXES 
} from '@/lib/idGenerator';

// التحقق من نوع ID
const someId = BigInt(751);
if (isDoctorId(someId)) {
  console.log('This is a doctor ID');
}

// استخراج prefix
const prefix = extractPrefix(751); // returns 75

// استخراج sequence number
const seq = extractSequence(751); // returns 1

// تنسيق ID للعرض
const formatted = formatId(751234567890); // returns "75-1234-5678-90"

// معرفة نوع الـ entity من ID
const entityType = getEntityType(751); // returns "doctor"
```

## 📊 Prisma Studio

لتصفح قاعدة البيانات بشكل مرئي:

```bash
npx prisma studio
```

سيتم فتح واجهة ويب على `http://localhost:5555`

## 🔄 Migrations

### إنشاء Migration جديد

```bash
# بعد تعديل schema.prisma
npx prisma migrate dev --name description_of_changes
```

### تطبيق Migrations في Production

```bash
npx prisma migrate deploy
```

### إعادة تعيين قاعدة البيانات (Development فقط)

```bash
npx prisma migrate reset
```

## 📝 Seed Database

لإضافة بيانات أولية:

```bash
npm run db:seed
```

أو:

```bash
npx prisma db seed
```

## ⚠️ ملاحظات مهمة

### 1. استخدام BigInt

جميع الـ IDs من نوع `BigInt` في TypeScript. تأكد من:

```typescript
// ✅ صحيح
const doctorId = BigInt(751);
await prisma.doctor.findUnique({ where: { doctorId } });

// ❌ خطأ
const doctorId = 751; // يجب أن يكون BigInt
```

### 2. التحويل من String إلى BigInt

```typescript
// من string
const id = BigInt("751");

// من number
const id = BigInt(751);
```

### 3. التحويل من BigInt إلى String/Number

```typescript
const doctorId = BigInt(751);

// إلى string
const idString = doctorId.toString();

// إلى number (فقط إذا كان الرقم صغيراً)
const idNumber = Number(doctorId);
```

### 4. JSON Serialization

BigInt لا يتم serialize تلقائياً في JSON. استخدم:

```typescript
const doctor = await prisma.doctor.findUnique({
  where: { doctorId: BigInt(751) },
});

// تحويل BigInt إلى string للـ JSON
const json = JSON.stringify(doctor, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
```

## 🔧 استكشاف الأخطاء

### مشكلة: Trigger لا يعمل

1. تأكد من تطبيق ملف `001_create_id_functions.sql`
2. تحقق من وجود الـ functions في قاعدة البيانات:

```sql
SELECT proname FROM pg_proc WHERE proname LIKE 'generate_%_id';
```

### مشكلة: Foreign Key Constraint

تأكد من إنشاء السجلات المرتبطة أولاً:

```typescript
// ✅ صحيح: إنشاء Doctor أولاً
const doctor = await prisma.doctor.create({ ... });
const patient = await prisma.patient.create({
  data: {
    primaryPhysician: doctor.doctorId,
    ...
  },
});

// ❌ خطأ: استخدام ID غير موجود
const patient = await prisma.patient.create({
  data: {
    primaryPhysician: BigInt(999), // غير موجود
    ...
  },
});
```

## 📚 موارد إضافية

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma with TypeScript](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/using-prisma-client-with-typescript)

## 🆘 الدعم

إذا واجهت أي مشاكل، تأكد من:

1. فحص logs في console
2. التحقق من `prisma/migrations` folder
3. التحقق من database connection string
4. التأكد من تطبيق جميع migrations

