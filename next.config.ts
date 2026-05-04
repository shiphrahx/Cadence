import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // Next.js inline scripts + Supabase auth redirects
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Supabase API + Edge Functions + Google Fonts + self
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
  // Google Fonts stylesheet
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Google Fonts font files
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self, data URIs (avatars), Google user photos
  "img-src 'self' data: https://lh3.googleusercontent.com https://*.googleusercontent.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
