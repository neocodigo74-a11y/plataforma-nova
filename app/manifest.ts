export default function manifest() {
  return {
    name: "NOVA Platform",
    short_name: "NOVA",
    description: "Academia e networking digital",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
   icons: [
  {
    src: "/favicon-96x96.png",
    sizes: "96x96",
    type: "image/png",
  },
  {
    src: "/web-app-manifest-192x192.png", // Nome exato do seu arquivo
    sizes: "192x192",
    type: "image/png",
    purpose: "maskable", // Ajuda a preencher o ícone no Android
  },
  {
    src: "/web-app-manifest-512x512.png", // Nome exato do seu arquivo
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
],
  };
}
