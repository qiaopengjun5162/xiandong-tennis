import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"
const basePath = isProd ? "/xiandong-tennis" : ""

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
