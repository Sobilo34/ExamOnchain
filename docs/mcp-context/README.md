# MCP context for FUT ExamOnchain

Cursor MCP: point `@modelcontextprotocol/server-filesystem` at this directory (see repo `.cursor/mcp.json`).

Read order: `00-overview.md` → `01-data-model.md` → `02-api-outline.md` → `03-contracts.md` → `04-identity-aa.md` → `05-exam-personalization.md` → `06-threat-model.md` → `07-frontend-ui.md` → `08-roadmap.md`.

## Product identity

- App name: `FUT ExamOnchain`
- Institution: `Federal University of Technology, Minna (FUTMINNA)`
- Chain: Ethereum `Sepolia` for MVP contracts, AA, and score anchoring
- AI provider: `OpenRouter` only for question extraction and exam authoring
- Default explorer: `Blockscout` for transaction and anchor verification links

## Non-negotiable design rules

- Never write raw student PII on-chain.
- Keep AI extraction, personalization, and scoring off-chain; anchor hashes, commitments, and verification events on-chain.
- Prefer deterministic data shapes and auditable hashes over opaque freeform payloads.
- Use FUTMINNA branding in visible UI copy, but keep the app identity as `FUT ExamOnchain`.

## Build phases

1. Foundation and brand system.
2. Identity, account abstraction, and onboarding.
3. Lecturer authoring, materials, and OpenRouter extraction.
4. Exam runtime, autosave, and scoring.
5. On-chain anchoring, records, and Blockscout verification.
6. UI polish, accessibility, and mobile responsiveness.
7. Security hardening, deployment, and launch validation.
