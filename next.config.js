/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Electron production build
  output: process.env.ELECTRON_BUILD ? "export" : undefined,
  images: { unoptimized: true },

  // So Next.js asset paths work from file:// in Electron
  assetPrefix: process.env.ELECTRON_BUILD ? "./" : "",
  trailingSlash: true,
};

module.exports = nextConfig;
