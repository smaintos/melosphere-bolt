/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppression de output: 'export' pour permettre les routes dynamiques sans generateStaticParams
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Désactiver la minification pour éviter les erreurs de syntaxe
  webpack: (config, { dev, isServer }) => {
    // Désactiver la minification même en production
    if (!dev) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

module.exports = nextConfig;
