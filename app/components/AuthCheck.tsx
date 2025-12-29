"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

import SiteContent from "./SiteContent";
import AppContent from "./AppContent";

export default function AuthCheck() {
  const [user, setUser] = useState<any>(null);
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState("");
  const [glitch, setGlitch] = useState(false);
  
  // Ref para acompanhar a fase dentro de intervalos sem disparar re-renders
  const phaseRef = useRef(0);

  useEffect(() => {
    // Sincroniza a ref com o estado
    phaseRef.current = phase;

    // Intervalo de Glitch Analógico
    const glitchInterval = setInterval(() => {
      if (phaseRef.current < 3) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 120);
      }
    }, 4500);

    const bootSequence = async () => {
      // SEQUÊNCIA DE BOOT EM PORTUGUÊS
      setMessage("INICIANDO NÚCLEO ZERO v10.0.1");
      await new Promise(r => setTimeout(r, 1500));

      setMessage("Carregando protocolos de segurança...");
      await new Promise(r => setTimeout(r, 1000));
      
      setMessage("Sincronizando base de dados distribuída...");
      await new Promise(r => setTimeout(r, 1200));

      setPhase(1);
      setMessage("Validando credenciais de acesso...");
      
      // Busca real de sessão
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      
      await new Promise(r => setTimeout(r, 2000));
      setUser(currentUser);
      setPhase(2);

      if (currentUser) {
        setMessage("ACESSO AUTORIZADO");
        setTimeout(() => setMessage(`BEM-VINDO, ${currentUser.email?.split("@")[0].toUpperCase()}`), 800);
      } else {
        setMessage("ACESSO RESTRITO");
        setTimeout(() => setMessage("USUÁRIO NÃO IDENTIFICADO"), 800);
      }

      await new Promise(r => setTimeout(r, 2500));
      setPhase(3);
    };

    bootSequence();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      clearInterval(glitchInterval);
      subscription.unsubscribe();
    };
    // Array vazio garante que o boot só ocorra uma vez e evita o erro de "size changed"
  }, []); 

  if (phase < 3) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden flex items-center justify-center font-mono">
        
        {/* FUNDO: Grade Industrial */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Efeito de Scanlines (Linhas de TV antiga) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 2px)`,
            backgroundSize: '100% 3px'
          }}
        />

        {/* Container Principal */}
        <div className={`relative z-10 w-full max-w-xl px-6 transition-transform duration-75 ${glitch ? "translate-x-[2px] skew-x-1" : ""}`}>
          
          <div className="flex items-center justify-between mb-3 text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">
            <span>Status: {phase === 2 ? "Concluído" : "Processando"}</span>
            <span className="animate-pulse">Sinal Ativo</span>
          </div>

          <div className="border border-white/10 bg-black/60 backdrop-blur-xl p-10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Logo Minimalista */}
            <h1 className="text-5xl font-black tracking-tighter text-white mb-10">
              NOVA<span className={`${phase < 3 ? "animate-pulse" : ""} opacity-50`}>_</span>
            </h1>

            {/* Terminal de Mensagens */}
            <div className="mb-14">
              <p className="text-white text-lg md:text-xl font-light tracking-wide leading-relaxed min-h-[3.5rem]">
                {message}
              </p>
            </div>

            {/* Barra de Carregamento Linear */}
            <div className="relative h-[2px] w-full bg-white/5">
              <div 
                className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 ease-in-out"
                style={{ 
                  width: phase === 0 ? "20%" : phase === 1 ? "65%" : "100%",
                  boxShadow: "0 0 20px #fff"
                }}
              />
            </div>

            {/* Rodapé Técnico */}
            <div className="mt-6 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest">
                <div className="flex gap-4">
                    <span>BR_ZONE</span>
                    <span>ENC: UTF-8</span>
                </div>
                <div className="text-white font-bold text-lg">
                    {phase === 2 ? "100" : phase === 1 ? "65" : "20"}%
                </div>
            </div>
          </div>
        </div>

        {/* Overlay de Brilho Dinâmico */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
      </div>
    );
  }

  return user ? <AppContent /> : <SiteContent />;
}