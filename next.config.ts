import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

/** If set, `/api/v1/*` on this deployment proxies to this origin (one public URL). */
const rewriteTarget = process.env.AUDIENCE_BACKEND_REWRITE_TARGET?.replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  async rewrites() {
    if (!rewriteTarget) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${rewriteTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default withWorkflow(nextConfig);
