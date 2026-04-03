# Data model

## Entities (Postgres / Prisma)

- **User** — `id`, `email`, `studentId` (nullable for lecturers), `role` (`STUDENT` | `LECTURER`), `smartAccountAddress` (nullable until linked), `createdAt`.
- **Course** — `id`, `lecturerId`, `title`, `code`, `level`, `term`, `joinCode` (optional), `createdAt`.
- **Enrollment** — `userId`, `courseId`, `status` (`ACTIVE` | `PENDING`), unique `(userId, courseId)`.
- **Material** — `id`, `courseId`, `name`, `cid`, `createdAt`.
- **Exam** — `id`, `courseId`, `title`, `status` (`DRAFT` | `PUBLISHED` | `CLOSED`), `opensAt`, `closesAt`, `durationMinutes`, `questionSource` (`AI_MATERIALS` | `FILE_UPLOAD`), `contentHash` (bytes32 hex for optional on-chain mirror), `examKey` (bytes32, aligned with contract).
- **Question** — `id`, `examId`, `type` (`MCQ` | `SHORT_ANSWER`), `prompt`, `options` (JSON for MCQ), `correctIndex` (MCQ), `points`, `order`.
- **Attempt** — `id`, `examId`, `userId`, `startedAt`, `submittedAt`, `answers` (JSON), `score` (nullable until graded), `scoreHash` (hex), `metadataHash` (hex), `anchorTxHash` (nullable), `anchorStatus` (`PENDING` | `CONFIRMED` | `FAILED`).

## On-chain identifiers (no raw PII)

- `studentCommitment = keccak256(abi.encodePacked(UNIVERSITY_SALT, studentId))` — must match `contracts` and API `solidityPackedKeccak256`.
- `examKey = keccak256(abi.encodePacked(BACKEND_ISSUER_ADDRESS, examInternalId))` where `examInternalId` is `uint256` or `bytes32` — implementation uses `uint256` exam counter from DB cast to hex for packing.

## Exam state machine

`DRAFT` → `PUBLISHED` (after publish + valid window + ≥1 question) → `CLOSED` (after `closesAt` or manual).

## Enrollment

Students see only courses they are enrolled in. MVP: lecturer CSV roster + join code self-enroll with `PENDING` until approved (optional auto-approve via join code).
