"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MessageCircle, Bell } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Tipagem do payload do Realtime
interface MensagemPayload {
  new?: { destinatario_id: string };
  old?: { destinatario_id: string };
}

interface NotificacaoPayload {
  new?: { recebido_por: string };
  old?: { recebido_por: string };
}

export default function DesktopHeader() {
  const router = useRouter();

  // Estados
  const [user, setUser] = useState<User | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Atualiza contagem de notificações
  const updateUnreadNotifications = async (user: User) => {
    const { count } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact" })
      .eq("recebido_por", user.id)
      .eq("lido", false);

    setUnreadNotifications(count || 0);
  };

  // Atualiza contagem de mensagens
  const updateUnreadMessages = async (user: User) => {
    const { count } = await supabase
      .from("mensagens_privadas")
      .select("*", { count: "exact" })
      .eq("destinatario_id", user.id)
      .eq("visualizado", false);

    setUnreadMessages(count || 0);
  };

 

  // Carregamento do usuário e realtime
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        await updateUnreadMessages(currentUser);
        await updateUnreadNotifications(currentUser);

      

      }
    };

    fetchUserData();
  }, []);

  // Componente para badges
  const renderBadge = (count: number, onClick: () => void, icon: ReactNode) => {
    return (
      <button 
        onClick={onClick} 
        className="relative cursor-pointer hover:opacity-80 transition"
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
  };

  return (
    <header className="hidden md:grid fixed top-0 left-64 right-0 h-[50px] bg-white border-b border-zinc-200 z-20 grid-cols-3 items-center px-6">
      {/* Coluna esquerda */}
      <div />

      {/* Coluna central – logo */}
      <div className="flex justify-center">
        <Image
          src="/nova.svg"
          alt="Logo NOVA"
          width={70}
          height={22}
          priority
        />
      </div>

      {/* Coluna direita – ícones e badges */}
      <div className="flex justify-end items-center gap-5">
        {/* Adicionar usuário */}
        <button onClick={() => router.push("/usuarios")}>
          <UserPlus size={20} className="text-gray-600 hover:text-gray-900 transition" />
        </button>

        {/* Mensagens */}
        {renderBadge(
          unreadMessages, 
          () => router.push("/mensagens"), 
          <MessageCircle size={20} className="text-gray-600 hover:text-gray-900 transition" />
        )}

        {/* Notificações */}
        {renderBadge(
          unreadNotifications,
          () => router.push("/notificacoes"),
          <Bell size={20} className="text-gray-600 hover:text-gray-900 transition" />
        )}
      </div>
    </header>
  );
}
