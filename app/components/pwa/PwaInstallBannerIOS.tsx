"use client";

import { useEffect, useState } from "react";
import { X, ArrowUp, Share } from "lucide-react";

export default function PwaInstallBannerIOS() {
  const [visible, setVisible] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Verifica se é iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // 2. Verifica se NÃO está em modo standalone (ou seja, está no navegador)
    const isStandalone = (window.navigator as any).standalone === true;
    
    // 3. Verifica se o usuário já fechou hoje
    const dismissed = localStorage.getItem("nova-ios-install-dismissed");

    if (isIOS && !isStandalone && !dismissed) {
      setVisible(true);
      setTimeout(() => setShowBanner(true), 400);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem("nova-ios-install-dismissed", "true");
    setShowBanner(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2">
      <div
        className={`rounded-2xl bg-white p-4 shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-zinc-100 transform transition-all duration-500 ${
          showBanner ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ArrowUp size={20} className="animate-bounce" />
          </div>
          
          <h3 className="text-sm font-bold text-zinc-900">Adicionar à Tela de Início</h3>
          <p className="mt-1 text-[12px] text-zinc-500">
            Clique no ícone de <span className="font-bold inline-flex items-center gap-0.5">compartilhar <Share size={12}/></span> abaixo e depois em <strong>"Adicionar à Tela de Início"</strong>.
          </p>

          <button 
            onClick={closeBanner}
            className="mt-4 w-full py-2 text-xs font-medium text-zinc-400 border-t border-zinc-50"
          >
            Fechar
          </button>
        </div>
      </div>
      {/* Setinha apontando para o botão de compartilhar do Safari */}
      <div className="mx-auto mt-[-1px] h-3 w-3 rotate-45 bg-white border-r border-b border-zinc-100"></div>
    </div>
  );
}