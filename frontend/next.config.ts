import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/* to the Express backend in development
  // This eliminates CORS issues entirely during local dev —
  // the browser talks to Next.js (port 3000), which forwards to Express (port 5000)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    // Strip /api prefix since the backend already has it
    const backendBase = apiUrl.replace(/\/api$/, "");
    return [
      {
        source: "/proxy/:path*",
        destination: `${backendBase}/:path*`,
      },
    ];
  },

  // Silence noisy hydration warnings from browser extensions
  reactStrictMode: true,

  // Optimise images from any origin (useful for doctor/patient avatars later)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;