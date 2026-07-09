import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_CHUNK1: process.env.VITE_SUPABASE_PUBLISHABLE_KEY_CHUNK1 || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_CHUNK1,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_CHUNK2: process.env.VITE_SUPABASE_PUBLISHABLE_KEY_CHUNK2 || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_CHUNK2,
    NEXT_PUBLIC_AI_PROVIDER: process.env.VITE_AI_PROVIDER || process.env.NEXT_PUBLIC_AI_PROVIDER,
    NEXT_PUBLIC_OPENROUTER_API_KEY: process.env.VITE_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    NEXT_PUBLIC_OPENROUTER_MODEL: process.env.VITE_OPENROUTER_MODEL || process.env.NEXT_PUBLIC_OPENROUTER_MODEL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
