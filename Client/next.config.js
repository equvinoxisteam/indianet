/** @type {import('next').NextConfig} */

const path = require('path')

const withPWA = require('next-pwa')({
  dest: "public",
  disable: process.env.NODE_ENV === 'development' || process.platform === 'win32',
})

const nextConfig = withPWA({
  reactStrictMode: true,
  devIndicators: {
    buildActivity: false,
  },
  env: {
    ServerId: process.env.ServerId,
    ServerUrl: process.env.ServerUrl
  },
  // Windows dev: webpack filesystem cache often throws UNKNOWN read / snapshot errors.
  webpack: (config, { dev }) => {
    if (dev && process.platform === 'win32') {
      config.cache = false
    }
    return config
  },
})

module.exports = nextConfig
