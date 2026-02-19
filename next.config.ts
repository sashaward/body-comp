import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // For GitHub project pages: username.github.io/body-comp
  // Use basePath: "" and assetPrefix: "" for custom domain or user site
  basePath: "/body-comp",
  assetPrefix: "/body-comp/",
};

export default nextConfig;
