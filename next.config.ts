// next.config.js
// Next.js configuration with CSP for Clerk telemetry.

module.exports = {
  transpilePackages: ["@tremor/react"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev https://api.clerk.com https://clerk-telemetry.com",
              "img-src 'self' data: https://img.clerk.com",
              "font-src 'self'",
              "frame-src 'self' https://clerk.com https://*.clerk.com https://challenges.cloudflare.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// /**
//  * Next.js configuration file for Client Tracker.
//  * Configures Content Security Policy (CSP) headers to mitigate XSS attacks while allowing trusted external scripts and workers.
//  * Why: Enhances security by restricting script, worker, and connection sources to trusted origins (localhost, Clerk, Supabase).
//  * How: Defines async headers function to apply CSP to all routes, including Clerk's auth scripts and Web Workers.
//  */
// const nextConfig = {
//   headers: async () => [
//     {
//       source: "/(.*)",
//       headers: [
//         {
//           key: "Content-Security-Policy",
//           value: [
//             "default-src 'self'",
//             "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev",
//             "worker-src 'self' blob:",
//             "style-src 'self' 'unsafe-inline'",
//             "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev",
//             "img-src 'self' data:",
//             "font-src 'self'",
//           ].join("; "),
//         },
//       ],
//     },
//   ],
// };

// // next.config.ts
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // For Turbopack compatibility
//   transpilePackages: ["@tremor/react"],

//   // Security headers (Turbopack compatible)
//   headers: async () => {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           {
//             key: "Content-Security-Policy",
//             value: [
//               // Core security policies
//               "default-src 'self'",
//               "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://challenges.cloudflare.com",
//               "worker-src 'self' blob:",
//               "style-src 'self' 'unsafe-inline'",
//               "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev https://api.clerk.com",
//               "img-src 'self' data: https://img.clerk.com",
//               "font-src 'self'",
//               // Additional security headers
//               "frame-src 'self' https://clerk.com https://*.clerk.com https://challenges.cloudflare.com",
//               "base-uri 'self'",
//               "form-action 'self'",
//               "frame-ancestors 'none'",
//             ].join("; "),
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;
