import "./globals.css";

export const metadata = {
  title: "NOVA",
  description: "Plataforma NOVA",
  manifest: "/manifest.json",
  themeColor: "#ffffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        {/* Manifest e cores */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffffff" />

        {/* iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="NOVA" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        {children}

        {/* Botão PWA fixo no canto inferior direito */}
        <div id="pwa-install-button-container" />
      </body>
    </html>
  );
}
