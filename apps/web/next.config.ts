import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  /** Local dev: browser calls same-origin `/api/*` which Next rewrites to Fastify.
   *  This avoids CORS and common `localhost` vs `127.0.0.1` fetch failures.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/:path*` }];
  },
  // Account Kit uses shared client packages; transpiling avoids build-time edge cases.
  transpilePackages: ["@account-kit/react", "@account-kit/core", "@account-kit/infra"],
};

export default nextConfig;
