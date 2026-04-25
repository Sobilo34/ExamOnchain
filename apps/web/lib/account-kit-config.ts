import { createConfig } from "@account-kit/react";
import { alchemy, sepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";
/** Gas Manager policy from the same Alchemy app as the API key (Smart Wallets quickstart). */
const policyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID?.trim() ?? "";

export const queryClient = new QueryClient();

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

/** Sepolia + Alchemy. Set NEXT_PUBLIC_ALCHEMY_API_KEY in `.env.local`. */
export const accountKitConfig = createConfig(
  {
    transport: alchemy({ apiKey }),
    chain: sepolia,
    ...(policyId.length > 0 ? { policyId } : {}),
    // We're using App Router with client Providers; avoid SSR cookie/session edge cases.
    ssr: false,
    // Persist signer session in the browser; email OTP / magic link is for recovery & new devices.
    sessionConfig: {
      storage: "localStorage",
      sessionKey: "fut-examonchain.alchemy.signer",
      expirationTimeMs: THIRTY_DAYS_MS,
    },
  },
  {
    // Embedded email OTP / magic link (Alchemy auth modal) — disabled until dashboard verification is stable.
    // Re-enable: uncomment below and set NEXT_PUBLIC_ALCHEMY_EMBEDDED_EMAIL=true in `.env.local`.
    // auth: {
    //   sections: [[{ type: "email" }]],
    // },
  }
);

export function hasAlchemyApiKey(): boolean {
  return apiKey.length > 0 && !apiKey.startsWith("your_");
}

/**
 * When true, Account Kit opens the email sign-in modal and OTP flow.
 * Default off: use backend email/JWT only; link a smart account address manually on onboarding.
 */
export function isAlchemyEmbeddedEmailEnabled(): boolean {
  return hasAlchemyApiKey() && process.env.NEXT_PUBLIC_ALCHEMY_EMBEDDED_EMAIL === "true";
}
