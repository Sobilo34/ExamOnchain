# Identity & Alchemy Account Abstraction

## Student flow

1. Student logs in via web (email + student ID in MVP).
2. Student connects **Alchemy Account Kit** in browser → obtains **smart account address**.
3. Client calls `POST /v1/me/wallet` with that address; API stores on `User.smartAccountAddress`.

## On-chain identity

- **Wallet address** is the public on-chain identifier for the student’s smart account.
- **Scores** are anchored using `studentCommitment` derived from **institutional studentId** + salt (not from wallet), so records align with university ID even if wallet changes — document this tradeoff: linking wallet is for UX; commitment is canonical for score rows.

## Environment (web)

- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID` (if using gas manager)
- `NEXT_PUBLIC_CHAIN_ID=11155111` (Sepolia)

## PII rule

Never put email or plaintext `studentId` on-chain. Use commitments only.
