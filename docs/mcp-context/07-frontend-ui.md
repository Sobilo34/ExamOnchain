# Frontend routes (`apps/web`)

## Public

- `/` — Landing, links to student/lecturer login.

## Student

- `/student/login`
- `/student/onboarding` — AA wallet connect + link address
- `/student/dashboard`
- `/student/course/[courseId]`
- `/student/exam/[examId]/instructions`
- `/student/exam/[examId]/attempt`
- `/student/exam/[examId]/result`
- `/student/records`

## Lecturer

- `/lecturer/login`
- `/lecturer/dashboard`
- `/lecturer/courses`
- `/lecturer/courses/new`
- `/lecturer/courses/[id]/edit`
- `/lecturer/courses/[id]/roster`
- `/lecturer/courses/[id]/materials`
- `/lecturer/courses/[id]/exams/new`
- `/lecturer/exams/[id]/draft`
- `/lecturer/exams/[id]/live`

## Components

- `AppShell`, `ExamTimer`, `QuestionRenderer`, `WalletAddressField`, `TxAnchorStatus`

## Stack

Next.js App Router, TanStack Query, Alchemy Account Kit, Tailwind CSS.
