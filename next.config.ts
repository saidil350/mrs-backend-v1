import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crm.mrs.amanahapp.run",
      },
      {
        protocol: "https",
        hostname: "media.makmurraya.co.id",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
      },
    ],
  },
};

export default nextConfig;
