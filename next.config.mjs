/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["169.254.83.107"]
};

export default nextConfig;
