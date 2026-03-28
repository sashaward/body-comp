import type { NextConfig } from "next";

// GitHub Pages uses /body-comp; local `next dev` uses "" so http://localhost:3000/ works.
// Override anytime: BASE_PATH=/body-comp npm run dev
const basePath =
  process.env.BASE_PATH ??
  (process.env.NODE_ENV === "development" ? "" : "/body-comp");

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
