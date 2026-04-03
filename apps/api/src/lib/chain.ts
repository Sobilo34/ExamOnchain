import { Contract, JsonRpcProvider, Wallet, keccak256, solidityPacked, toUtf8Bytes } from "ethers";

export function getRelayerAddress(): string | null {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  if (!pk) return null;
  try {
    return new Wallet(pk).address;
  } catch {
    return null;
  }
}

const SCORE_ANCHOR_ABI = [
  "function recordScore(bytes32 examKey, bytes32 studentCommitment, bytes32 scoreHash, bytes32 metadataHash) external",
  "function hashScorePayload(uint256 attemptId, uint256 scorePercent, uint256 version) view returns (bytes32)",
];

const EXAM_REGISTRY_ABI = [
  "function createExam(bytes32 examKey, bytes32 contentHash, uint64 opensAt, uint64 closesAt, address lecturer) external",
  "function setPublished(bytes32 examKey, bool published) external",
];

export function computeStudentCommitment(universitySalt: string, studentId: string): string {
  return keccak256(solidityPacked(["string", "string"], [universitySalt, studentId]));
}

export function computeExamKey(relayerAddress: string, examInternalId: number): string {
  return keccak256(solidityPacked(["address", "uint256"], [relayerAddress, BigInt(examInternalId)]));
}

export function computeScoreHash(attemptId: number, scorePercent: number, version: bigint = 1n): string {
  return keccak256(solidityPacked(["uint256", "uint256", "uint256"], [BigInt(attemptId), BigInt(scorePercent), version]));
}

export function computeMetadataHash(parts: { attemptId: number; examId: number }): string {
  return keccak256(toUtf8Bytes(JSON.stringify(parts)));
}

export function computeContentHash(examId: number, questionIds: number[]): string {
  return keccak256(toUtf8Bytes(JSON.stringify({ examId, questionIds })));
}

export async function anchorScoreOnChain(params: {
  examKey: string;
  studentCommitment: string;
  scoreHash: string;
  metadataHash: string;
}): Promise<string> {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  const anchorAddr = process.env.SCORE_ANCHOR_ADDRESS;
  const rpc = process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
  if (!pk || !anchorAddr) throw new Error("Chain not configured");

  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(pk, provider);
  const c = new Contract(anchorAddr, SCORE_ANCHOR_ABI, wallet);
  const tx = await c.recordScore(params.examKey, params.studentCommitment, params.scoreHash, params.metadataHash);
  const rec = await tx.wait();
  return rec.hash as string;
}

export async function registerExamOnChain(params: {
  examKey: string;
  contentHash: string;
  opensAt: number;
  closesAt: number;
  lecturer: string;
}): Promise<string | null> {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  const regAddr = process.env.EXAM_REGISTRY_ADDRESS;
  const rpc = process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
  if (!pk || !regAddr) return null;

  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(pk, provider);
  const c = new Contract(regAddr, EXAM_REGISTRY_ABI, wallet);
  const tx = await c.createExam(params.examKey, params.contentHash, params.opensAt, params.closesAt, params.lecturer);
  const rec = await tx.wait();
  return rec.hash as string;
}

export async function publishExamOnChain(examKey: string, published: boolean): Promise<string | null> {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  const regAddr = process.env.EXAM_REGISTRY_ADDRESS;
  const rpc = process.env.RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
  if (!pk || !regAddr) return null;

  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(pk, provider);
  const c = new Contract(regAddr, EXAM_REGISTRY_ABI, wallet);
  const tx = await c.setPublished(examKey, published);
  const rec = await tx.wait();
  return rec.hash as string;
}
