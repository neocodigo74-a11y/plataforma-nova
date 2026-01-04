"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserPlus, MessageCircle } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSelectContent: (key: string) => void; // ✅ novo prop
}

// Tipagem para as informações do usuário
type UserInfo = { nome?: string; foto_perfil?: string };

// Tipagem do usuário autenticado do Supabase
type AuthUser = { id: string; email?: string };

// Tipagem do payload Realtime
type MensagemPrivada = { destinatario_id: string };
type Notificacao = { recebido_por: string };

export default function MobileHeader({ onToggleSidebar, sidebarOpen, onSelectContent }: Props) {

  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // 🔔 Atualiza contagem de notificações
  const updateUnreadNotifications = async (user: AuthUser) => {
    if (!user) return;
    const { count } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact" })
      .eq("recebido_por", user.id)
      .eq("lido", false);
    setUnreadNotifications(count || 0);
  };

  // 💬 Atualiza contagem de mensagens
  const updateUnreadMessages = async (user: AuthUser) => {
    if (!user) return;
    const { count } = await supabase
      .from("mensagens_privadas")
      .select("*", { count: "exact" })
      .eq("destinatario_id", user.id)
      .eq("visualizado", false);
    setUnreadMessages(count || 0);
  };

  // ⚡ Inscrição Realtime
  const subscribeRealtime = (user: AuthUser) => {
    if (!user) return () => {};

    // 📩 Mensagens
    const mensagensSub = supabase
      .channel("mobile-mensagens-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensagens_privadas" },
        (payload) => {
          if (
            (payload.new as MensagemPrivada)?.destinatario_id === user.id ||
            (payload.old as MensagemPrivada)?.destinatario_id === user.id
          ) {
            updateUnreadMessages(user);
          }
        }
      )
      .subscribe();

    // 🔔 Notificações
    const notificacoesSub = supabase
      .channel("mobile-notificacoes-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes" },
        (payload) => {
          if (
            (payload.new as Notificacao)?.recebido_por === user.id ||
            (payload.old as Notificacao)?.recebido_por === user.id
          ) {
            updateUnreadNotifications(user);
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(mensagensSub);
      supabase.removeChannel(notificacoesSub);
    };
  };

  // useEffect ATUALIZADO
  useEffect(() => {
  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1️⃣ Pegar nome e foto do Google Auth, se existir
    let nome = user.user_metadata?.full_name || user.user_metadata?.name || "";
    let foto = user.user_metadata?.avatar_url || null;

    // 2️⃣ Caso não exista, buscar na tabela usuarios
    if (!nome || !foto) {
      const { data, error } = await supabase
        .from("usuarios")
        .select("nome, foto_perfil")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        if (!nome) nome = data.nome;
        if (!foto) foto = data.foto_perfil;
      }
    }

    setUserInfo({ nome, foto_perfil: foto });

    // Atualizar badges
    await updateUnreadMessages(user);
    await updateUnreadNotifications(user);

    // Iniciar escuta em tempo real
    const cleanup = subscribeRealtime(user);
    return cleanup;
  };

  fetchUserData();
}, []);


  const renderUserIcon = () => {
    if (userInfo?.foto_perfil) {
      return (
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
        >
          <img
            src={userInfo.foto_perfil}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        </button>
      );
    } else if (userInfo?.nome) {
      return (
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-full bg-black flex items-center justify-center"
        >
          <span className="text-white font-bold">
            {userInfo.nome.charAt(0).toUpperCase()}
          </span>
        </button>
      );
    } else {
      return (
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
        >
          <UserPlus size={20} />
        </button>
      );
    }
  };

  const renderBadge = (
    count: number,
    onClick: () => void,
    icon: ReactNode
  ) => {
    return (
      <button
        onClick={onClick}
        className="relative cursor-pointer hover:opacity-80 transition"
      >
        {icon}
        {count > 0 && (
          <span className="absolute -top-1 -right-1.5 h-4 w-4 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-4 py-2 border-b border-gray-200">
      {/* Esquerda: avatar / botão toggle */}
      <div>{renderUserIcon()}</div>

      {/* Centro: Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Image src="/nova.svg" alt="Logo NOVA" width={75} height={30} />
      </div>

      {/* Direita: notificações / mensagens */}
      <div className="flex items-center gap-4">
        {/* Ícone de Adicionar Usuário */}
       <button onClick={() => onSelectContent("Networking")}>
  <UserPlus size={20} className="text-gray-600" />
</button>


        {/* Ícone de Notificações com Badge */}
    {renderBadge(
  unreadNotifications,
  () => onSelectContent("Notificacoes"), // ❌ antes: router.push("/notificacoes")
  <Bell size={20} className="text-gray-600" />
)}

        {/* Ícone de Mensagens com Badge */}
        {renderBadge(
          unreadMessages,
           () => onSelectContent("Mensagens"),
          <MessageCircle size={20} className="text-gray-600" />
        )}
      </div>
    </div>
  );
}
