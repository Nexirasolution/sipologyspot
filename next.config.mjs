/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    middlewareClientMaxBodySize: "100mb",
  },

  images: {
    // TEMPORARY: Next's image optimizer (running server-side) is timing
    // out when fetching from Cloudinary — likely a local network/firewall
    // issue, not a code bug. `unoptimized: true` skips server-side
    // resizing and serves the Cloudinary URL directly to the browser
    // instead, bypassing the timeout. Remove this once the underlying
    // network issue is resolved, since you lose Next's automatic
    // resizing/format conversion while this is on.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;