import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-01.daraz.com.np",
      },
      {
        protocol: "https",
        hostname: "img.drz.lazcdn.com",
      },
      {
        protocol: "https",
        hostname: "np-live-21.slatic.net",
      },
      {
        protocol: "https",
        hostname: "static-01.slatic.net",
      },
      {
        protocol: "https",
        hostname: "sg-live-01.slatic.net",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5050",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    dangerouslyAllowLocalIP: true,
    qualities: [75, 90],
  },
};

export default nextConfig;
