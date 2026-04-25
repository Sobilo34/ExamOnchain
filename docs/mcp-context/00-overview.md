# FUT ExamOnchain — Overview

## Goals

- Decentralized assessment: **tamper-evident score anchoring** on Ethereum **Sepolia**; **Alchemy Account Abstraction** for student smart accounts.
- Institution brand: **Federal University of Technology, Minna (FUTMINNA)**.
- Product name: **FUT ExamOnchain**.
- **Hybrid architecture:** AI question extraction, personalization, and scoring run **off-chain**; chain stores **hashes, commitments, and anchor events** — not raw PII or full LLM traces.

## Monorepo layout

- `apps/web` — Next.js App Router, Alchemy Account Kit, lecturer + student UI.
- `apps/api` — HTTP API (Fastify), Postgres (Prisma), IPFS-ready uploads, chain relayer.
- `contracts` — Foundry, `ExamRegistry` + `ScoreAnchor`.
- `docs/mcp-context` — This folder (MCP-readable specs).

## On-chain vs off-chain (summary)

| Concern                                            | Location                         |
| -------------------------------------------------- | -------------------------------- |
| Scores / audit trail                               | On-chain anchors (`ScoreAnchor`) |
| Exam metadata (optional)                           | `ExamRegistry`                   |
| Roster, email, sessions, schedules (authoritative) | Postgres                         |
| Handouts / large blobs                             | IPFS CID + DB metadata           |
| AI extraction & grading                            | API + optional `OPENAI_API_KEY`  |

## Network

- **Sepolia** only for MVP contracts and AA testing.
- **Blockscout** is the preferred explorer for transaction and verification links when available.
