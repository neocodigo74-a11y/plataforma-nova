"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  LucideArrowLeft,
  LucideLock,
  LucideSmile,
  LucidePaperclip,
  LucideSend,
  LucideMic,
  BadgePlus
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  conteudo: string;
  created_at: string;
  visualizado: boolean;
}

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const formatDateHeader = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Hoje";
  if (isSameDay(date, yesterday)) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  // ================= STATES =================
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [destinatario, setDestinatario] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const contatoId = params.userId as string;
  const scrollRef = useRef<HTMLDivElement>(null);

  // ================= USUÁRIO =================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace("/login");
      } else {
        setUserId(data.user.id);
        setUser({ id: data.user.id });
      }
    });
  }, [router]);

  // ================= DESTINATÁRIO =================
  useEffect(() => {
    if (!contatoId) return;

    supabase
      .from("usuarios")
      .select("nome, foto_perfil")
      .eq("id", contatoId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDestinatario(data.nome);
          setProfile(data);
        }
      });
  }, [contatoId]);

  // ================= MENSAGENS =================
  useEffect(() => {
    if (!userId || !contatoId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("mensagens_privadas")
        .select("*")
        .or(
          `and(remetente_id.eq.${userId},destinatario_id.eq.${contatoId}),and(remetente_id.eq.${contatoId},destinatario_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      if (data) setMensagens(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensagens_privadas" },
        fetchMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, contatoId]);

  // ================= SCROLL AUTOMÁTICO =================
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ================= ENVIAR MENSAGEM =================
  const handleSend = async () => {
    if (!message.trim() || !userId) return;

    await supabase.from("mensagens_privadas").insert({
      remetente_id: userId,
      destinatario_id: contatoId,
      conteudo: message,
    });

    setMessage("");
  };

  const getMessageTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ================= AGRUPAMENTO POR DATA =================
  const grouped = mensagens.reduce((acc: any, msg) => {
    const key = formatDateHeader(msg.created_at);
    acc[key] = acc[key] || [];
    acc[key].push(msg);
    return acc;
  }, {});

  // ================= RENDER =================
  return (
    <div className="flex flex-col h-screen bg-white">

      {/* HEADER FIXO */}
      <div className="sticky top-0 z-20 flex items-center px-4 py-2 border-b bg-white">
       <LucideArrowLeft
  size={24}
  className="cursor-pointer"
  onClick={() => {
    if (window.history.length > 1) router.back();
    else router.push("/mensagens"); // fallback caso entre direto
  }}
/>

        <div className="flex items-center ml-2 flex-1">
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
            {profile?.foto_perfil ? (
              <img src={profile.foto_perfil} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold">
                {destinatario?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <span className="ml-2 font-medium">{destinatario}</span>
        </div>
        <BadgePlus size={18} className="text-gray-500" />
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-4">
        {Object.keys(grouped).map(date => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="bg-gray-300 text-xs px-3 py-1 rounded-full">
                {date}
              </span>
            </div>
            <AnimatePresence>
              {grouped[date].map((msg: Message) => {
                const isSent = msg.remetente_id === userId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex mb-2 ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${isSent ? "bg-gray-800 text-white rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm"}`}>
                      <p className="text-sm break-words">{msg.conteudo}</p>
                      <div className="text-right text-[10px] mt-1 opacity-70">
                        {getMessageTime(msg.created_at)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* INPUT FIXO */}
      <div className="sticky bottom-0 z-20 flex items-center px-4 py-3 bg-white">
        <LucideSmile size={22} className="text-gray-500 mr-2" />
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 outline-none"
        />
        <div className="flex ml-2 gap-2">
          <LucidePaperclip size={22} className="text-gray-500 cursor-pointer" />
          {message.trim() ? (
            <button onClick={handleSend} className="p-2 bg-gray-700 rounded-full text-white">
              <LucideSend size={18} />
            </button>
          ) : (
            <div className="p-2 bg-gray-300 rounded-full text-white">
              <LucideMic size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
