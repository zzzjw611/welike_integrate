import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
  webpack: (config, { isServer }) => {
    // Only apply these aliases for server-side bundles (not edge/middleware)
    if (isServer) {
      config.resolve.alias["@gtm"] = path.resolve(__dirname, "../src");
      config.resolve.modules = [
        path.resolve(__dirname, "node_modules"),
        path.resolve(__dirname, "../node_modules"),
        "node_modules",
      ];
      config.resolve.extensionAlias = {
        ".js": [".ts", ".js"],
      };
    }
    return config;
  },
};

export default nextConfig;
