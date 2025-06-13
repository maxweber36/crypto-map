/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5001',
  },
}

module.exports = nextConfig