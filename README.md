# JEPAT

JEPAT adalah aplikasi web internal V1 untuk tim kecil yang digunakan mencatat check-in emosi harian secara manual, membandingkan polanya dengan ringkasan Human Design tiap anggota yang dikelola manual, serta meninjau rekomendasi yang lembut dan reflektif.

This project is intentionally positioned as a self-awareness and team wellbeing tool.
It is **not** a medical, psychological, or diagnostic product.

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
- File rave chart yang diunggah disimpan di filesystem server pada `public/uploads`.

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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jepat?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
APP_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

### Notes

- `DATABASE_URL` is required for Prisma commands and runtime database access.
- `AUTH_SECRET` should be a long random string in non-local environments.
- `UPLOAD_DIR` defaults to `./public/uploads`.
- Existing ravechart files currently live in `public/uploads/ravecharts` so they can remain visible when the project is moved or published.
- For multi-instance or serverless production deployments, replace the local upload strategy with persistent object storage such as Supabase Storage or Vercel Blob.

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
