# Delivery roadmap for FUT ExamOnchain

This roadmap is the working order for the project. Build each phase so the later phases inherit the earlier contracts, data shapes, and UI conventions.

## Phase 0: Product framing and architecture freeze

- Lock the app identity as `FUT ExamOnchain` for the software product and `FUTMINNA` for the institution-facing brand.
- Freeze the stack assumptions: Next.js web app, Fastify API, Prisma/Postgres, Foundry contracts, Ethereum Sepolia, OpenRouter, and Blockscout.
- Confirm the data split: academic records and workflow state stay off-chain; only hashes, commitments, and tx references go on-chain.

Deliverables:

- Brand vocabulary
- Environment variable checklist
- System boundary map

## Phase 1: Visual identity and public shell

- Build a memorable landing page that feels like an institution-grade academic product, not a generic admin panel.
- Use the uploaded FUTMINNA logo as the core visual mark in the shell, landing hero, and login surfaces.
- Create a strong type system, layered gradients, and card surfaces that feel ceremonial but still readable.

Deliverables:

- Landing page redesign
- Shared app shell and header treatment
- Typography and color tokens

## Phase 2: Identity and account abstraction

- Finish student and lecturer onboarding around smart account linking.
- Keep Alchemy Account Kit as the wallet abstraction layer and Sepolia as the chain target.
- Ensure the institution identity is shown clearly during login, onboarding, and wallet linking.

Deliverables:

- Student and lecturer auth flow
- Smart account linking flow
- Role-aware navigation and session state

## Phase 3: Lecturer content pipeline

- Implement robust course and material management.
- Use OpenRouter for question extraction from lecture notes, pasted quizzes, and uploaded text.
- Make extraction editable so lecturers can review before publishing.

Deliverables:

- Course setup flow
- Material upload and parsing
- AI-generated draft questions with manual overrides

## Phase 4: Exam runtime and personalization

- Generate personalized assessments per student.
- Keep exam timing, autosave, and submission paths deterministic.
- Make scoring explainable enough for lecturers and students to trust the output.

Deliverables:

- Exam instructions and attempt flow
- Autosave and submission handling
- Personalized question rendering

## Phase 5: On-chain anchoring and records

- Anchor exam creation and score commitments on Sepolia.
- Replace all Etherscan-oriented links with Blockscout defaults unless the environment overrides them.
- Surface tx hashes, anchor statuses, and immutable record views in the student record pages.

Deliverables:

- ExamRegistry and ScoreAnchor integration
- Relayer-backed anchor submission
- Blockscout verification links

## Phase 6: UX polish and accessibility

- Refine spacing, hierarchy, responsive behavior, and motion.
- Make the interface feel elegant on large screens and efficient on phones.
- Add empty states, loading states, and microcopy that reduce confusion.

Deliverables:

- Responsive layout cleanup
- Empty and loading states
- Accessibility pass

## Phase 7: Security, deployment, and launch

- Validate no sensitive payloads leak to the chain, logs, or the wrong environment.
- Confirm contract addresses, env vars, and explorer links are correct for Sepolia.
- Run build and test passes before any release candidate.

Deliverables:

- Security checklist
- Deployment checklist
- Release verification report
