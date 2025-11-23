# ملخص إعداد Prisma PostgreSQL

## ✅ ما تم إنجازه

تم تحويل قاعدة البيانات من Oracle إلى PostgreSQL باستخدام Prisma مع الحفاظ على نظام الـ Primary Keys المخصص.

## 📁 الملفات المُنشأة

### 1. Prisma Schema
- **الموقع**: `prisma/schema.prisma`
- **الوصف**: تعريف جميع الجداول والعلاقات
- **المميزات**:
  - جميع الـ IDs (ما عدا Role) من نوع `BigInt`
  - الحفاظ على نفس البنية من Oracle
  - Relations كاملة بين الجداول

### 2. Database Functions & Triggers
- **الموقع**: `prisma/migrations/001_create_id_functions.sql`
- **الوصف**: Functions و Triggers لتوليد الـ IDs تلقائياً
- **المميزات**:
  - توليد IDs تلقائياً بنفس نظام Oracle (prefixes: 75, 95, 55, 33, 45, 65, 77)
  - تحديث `updated_at` تلقائياً
  - Check constraints للحفاظ على صحة البيانات

### 3. Prisma Client
- **الموقع**: `src/lib/prisma.ts`
- **الوصف**: Singleton instance لـ Prisma Client
- **الاستخدام**: `import { prisma } from '@/lib/prisma'`

### 4. ID Generator Utilities
- **الموقع**: `src/lib/idGenerator.ts`
- **الوصف**: Helper functions للتعامل مع الـ IDs
- **الوظائف**:
  - `extractPrefix()` - استخراج prefix من ID
  - `extractSequence()` - استخراج sequence number
  - `isDoctorId()`, `isPatientId()`, etc. - Type guards
  - `formatId()` - تنسيق ID للعرض
  - `getEntityType()` - معرفة نوع الـ entity من ID

### 5. Seed Script
- **الموقع**: `prisma/seed.ts`
- **الوصف**: Script لإضافة بيانات أولية
- **التشغيل**: `npm run db:seed`

### 6. Documentation
- **MIGRATION_GUIDE.md**: دليل شامل للتحويل والاستخدام
- **QUICK_START.md**: دليل سريع للبدء
- **prisma/README.md**: توثيق Prisma

## 🔑 نظام الـ Primary Keys

| الجدول | Prefix | مثال ID |
|--------|--------|---------|
| Doctors | 75 | 751, 752, 753... |
| Patients | 95 | 951, 952, 953... |
| Appointments | 55 | 551, 552, 553... |
| Medical Records | 33 | 331, 332, 333... |
| Users | 45 | 451, 452, 453... |
| Role Permissions | 65 | 651, 652, 653... |
| Doctor Schedules | 77 | 771, 772, 773... |
| Roles | Fixed | 211, 212, 213... |

**ملاحظة**: جميع الـ IDs (ما عدا Role) يتم توليدها تلقائياً بواسطة database triggers.

## 🚀 الخطوات التالية

### 1. تثبيت Dependencies

```bash
npm install
```

### 2. إعداد قاعدة البيانات

أنشئ ملف `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db?schema=public"
```

### 3. إنشاء قاعدة البيانات

```sql
CREATE DATABASE clinic_db;
```

### 4. تشغيل Migrations

```bash
# إنشاء الجداول
npx prisma migrate dev --name init

# تطبيق functions و triggers
psql -U username -d clinic_db -f prisma/migrations/001_create_id_functions.sql

# توليد Prisma Client
npx prisma generate
```

### 5. Seed البيانات (اختياري)

```bash
npm run db:seed
```

## 📝 أمثلة الاستخدام

### إنشاء سجل جديد

```typescript
import { prisma } from '@/lib/prisma';

// إنشاء طبيب (ID سيتم توليده تلقائياً)
const doctor = await prisma.doctor.create({
  data: {
    name: 'د. أحمد مصطفى',
    email: 'ahmed@example.com',
    phone: '+201234567890',
    specialty: 'طب القلب',
    consultationFee: 300,
    isAvailable: 1,
  },
});

console.log(doctor.doctorId); // BigInt مثل: 751n
```

### جلب السجلات

```typescript
// جلب جميع الأطباء
const doctors = await prisma.doctor.findMany({
  where: { isAvailable: 1 },
});

// جلب مريض مع طبيبه
const patient = await prisma.patient.findUnique({
  where: { patientId: BigInt(951) },
  include: { primaryPhysicianRelation: true },
});
```

### استخدام ID Generator

```typescript
import { isDoctorId, formatId } from '@/lib/idGenerator';

const id = BigInt(751);

if (isDoctorId(id)) {
  console.log('This is a doctor ID');
}

const formatted = formatId(id); // "75-1"
```

## ⚠️ ملاحظات مهمة

1. **BigInt**: جميع الـ IDs (ما عدا Role) من نوع `BigInt`. استخدم `BigInt()` عند العمل معها.

2. **Auto-generation**: لا تقم بتعيين ID يدوياً عند الإنشاء. الـ triggers ستعتني بذلك.

3. **JSON Serialization**: BigInt لا يتم serialize تلقائياً في JSON. استخدم:

```typescript
JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
```

4. **Foreign Keys**: تأكد من إنشاء السجلات المرتبطة أولاً لتجنب أخطاء Foreign Key.

## 🔧 الأوامر المفيدة

```bash
# Prisma Studio (واجهة مرئية)
npm run db:studio

# إنشاء migration جديد
npm run db:migrate

# تطبيق migrations في production
npm run db:migrate:deploy

# Seed البيانات
npm run db:seed

# توليد Prisma Client
npm run db:generate
```

## 📚 المزيد من المعلومات

- راجع `MIGRATION_GUIDE.md` للدليل الشامل
- راجع `QUICK_START.md` للبدء السريع
- راجع `prisma/README.md` لتوثيق Prisma

## 🆘 استكشاف الأخطاء

### Trigger لا يعمل
- تأكد من تطبيق `001_create_id_functions.sql`
- تحقق من وجود الـ functions في قاعدة البيانات

### Foreign Key Constraint
- تأكد من إنشاء السجلات المرتبطة أولاً
- تحقق من وجود الـ IDs المستخدمة

### BigInt Issues
- استخدم `BigInt()` عند العمل مع IDs
- تحويل BigInt إلى string للـ JSON serialization

