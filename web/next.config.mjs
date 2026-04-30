import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
  webpack: (config, { isServer }) => {
    // Alias @gtm to the root src/ directory (used by pipeline route)
    config.resolve.alias["@gtm"] = path.resolve(__dirname, "../src");
    // Ensure webpack can resolve @anthropic-ai/sdk from the root src/ files
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "../node_modules"),
      "node_modules",
    ];
    if (isServer) {
      config.resolve.extensionAlias = {
        ".js": [".ts", ".js"],
      };
    }
    return config;
  },
};

export default nextConfig;
