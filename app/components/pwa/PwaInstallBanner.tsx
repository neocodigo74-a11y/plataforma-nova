"use client";

import { useEffect, useState } from "react";
import { Download, X, Info } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2">
      <div className="rounded-2xl border border-white/10 bg-nova-dark p-4 shadow-nova backdrop-blur">
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nova-red text-white">
            <Download size={20} />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              Instalar o NOVA
            </h3>
            <p className="mt-1 text-xs text-nova-muted">
              Leve o NOVA para o seu ecrã inicial e tenha acesso rápido,
              mesmo com internet fraca.
            </p>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={installApp}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-nova-red px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
              >
                <Download size={15} />
                Instalar
              </button>

              <a
                href="/sobre"
                className="flex items-center justify-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition"
              >
                <Info size={14} />
                Saber mais
              </a>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={() => setVisible(false)}
            className="text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
