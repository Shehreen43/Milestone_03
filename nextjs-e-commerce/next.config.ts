import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
     images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.sanity.io",
        },
      ],
     },
};

export default nextConfig;
