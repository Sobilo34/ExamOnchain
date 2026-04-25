import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@account-kit/react/styles.css";
import { Providers } from "./providers";
import { aiConfig, appBrand, networkConfig } from "@/lib/brand";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: appBrand.appName,
  description: `${appBrand.institutionShortName} decentralized assessment platform for ${aiConfig.providerName}-powered exams and ${networkConfig.chainName} score anchors`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
