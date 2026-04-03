# API outline (`/v1`)

Base URL: `apps/api` default `http://localhost:4000`.

## Auth

- `POST /v1/auth/register` — dev/MVP: body `{ email, studentId?, role }` creates user + returns session token (cookie also set if using cookie mode).
- `POST /v1/auth/login` — body `{ email, studentId? }` for students (match roster) or lecturer email.
- `POST /v1/auth/logout` — clear session.

(Magic link can replace this in production; MVP uses simple login for local dev.)

## Me

- `GET /v1/me` — profile, role, `smartAccountAddress`.
- `POST /v1/me/wallet` — body `{ smartAccountAddress }`.

## Lecturer

- `GET /v1/lecturer/courses` — list.
- `POST /v1/lecturer/courses` — create.
- `PATCH /v1/lecturer/courses/:id` — update.
- `POST /v1/lecturer/courses/:id/roster` — body `{ rows: [{ studentId, email }] }`.
- `POST /v1/lecturer/courses/:id/materials` — multipart `file` → local/IPFS stub CID.
- `POST /v1/lecturer/courses/:id/exams` — create draft exam.
- `PATCH /v1/lecturer/exams/:id` — schedule, source, title.
- `POST /v1/lecturer/exams/:id/extract` — trigger stub AI from materials text.
- `POST /v1/lecturer/exams/:id/questions-file` — upload JSON/CSV stub.
- `PATCH /v1/lecturer/exams/:id/questions` — replace questions array.
- `POST /v1/lecturer/exams/:id/publish` — publish exam.
- `GET /v1/lecturer/exams/:id/monitor` — attempt stats.

## Student

- `GET /v1/student/courses` — enrolled courses + next exam hint.
- `GET /v1/student/exams/:id` — metadata + eligibility.
- `POST /v1/student/exams/:id/attempts` — start; returns personalized questions.
- `PATCH /v1/student/attempts/:id` — autosave `{ answers }`.
- `POST /v1/student/attempts/:id/submit` — score + anchor tx.
- `GET /v1/student/attempts/:id/result` — score + anchor status.

## Errors

JSON `{ error: string, code?: string }` with appropriate HTTP status.
