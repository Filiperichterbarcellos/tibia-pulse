/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Não trava o build por erros de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Não trava o build por erros de typecheck
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
