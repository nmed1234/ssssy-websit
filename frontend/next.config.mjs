/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

// API origin used for connect-src: allow the backend in dev, the production host in prod.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : 'http://localhost:8080';

// Storage / CDN origin for images (MinIO in dev, same domain via nginx in prod).
const storageOrigin = process.env.NEXT_PUBLIC_STORAGE_URL
  ? new URL(process.env.NEXT_PUBLIC_STORAGE_URL).origin
  : 'http://localhost:9000';

const nextConfig = {
  // Standalone output bundles Node server + dependencies so the Docker image
  // only needs to copy .next/standalone instead of the full node_modules tree.
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Local MinIO (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      // Production MinIO / S3 (hostname resolved from NEXT_PUBLIC_STORAGE_URL)
      ...(process.env.NEXT_PUBLIC_STORAGE_URL
        ? [
            {
              protocol: new URL(process.env.NEXT_PUBLIC_STORAGE_URL).protocol.replace(':', ''),
              hostname: new URL(process.env.NEXT_PUBLIC_STORAGE_URL).hostname,
              port: new URL(process.env.NEXT_PUBLIC_STORAGE_URL).port || '',
            },
          ]
        : []),
      // Railway / production app domain
      {
        protocol: 'https',
        hostname: 'ssssy-websit-production.up.railway.app',
      },
      // Main production domain
      {
        protocol: 'https',
        hostname: 'ssssyria.org',
      },
      {
        protocol: 'https',
        hostname: 'www.ssssyria.org',
      },
      // Unsplash (used by content images stored in the database)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  async headers() {
    // In production, drop unsafe-eval (only needed for Next.js HMR in dev).
    const scriptSrc = isProd
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

    // connect-src: self + backend API + WebSocket HMR (dev only) + wss for production WS
    const connectSrc = isProd
      ? `connect-src 'self' ${apiOrigin} ${storageOrigin} wss:`
      : `connect-src 'self' ${apiOrigin} ${storageOrigin} ws://localhost:3000 wss://localhost:3000 ws: wss:`;

    // img-src: storage origin + Unsplash CDN used by database content
    const imgSrc = `img-src 'self' data: blob: ${storageOrigin} ${apiOrigin} https://images.unsplash.com`;

    // style-src: allow Google Fonts stylesheets (loaded dynamically by style-theme-context.tsx)
    const styleSrc = "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com";

    // font-src: allow Google Fonts font files
    const fontSrc = "font-src 'self' data: https://fonts.gstatic.com";

    // worker-src: pdfjs-dist spawns its worker as a blob: URL.
    // script-src must also allow blob: for the same reason.
    const workerSrc = "worker-src blob: 'self'";
    const scriptSrcFinal = scriptSrc.replace(
      "script-src",
      "script-src blob:"
    );

    // frame-src: 'self' is sufficient — no cross-origin iframes are used.
    const frameSrc = "frame-src 'self'";

    return [
      // ── All routes ────────────────────────────────────────────────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrcFinal,
              styleSrc,
              imgSrc,
              fontSrc,
              connectSrc,
              frameSrc,
              workerSrc,
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Only send HSTS in production — causes issues on plain-HTTP localhost
          ...(isProd
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
