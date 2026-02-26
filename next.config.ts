import type { NextConfig } from "next";

// For GitHub project pages: username.github.io/body-comp
// Use "" for custom domain or user site
const basePath = process.env.BASE_PATH ?? "/body-comp";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
