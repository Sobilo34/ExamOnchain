import { createHash } from "node:crypto";

/** MVP: deterministic fake CID from content hash. Swap for Pinata/web3.storage in production. */
export function pinBuffer(buf: Buffer, name: string): { cid: string; hint: string } {
  const h = createHash("sha256").update(buf).digest("hex");
  return { cid: `local-${h.slice(0, 16)}`, hint: name };
}
