"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


import MatrixRain from "@/app/components/MatrixRain";
import SiteContent from "./SiteContent";
import AppContent from "./AppContent";

export default function AuthCheck() {
  const [user, setUser] = useState<any>(null);
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState("");
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (phase < 3) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
      }
    }, 4000 + Math.random() * 6000);

    const bootSequence = async () => {
      setMessage("INICIANDO SISTEMA ZERO v9.9.9");
      await new Promise(r => setTimeout(r, 2000));

      setMessage("Carregando kernel... [OK]");
      await new Promise(r => setTimeout(r, 800));
      setMessage("Inicializando módulos gráficos...");
      await new Promise(r => setTimeout(r, 1200));
      setMessage("Conectando ao núcleo neural...");
      await new Promise(r => setTimeout(r, 1500));

      setPhase(1);
      setMessage("Escaneando autenticação biométrica...");

      await new Promise(r => setTimeout(r, 3000));

      setMessage("Verificando sessão no Supabase...");
      await new Promise(r => setTimeout(r, 2000));

      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      setPhase(2);

      if (currentUser) {
        setMessage(`ACESSO AUTORIZADO`);
        setTimeout(() => setMessage(`BEM-VINDO, ${currentUser.email?.split("@")[0].toUpperCase()}`), 1000);
      } else {
        setMessage("ACESSO NEGADO");
        setTimeout(() => setMessage("NENHUM USUÁRIO DETECTADO"), 800);
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
  }, []);

  if (phase < 3) {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden">
        {/* Matrix Rain em preto e branco puro */}
        <MatrixRain intensity="high" />

        {/* Scanlines brancas sutis */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
            animation: "scanlines 10s linear infinite"
          }}
        />

        {/* Conteúdo central - TUDO EM BRANCO PURO */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-white font-mono tracking-widest ${glitch ? "animate-glitch" : ""}`}>
          <div className="text-center space-y-8 max-w-4xl px-8">

            {/* Logo ZERO com efeito de brilho branco */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
              <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-pulse">
                ZERO
              </span>
            </h1>

            {/* Mensagem com cursor piscando */}
            <div className="text-xl md:text-3xl font-light h-12">
              <span className="inline-block animate-typing overflow-hidden border-r-4 border-white">
                {message}
              </span>
              <span className="animate-blink ml-1">_</span>
            </div>

            {/* Barra de progresso estilo terminal */}
            {phase >= 1 && (
              <div className="w-full max-w-2xl mx-auto mt-16">
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                  <div 
                    className={`h-full bg-white transition-all duration-1000 ${phase === 2 ? "w-full" : "w-3/4"}`}
                    style={{ boxShadow: "0 0 20px rgba(255,255,255,0.8)" }}
                  />
                </div>
                <p className="text-right mt-2 text-xs text-gray-500 font-mono">
                  [{phase === 2 ? (user ? "100%" : "ACCESS DENIED") : phase === 1 ? "73%" : "45%"}]
                </p>
              </div>
            )}

            {/* Resultado final */}
            {phase === 2 && (
              <div className={`mt-12 text-5xl font-bold tracking-wider ${user ? "text-white" : "text-gray-500"} animate-bounce`}>
                {user ? "ACCESS GRANTED" : "ACCESS DENIED"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return user ? <AppContent /> : <SiteContent />;
}