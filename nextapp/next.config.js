/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "img.icons8.com",
      "encrypted-tbn0.gstatic.com",
      "avatars.githubusercontent.com",
      "media.discordapp.net",
    ],
  },
};

module.exports = nextConfig;
