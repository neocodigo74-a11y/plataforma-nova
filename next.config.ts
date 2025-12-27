import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Configuração para permitir domínios externos no componente <Image> do Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ugmljqbymgryswfbeyon.supabase.co',
        port: '',
        // O pathname é importante para restringir apenas à área de arquivos públicos do storage
        pathname: '/storage/v1/object/public/**', 
      },
      // NOVO DOMÍNIO ADICIONADO: Wikimedia
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        // Este caminho permite todas as imagens hospedadas pelo Wikimedia
        pathname: '/wikipedia/commons/**', 
      },
      // Adicione outros domínios de imagem aqui, se necessário
    ],
  },
  /* outras opções de config aqui */
};

export default nextConfig;