import "./globals.css";

export const metadata = {
  title: "NOVA",
  description: "Plataforma NOVA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
