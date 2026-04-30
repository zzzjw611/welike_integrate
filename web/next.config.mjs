/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
  webpack: (config, { isServer }) => {
    // Only apply these aliases for server-side bundles (not edge/middleware)
    if (isServer) {
      // Dynamic import to avoid Node.js built-in modules in edge runtime
      const url = new URL(import.meta.url);
      const __dirname = url.pathname.substring(0, url.pathname.lastIndexOf("/"));

      config.resolve.alias["@gtm"] = __dirname + "/../src";
      config.resolve.modules = [
        __dirname + "/node_modules",
        __dirname + "/../node_modules",
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
