# Backend modules (`apps/api`)

## Layout

- `src/index.ts` — Fastify bootstrap, CORS, cookie, routes.
- `src/lib/prisma.ts` — Prisma client.
- `src/lib/auth.ts` — JWT session.
- `src/lib/chain.ts` — ethers relayer + `examKey` / `studentCommitment` / `scoreHash`.
- `src/lib/personalize.ts` — question shuffle per 05-exam-personalization.
- `src/lib/scoring.ts` — MCQ grading; stub short-answer.
- `src/lib/ipfs.ts` — local dev: fake CID from hash; replace with Pinata/web3.storage.
- `src/lib/ai-extract.ts` — optional OpenAI; stub returns sample questions if no key.
- `src/routes/*` — route modules.

## Jobs

MVP: synchronous `extract` endpoint; optional queue later (BullMQ).

## Env

See `apps/api/.env.example` — `DATABASE_URL`, `JWT_SECRET`, `UNIVERSITY_SALT`, `BACKEND_ISSUER_PRIVATE_KEY` (or `RELAYER_PRIVATE_KEY`), contract addresses, `PERSONALIZATION_SECRET`, `OPENAI_API_KEY` optional.
