"use client";

import { useEffect, useState } from "react";
import { Download, X, Info } from "lucide-react";

// Estendendo o tipo para o TypeScript não reclamar
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Função para capturar o evento
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
      // Pequeno delay para a animação de entrada
      setTimeout(() => setShowBanner(true), 100);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Se o app já estiver instalado, não mostramos nada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setVisible(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      closeBanner();
    }
  };

  const closeBanner = () => {
    setShowBanner(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] w-[94%] max-w-md -translate-x-1/2">
      <div
        className={`rounded-2xl bg-zinc-950 border border-white/10 p-4 shadow-2xl transform transition-all duration-500 ease-out ${
          showBanner ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="flex gap-3">
          {/* Usei bg-blue-600 para garantir que apareça se o 'nova-red' não estiver no seu tailwind.config */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Download size={20} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">Instalar o NOVA</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
              Tenha acesso rápido à academia e networking direto da sua tela inicial.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={installApp}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Instalar Agora
              </button>
              <button
                onClick={closeBanner}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white transition"
              >
                Talvez depois
              </button>
            </div>
          </div>

          <button onClick={closeBanner} className="text-zinc-500 hover:text-white self-start">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}