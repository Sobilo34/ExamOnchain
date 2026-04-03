# Smart contracts (Sepolia)

## ExamRegistry

- `createExam(bytes32 examKey, bytes32 contentHash, uint64 opensAt, uint64 closesAt)`
- `updateExamWindow(bytes32 examKey, uint64 opensAt, uint64 closesAt)`
- `setRosterRoot(bytes32 examKey, bytes32 rosterRoot)` (optional)
- Events: `ExamCreated`, `ExamUpdated`

## ScoreAnchor

- `recordScore(bytes32 examKey, bytes32 studentCommitment, bytes32 scoreHash, bytes32 metadataHash)`
- One submission per `(examKey, studentCommitment)` — reverts if duplicate.
- Role: `WRITER_ROLE` for relayer only.
- Events: `ScoreRecorded`

## Deployed addresses

Set in `apps/api` env after deploy:

- `EXAM_REGISTRY_ADDRESS`
- `SCORE_ANCHOR_ADDRESS`
- `RELAYER_PRIVATE_KEY` (Sepolia funded account)

## ABI

Exported from `contracts/out/` or committed as `packages/shared/abis/*.json` if needed.
