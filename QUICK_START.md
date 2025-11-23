# Quick Start Guide - Prisma PostgreSQL Setup

## الخطوات السريعة للبدء

### 1. تثبيت Dependencies

```bash
npm install
# أو
pnpm install
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

### 6. البدء في التطوير

```bash
npm run dev
```

## استخدام Prisma Client

```typescript
import { prisma } from '@/lib/prisma';

// مثال بسيط
const doctors = await prisma.doctor.findMany();
```

## الأوامر المفيدة

```bash
# فتح Prisma Studio
npm run db:studio

# إنشاء migration جديد
npm run db:migrate

# تطبيق migrations في production
npm run db:migrate:deploy

# إعادة تعيين قاعدة البيانات (development)
npx prisma migrate reset
```

## ملاحظات

- جميع الـ IDs (ما عدا Role) من نوع `BigInt`
- الـ IDs يتم توليدها تلقائياً بواسطة triggers
- لا تقم بتعيين ID يدوياً عند الإنشاء

