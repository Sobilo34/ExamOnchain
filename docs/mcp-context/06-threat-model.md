# Threat model (MVP, honest scope)

## Mitigations

- **Score tampering:** Backend relayer writes anchors; students cannot call `recordScore`.
- **Answer key leak:** Server strips `correctIndex` from personalized payload; grading uses server-side copy.
- **Clock / window:** Enforced server-side with `opensAt` / `closesAt` / `durationMinutes`.

## Limitations

- **Impersonation:** Email + student ID without SSO/MFA is weak; production should use institutional SSO.
- **Cheating:** No proctoring; personalization reduces identical papers, does not prevent collaboration.
- **AI grading:** Appeal process not automated; store rubric + model version in DB for audit (future).

## Sessions

JWT in httpOnly cookie or `Authorization: Bearer` for MVP.
