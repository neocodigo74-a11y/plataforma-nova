"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import SiteContent from "./SiteContent";
import AppContent from "./AppContent";

export default function AuthCheck() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar a sessão atual
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    fetchUser();

    // Inscrever para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enquanto carrega a sessão
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 text-white">
        Carregando...
      </div>
    );
  }

  // Exibir conteúdo baseado no usuário autenticado
  return user ? <AppContent /> : <SiteContent />;
}
