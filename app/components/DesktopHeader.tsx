"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MessageCircle, Bell } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // Importar o tipo User do Supabase

export default function DesktopHeader() {
  const router = useRouter();
  
  // ESTADOS NECESSÁRIOS
  const [user, setUser] = useState<User | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // 🔔 Atualiza contagem de notificações
  const updateUnreadNotifications = async (user: User) => {
    if (!user) return;
    const { count } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact" })
      .eq("recebido_por", user.id)
      .eq("lido", false);
    setUnreadNotifications(count || 0);
  };

  // 💬 Atualiza contagem de mensagens
  const updateUnreadMessages = async (user: User) => {
    if (!user) return;
    const { count } = await supabase
      .from("mensagens_privadas")
      .select("*", { count: "exact" })
      .eq("destinatario_id", user.id)
      .eq("visualizado", false);
    setUnreadMessages(count || 0);
  };

  // ⚡ Inscrição Realtime
  const subscribeRealtime = (user: User) => {
    if (!user) return () => {};

    // 📩 Mensagens
    const mensagensSub = supabase
      .channel("desktop-mensagens-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensagens_privadas" },
        (payload) => {
          if (
            payload.new?.destinatario_id === user.id ||
            payload.old?.destinatario_id === user.id
          ) {
            updateUnreadMessages(user);
          }
        }
      )
      .subscribe();

    // 🔔 Notificações
    const notificacoesSub = supabase
      .channel("desktop-notificacoes-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes" },
        (payload) => {
          if (
            payload.new?.recebido_por === user.id ||
            payload.old?.recebido_por === user.id
          ) {
            updateUnreadNotifications(user);
          }
        }
      )
      .subscribe();

    // Cleanup — remove listeners ao desmontar
    return () => {
      supabase.removeChannel(mensagensSub);
      supabase.removeChannel(notificacoesSub);
    };
  };

  // LÓGICA DE CARREGAMENTO E REALTIME NO useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      
      setUser(currentUser);

      if (currentUser) {
        // Não precisamos de foto/nome aqui, apenas do user.id

        // BUSCAR CONTAGEM INICIAL
        await updateUnreadMessages(currentUser);
        await updateUnreadNotifications(currentUser);

        // Iniciar escuta em tempo real e obter a função de cleanup
        const cleanup = subscribeRealtime(currentUser);
        return cleanup; // O useEffect retornará esta função de cleanup
      }
    };

    fetchUserData();
  }, []); // [] garante que roda apenas na montagem

  // Componente Reutilizável para o Badge
  const renderBadge = (count: number, onClick: () => void, icon: ReactNode) => {
    return (
        <button 
            onClick={onClick} 
            className="relative cursor-pointer hover:opacity-80 transition"
            // Adicionado um padding extra para garantir que o badge não seja cortado
            style={{ padding: '4px' }} 
        >
            {icon}
            {count > 0 && (
                <span className="absolute -top-0 -right-0 h-4 w-4 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </button>
    );
  }

  return (
    <header className="hidden md:grid fixed top-0 left-64 right-0 h-[50px] bg-white border-b border-zinc-200 z-20 grid-cols-3 items-center px-6">
      
      {/* Coluna esquerda (vazia) */}
      <div />

      {/* Coluna centro – LOGO CENTRAL REAL */}
      <div className="flex justify-center">
        <Image
          src="/nova.svg"
          alt="Logo NOVA"
          width={70}
          height={22}
          priority
        />
      </div>

      {/* Coluna direita – ÍCONES E BADGES */}
      <div className="flex justify-end items-center gap-5">
        
        {/* Ícone de Adicionar Usuário (Mantido) */}
        <button onClick={() => router.push("/usuarios")}>
          <UserPlus size={20} className="text-gray-600 hover:text-gray-900 transition" />
        </button>

   
        {/* Ícone de Mensagens com Badge */}
        {renderBadge(
            unreadMessages, 
            () => router.push("/mensagens"), 
            <MessageCircle size={20} className="text-gray-600 hover:text-gray-900 transition" />
        )}
      </div>
    </header>
  );
}