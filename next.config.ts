// next.config.js

import type { NextConfig } from "next";
// 1. Importar o withPWA
const withPWA = require("@imbios/next-pwa")({
  dest: "public", // O Service Worker será gerado em public/sw.js
  // Desativa o PWA no modo de desenvolvimento para evitar problemas de cache
  disable: process.env.NODE_ENV === "development", 
  register: true, // Registra o Service Worker automaticamente
  skipWaiting: true, // Garante que o novo Service Worker substitua o antigo mais rapidamente
  
  // Opcional: Estratégias de Cache
  // Adicionar regras de cache para melhorar o desempenho offline/velocidade
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'nova-api-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 1 dia
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'nova-image-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
        },
      },
    },
  ],
});


const nextConfig: NextConfig = {
  // Sua configuração original de imagens permanece aqui
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ugmljqbymgryswfbeyon.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
    ],
  },
};

// 2. Exportar o NextConfig com o wrapper do PWA
export default withPWA(nextConfig);