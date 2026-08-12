import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/trending",
        destination: "/seguindo",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
