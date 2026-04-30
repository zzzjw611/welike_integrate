/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias["@gtm"] = false;
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js", ".jsx"],
        ".mjs": [".mts", ".mjs"],
      };
    }
    return config;
  },
};

export default nextConfig;
