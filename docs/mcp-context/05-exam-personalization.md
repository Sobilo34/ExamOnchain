# Exam personalization (normative MVP)

## Inputs

- `examId` (internal DB id)
- `userId` (student)
- Server secret: `PERSONALIZATION_SECRET` (env)

## Algorithm

1. Load full ordered question list for the exam from DB.
2. Compute `seed = keccak256(utf8Bytes("${examId}:${userId}:${PERSONALIZATION_SECRET}"))` as hex string (Node: `keccak256(toUtf8Bytes(...))` from ethers v6).
3. Use seed to **shuffle** order of questions (Fisher–Yates with deterministic PRNG from seed — e.g. mulberry32 on seed hash bytes).
4. For each MCQ, **shuffle option order** with a sub-seed per question index; remap `correctIndex` to match new positions.

## API contract

`POST /v1/student/exams/:id/attempts` returns questions **without** `correctIndex` (strip before JSON). Client never sees answer key.

## Fairness note

All variants draw from the same bank; document cap on bank size in lecturer UI.
