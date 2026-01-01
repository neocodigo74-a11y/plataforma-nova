"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import SiteContent from "./SiteContent";
import AppContent from "./AppContent";

export default function AuthCheck() {
  const [user, setUser] = useState<any>(null);
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const bootSequence = async () => {
      setMessage("Iniciando sistema...");
      await new Promise((r) => setTimeout(r, 1200));

      setMessage("Verificando segurança...");
      await new Promise((r) => setTimeout(r, 1000));

      setMessage("Sincronizando dados...");
      await new Promise((r) => setTimeout(r, 1200));

      setPhase(1);
      setMessage("Validando sessão...");

      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;

      await new Promise((r) => setTimeout(r, 1500));
      setUser(currentUser);
      setPhase(2);

      if (currentUser) {
        setMessage(`Bem-vindo, ${currentUser.email?.split("@")[0]}`);
      } else {
        setMessage("Usuário não autenticado");
      }

      await new Promise((r) => setTimeout(r, 1200));
      setPhase(3);
    };

    bootSequence();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     LOADING / PROGRESS
  ===================================================== */
  if (phase < 3) {
    const progress =
      phase === 0 ? 25 : phase === 1 ? 60 : 90;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="w-full max-w-md px-6">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-xl">
            
            {/* Logo */}
            <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
              NOVA
            </h1>

            {/* Mensagem */}
            <p className="text-zinc-300 text-base mb-6 min-h-[24px] transition-all">
              {message}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentual */}
            <div className="mt-3 text-right text-xs text-zinc-400">
              {progress}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     APP / SITE
  ===================================================== */
  return user ? <AppContent /> : <SiteContent />;
}
