/** @type {import('next').NextConfig} */

const path = require('path')

const withPWA = require('next-pwa')({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig = withPWA({
  reactStrictMode: true,
  env: {
    ServerId: process.env.ServerId,
    ServerUrl: process.env.ServerUrl
  },
})

module.exports = nextConfig
