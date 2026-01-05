"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserPlus, MessageCircle } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Props {
  onSelectContent: (key: string) => void; // mesma função da Mobile
}

interface MensagemPayload {
  new?: { destinatario_id: string };
  old?: { destinatario_id: string };
}

interface NotificacaoPayload {
  new?: { recebido_por: string };
  old?: { recebido_por: string };
}

export default function DesktopHeader({ onSelectContent }: Props) {
  const router = useRouter();
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

  // Badge helper
  const renderBadge = (count: number, onClick: () => void, icon: ReactNode) => (
    <button
      onClick={onClick}
      className="relative cursor-pointer hover:opacity-80 transition"
      style={{ padding: "4px" }}
    >
      {icon}
      {count > 0 && (
        <span className="absolute -top-0 -right-0 h-4 w-4 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );

  // useEffect: carregar usuário e inscrever Realtime
  useEffect(() => {
    let messagesSubscription: any = null;
    let notificationsSubscription: any = null;

    const fetchUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setUser(currentUser);
      await updateUnreadMessages(currentUser);
      await updateUnreadNotifications(currentUser);

      // Mensagens Realtime
      messagesSubscription = supabase
        .channel("desktop-mensagens-listener")
        .on(
          "postgres_changes" as any,
          { event: "*", schema: "public", table: "mensagens_privadas" } as any,
          (payload: MensagemPayload) => {
            const destinatarioId = payload.new?.destinatario_id || payload.old?.destinatario_id;
            if (destinatarioId === currentUser.id) updateUnreadMessages(currentUser);
          }
        )
        .subscribe();

      // Notificações Realtime
      notificationsSubscription = supabase
        .channel("desktop-notificacoes-listener")
        .on(
          "postgres_changes" as any,
          { event: "*", schema: "public", table: "notificacoes" } as any,
          (payload: NotificacaoPayload) => {
            const recebidoPor = payload.new?.recebido_por || payload.old?.recebido_por;
            if (recebidoPor === currentUser.id) updateUnreadNotifications(currentUser);
          }
        )
        .subscribe();
    };

    fetchUserData();

    return () => {
      if (messagesSubscription) supabase.removeChannel(messagesSubscription);
      if (notificationsSubscription) supabase.removeChannel(notificationsSubscription);
    };
  }, []);

  return (
    <header className="hidden md:grid fixed top-0 left-64 right-0 h-[50px] bg-white border-b border-zinc-200 z-20 grid-cols-3 items-center px-6">
      {/* Coluna esquerda */}
      <div />

      {/* Coluna central – logo */}
      <div className="flex justify-center">
        <Image src="/nova.svg" alt="Logo NOVA" width={70} height={22} priority />
      </div>

      {/* Coluna direita – ícones e badges */}
      <div className="flex justify-end items-center gap-5">
        {/* Adicionar usuário */}
        <button onClick={() => onSelectContent("Networking")}>
          <UserPlus size={20} className="text-gray-600 hover:text-gray-900 transition" />
        </button>

        {/* Mensagens */}
        {renderBadge(
          unreadMessages,
          () => onSelectContent("Mensagens"),
          <MessageCircle size={20} className="text-gray-600 hover:text-gray-900 transition" />
        )}

        {/* Notificações */}
        {renderBadge(
          unreadNotifications,
          () => onSelectContent("Notificacoes"),
          <Bell size={20} className="text-gray-600 hover:text-gray-900 transition" />
        )}
      </div>
    </header>
  );
}
