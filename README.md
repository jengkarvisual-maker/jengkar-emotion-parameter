# JEPAT

JEPAT adalah aplikasi web internal V1 untuk tim kecil yang digunakan mencatat check-in emosi harian secara manual, membandingkan polanya dengan ringkasan Human Design tiap anggota yang dikelola manual, serta meninjau rekomendasi yang lembut dan reflektif.

Produk ini diposisikan sebagai alat self-awareness dan wellbeing tim.
Aplikasi ini **bukan** produk medis, psikologis, atau diagnostik.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI components in `components/ui`
- Prisma ORM
- PostgreSQL
- Credential-based authentication with secure signed cookies
- Recharts
- Zod

## Core features

- Role-based authentication for `OWNER` and `MEMBER`
- Seeded demo accounts for one owner and nine members
- Team member CRUD
- Human Design summary management per member
- Rave chart file upload support for PDF and image files
- Morning and night emotion logs with validation
- One morning log and one night log per member per day
- Rule-based recommendation engine that saves recommendations after each log
- Owner dashboard with summary metrics, completion status, trends, and member comparisons
- Member dashboard with personal trends, status, Human Design summary, and recent recommendations

## Important product constraints

- The app uses reflective, non-clinical recommendation language.
- Human Design data is entered manually by the owner in V1.
- There is no OCR, PDF interpretation, or AI chart analysis in this version.
- File rave chart lama masih tersedia di `public/uploads`.
- Upload ravechart baru dapat diarahkan ke Supabase Storage untuk deployment online.

## Routes

- `/login`
- `/dashboard`
- `/me`
- `/members`
- `/members/[id]`
- `/members/[id]/human-design`
- `/logs`
- `/settings`

## Environment variables

Create a local `.env` file based on `.env.example`.

```env
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_DB_PASSWORD]@[YOUR_REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_DB_PASSWORD]@[YOUR_REGION].pooler.supabase.com:5432/postgres"
AUTH_SECRET="replace-with-a-long-random-string"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="replace-with-your-supabase-service-role-key"
SUPABASE_STORAGE_BUCKET="ravecharts"
UPLOAD_DIR="./public/uploads"
```

### Notes

- `DATABASE_URL` is required for Prisma commands and runtime database access.
- `DATABASE_URL` should use the Supabase transaction pooler for runtime traffic, with `?pgbouncer=true`.
- `DIRECT_URL` should use the Supabase session pooler for Prisma CLI commands such as `db push`.
- `AUTH_SECRET` should be a long random string in non-local environments.
- `NEXT_PUBLIC_SUPABASE_URL` is used to build public URLs for uploaded ravechart files.
- `SUPABASE_SERVICE_ROLE_KEY` is used only on the server to upload and remove files from Supabase Storage. Never expose it in the browser.
- `SUPABASE_STORAGE_BUCKET` should point to a public bucket, for example `ravecharts`.
- `UPLOAD_DIR` defaults to `./public/uploads`.
- Existing ravechart files currently live in `public/uploads/ravecharts` so they can remain visible when the project is moved or published.
- For multi-instance or serverless production deployments, use persistent object storage such as Supabase Storage or Vercel Blob.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and update values:

```bash
copy .env.example .env
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Push the schema to your PostgreSQL database:

```bash
npx prisma db push
```

5. Seed demo data:

```bash
npm run prisma:seed
```

6. Start the development server:

```bash
npm run dev
```

7. Open the app:

```text
http://localhost:3000
```

### Local Windows note

If `npm run dev` runs into shell or permission issues in a restricted terminal session, you can still run the app locally with:

```bash
npm run build
npm run start
```

This project was verified successfully with that fallback flow as well.

## Online deployment checklist

1. Create a public Supabase Storage bucket named `ravecharts`.
2. Fill Vercel project environment variables with:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
3. Point `DATABASE_URL` to your Supabase Postgres connection string.
4. Run `npx prisma db push` against the Supabase database.
5. Run `npm run prisma:seed` once if you want the demo accounts on the online environment.
6. Deploy to Vercel from the linked GitHub repository.

Bucket note:
`getPublicUrl()` from the Supabase SDK only works for public buckets, so `ravecharts` needs to be public according to the Supabase docs.

## Production build

```bash
npm run build
npm run start
```

## Seeded demo credentials

### Owner

- Email: `owner@emotiontracker.local`
- Password: `Owner123!`

### Members

Setiap anggota seed menggunakan password `Member123!`.

- `lugas.adepi.bumi@emotiontracker.local`
- `naila.salma@emotiontracker.local`
- `ilham.nasrudin@emotiontracker.local`
- `sindy.pratiwi@emotiontracker.local`
- `miftah.masud@emotiontracker.local`
- `yongki.pardamean@emotiontracker.local`
- `arif.rahman@emotiontracker.local`
- `agung.kusuma.wulandari@emotiontracker.local`
- `nuzulul.lia@emotiontracker.local`

## Seed data included

- 1 owner account
- 9 member accounts
- Human Design profile summaries for all seeded members
- Tidak ada dummy emotion log
- Tidak ada rekomendasi dummy

## File uploads

V1 accepts:

- PDF
- JPG / JPEG
- PNG
- WEBP

Uploaded files are saved in `public/uploads/ravecharts`.

## Verification notes

The codebase was verified with:

- `npx prisma generate`
- `npm run build`

If you run `npx prisma validate` without a configured `DATABASE_URL`, Prisma will report that the environment variable is missing. That is expected until `.env` is configured.
