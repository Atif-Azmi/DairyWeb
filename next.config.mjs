// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com; frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com; img-src 'self' data: https: https://*.razorpay.com https://checkout.razorpay.com; connect-src 'self' https: wss: https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com; font-src 'self' data: https://fonts.gstatic.com;" },
        ],
      },
    ];
  },
};

export default nextConfig;
