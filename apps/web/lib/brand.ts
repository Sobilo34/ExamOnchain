export const appBrand = {
  appName: "FUT ExamOnchain",
  institutionName: "Federal University of Technology, Minna",
  institutionShortName: "FUTMINNA",
  explorerName: "Blockscout",
  explorerBaseUrl: process.env.NEXT_PUBLIC_EXPLORER_BASE_URL?.trim() || "https://eth-sepolia.blockscout.com",
};

export function buildExplorerTxUrl(txHash: string): string {
  return `${appBrand.explorerBaseUrl.replace(/\/$/, "")}/tx/${txHash}`;
}