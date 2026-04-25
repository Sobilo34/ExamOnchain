export const appBrand = {
  appName: "FUT ExamOnchain",
  institutionName: "Federal University of Technology, Minna",
  institutionShortName: "FUTMINNA",
};

export const aiConfig = {
  providerName: process.env.NEXT_PUBLIC_AI_PROVIDER?.trim() || "OpenRouter",
};

const chainIdRaw = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "11155111");

export const networkConfig = {
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME?.trim() || "Sepolia",
  chainId: Number.isFinite(chainIdRaw) && chainIdRaw > 0 ? chainIdRaw : 11155111,
  explorerName: process.env.NEXT_PUBLIC_EXPLORER_NAME?.trim() || "Blockscout",
  explorerBaseUrl: process.env.NEXT_PUBLIC_EXPLORER_BASE_URL?.trim() || "https://eth-sepolia.blockscout.com",
};

export function buildExplorerTxUrl(txHash: string): string {
  return `${networkConfig.explorerBaseUrl.replace(/\/$/, "")}/tx/${txHash}`;
}

export function buildExplorerAddressUrl(address: string): string {
  return `${networkConfig.explorerBaseUrl.replace(/\/$/, "")}/address/${address}`;
}