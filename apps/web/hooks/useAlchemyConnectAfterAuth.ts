"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { useAccount, useAuthModal, useSignerStatus } from "@account-kit/react";
import { api } from "@/lib/api";
import { isAlchemyEmbeddedEmailEnabled } from "@/lib/account-kit-config";

type Phase = "idle" | "wallet";

/**
 * After backend JWT auth succeeds, completes Alchemy email signer + Light Account,
 * POSTs /v1/me/wallet, then navigates. Alchemy persists the signer session in the
 * browser (see account-kit-config sessionConfig).
 */
export function useAlchemyConnectAfterAuth(successPath: string) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { address } = useAccount({ type: "LightAccount" });

  const [phase, setPhase] = useState<Phase>("idle");
  const [walletErr, setWalletErr] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkRetry, setLinkRetry] = useState(0);

  const modalOpenedRef = useRef(false);

  const reopenAlchemy = useCallback(() => {
    modalOpenedRef.current = false;
    openAuthModal();
    modalOpenedRef.current = true;
  }, [openAuthModal]);

  useEffect(() => {
    if (phase !== "wallet") return;
    if (!isAlchemyEmbeddedEmailEnabled()) return;
    if (signerStatus.isConnected || signerStatus.isAuthenticating || signerStatus.isInitializing) return;
    if (modalOpenedRef.current) return;
    modalOpenedRef.current = true;
    openAuthModal();
  }, [phase, signerStatus.isConnected, signerStatus.isAuthenticating, signerStatus.isInitializing, openAuthModal]);

  useEffect(() => {
    if (phase !== "wallet") return;
    if (!isAlchemyEmbeddedEmailEnabled()) return;
    const smart = address ? String(address) : "";
    if (!smart || !isAddress(smart)) return;

    let cancelled = false;
    setIsLinking(true);
    setWalletErr(null);

    void (async () => {
      try {
        await api("/v1/me/wallet", {
          method: "POST",
          body: JSON.stringify({ smartAccountAddress: smart }),
        });
        if (cancelled) return;
        setPhase("idle");
        modalOpenedRef.current = false;
        router.push(successPath);
      } catch (x) {
        if (!cancelled) setWalletErr(x instanceof Error ? x.message : "Could not save wallet");
      } finally {
        if (!cancelled) setIsLinking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, address, linkRetry, router, successPath]);

  const beginWalletStep = useCallback(() => {
    setWalletErr(null);
    setLinkRetry(0);
    modalOpenedRef.current = false;
    setPhase("wallet");
  }, []);

  const retryLink = useCallback(() => {
    setWalletErr(null);
    setLinkRetry((n) => n + 1);
  }, []);

  return {
    phase,
    beginWalletStep,
    walletErr,
    isLinking,
    reopenAlchemy,
    retryLink,
    hasAlchemy: isAlchemyEmbeddedEmailEnabled(),
  };
}
