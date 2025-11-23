# ✅ قائمة التحقق من الإعداد

## الخطوات المكتملة

- [x] تثبيت Prisma dependencies (`@prisma/client`, `prisma`, `tsx`)
- [x] إنشاء Prisma Schema (`prisma/schema.prisma`)
- [x] إنشاء Database Functions & Triggers (`prisma/migrations/001_create_id_functions.sql`)
- [x] إنشاء TypeScript Utilities (`src/lib/prisma.ts`, `src/lib/idGenerator.ts`)
- [x] إنشاء Seed Script (`prisma/seed.ts`)
- [x] توليد Prisma Client

## الخطوات المتبقية

### 1. إعداد قاعدة البيانات PostgreSQL

تأكد من:
- [ ] تثبيت PostgreSQL على الجهاز
- [ ] إنشاء قاعدة بيانات جديدة:
  ```sql
  CREATE DATABASE clinic_db;
  ```

### 2. إعداد ملف `.env`

- [ ] أنشئ ملف `.env` في جذر المشروع
- [ ] أضف `DATABASE_URL`:
  ```env
  DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db?schema=public"
  ```
  استبدل `username` و `password` ببيانات PostgreSQL الخاصة بك

### 3. تشغيل Migrations

- [ ] إنشاء الجداول:
  ```bash
  pnpm db:migrate
  ```
  أو
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] تطبيق Functions و Triggers:
  ```bash
  psql -U username -d clinic_db -f prisma/migrations/001_create_id_functions.sql
  ```
  
  أو استخدم أي PostgreSQL client (مثل pgAdmin, DBeaver) لتشغيل الملف:
  `prisma/migrations/001_create_id_functions.sql`

### 4. Seed البيانات (اختياري)

- [ ] إضافة بيانات أولية:
  ```bash
  pnpm db:seed
  ```

### 5. التحقق من الإعداد

- [ ] فتح Prisma Studio للتحقق:
  ```bash
  pnpm db:studio
  ```

- [ ] اختبار الاتصال بقاعدة البيانات في الكود

## ملاحظات

- تأكد من أن PostgreSQL يعمل على الجهاز
- تأكد من صحة بيانات الاتصال في `.env`
- الـ IDs سيتم توليدها تلقائياً بواسطة triggers
- جميع الـ IDs (ما عدا Role) من نوع `BigInt`

## في حالة وجود مشاكل

1. **خطأ في الاتصال**: تحقق من `DATABASE_URL` في `.env`
2. **Trigger لا يعمل**: تأكد من تطبيق `001_create_id_functions.sql`
3. **Foreign Key Error**: تأكد من إنشاء السجلات المرتبطة أولاً

