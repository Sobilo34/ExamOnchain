# Frontend routes and UI direction (`apps/web`)

## Public

- `/` — Landing, links to student/lecturer login.

## Visual direction

- Brand name shown in UI: `FUT ExamOnchain`.
- Institution copy shown in shell and landing hero: `Federal University of Technology, Minna (FUTMINNA)`.
- Core mood: premium academic, ceremonial, confident, and modern.
- Palette direction: deep indigo, warm gold, ivory, emerald accents, and controlled glass surfaces.
- Typography direction: a display serif for headlines and a distinct geometric sans for body and UI labels.
- Motif: a crest or medallion inspired by the uploaded FUTMINNA logo, reused sparingly as a signature mark.
- Motion: subtle entrance fades, staggered card reveals, and soft hover lifts; avoid generic dashboard motion.
- Surfaces: layered gradients, textured backgrounds, and crisp borders rather than flat monochrome panels.

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

## Explorer and verification defaults

- Transaction and anchor links should prefer Blockscout when the environment does not specify another explorer.
- Sepolia remains the chain identity for MVP and should be visible in status badges and verification copy.

## Stack

Next.js App Router, TanStack Query, Alchemy Account Kit, Tailwind CSS.
