"use client";

import { useEffect, useState } from "react";
import { Share2, PlusSquare, X } from "lucide-react";

export default function PwaInstallBannerIOS() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;

    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const isStandalone =
      (window.navigator as any).standalone === true;

    const dismissed = localStorage.getItem("nova-ios-install-dismissed");

    if (isIOS && isSafari && !isStandalone && !dismissed) {
      setVisible(true);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem("nova-ios-install-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2">
      <div className="rounded-2xl bg-nova-dark border border-white/10 p-4 shadow-nova">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nova-red text-white">
            <Share2 size={20} />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              Adicionar o NOVA
            </h3>

            <p className="mt-1 text-xs text-nova-muted">
              Para instalar o NOVA no seu iPhone:
            </p>

            <ol className="mt-2 space-y-1 text-xs text-white/90">
              <li className="flex items-center gap-2">
                <Share2 size={14} /> Toque em <b>Partilhar</b>
              </li>
              <li className="flex items-center gap-2">
                <PlusSquare size={14} /> Escolha <b>Adicionar à Tela de Início</b>
              </li>
            </ol>
          </div>

          {/* Close */}
          <button
            onClick={closeBanner}
            className="text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
