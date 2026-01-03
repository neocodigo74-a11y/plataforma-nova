"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import {
  LucideUser,
  LucideUsers,
  LucideSearch,
} from "lucide-react";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface ChatItem {
  tipo: "privado" | "grupo";
  contatoId?: string;
  id?: string;
  nome: string;
  foto?: string | null;
  ultimaMensagem: string;
  dataUltimaMensagem: string;
  naoLidas: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itensChat, setItensChat] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     USUÁRIO
  ========================= */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      setUserId(data.user.id);
    });
  }, []);

  /* =========================
     BUSCAR CONVERSAS
  ========================= */
  useEffect(() => {
    if (!userId) return;

    const fetchConversas = async () => {
      setLoading(true);

      const { data: mensagens } = await supabase
        .from("mensagens_privadas")
        .select("remetente_id, destinatario_id, conteudo, img_url, created_at, visualizado")
        .or(`remetente_id.eq.${userId},destinatario_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      const map = new Map<string, ChatItem>();

      mensagens?.forEach((msg) => {
        const contatoId =
          msg.remetente_id === userId
            ? msg.destinatario_id
            : msg.remetente_id;

        if (!map.has(contatoId)) {
          map.set(contatoId, {
            tipo: "privado",
            contatoId,
            nome: "",
            foto: null,
            ultimaMensagem:
              msg.conteudo || (msg.img_url ? "📷 Imagem" : ""),
            dataUltimaMensagem: msg.created_at,
            naoLidas: 0,
          });
        }

        if (msg.destinatario_id === userId && !msg.visualizado) {
          map.get(contatoId)!.naoLidas++;
        }
      });

      const { data: perfis } = await supabase
        .from("usuarios")
        .select("id, nome, foto_perfil")
        .in("id", Array.from(map.keys()));

      const conversas =
        perfis?.map((p) => ({
          ...map.get(p.id)!,
          nome: p.nome,
          foto: p.foto_perfil,
        })) || [];

      setItensChat(
        conversas.sort(
          (a, b) =>
            new Date(b.dataUltimaMensagem).getTime() -
            new Date(a.dataUltimaMensagem).getTime()
        )
      );

      setLoading(false);
    };

    fetchConversas();
  }, [userId]);

  /* =========================
     FILTRO
  ========================= */
  const conversasFiltradas = useMemo(() => {
    if (!searchQuery) return itensChat;
    const q = searchQuery.toLowerCase();
    return itensChat.filter(
      (i) =>
        i.nome.toLowerCase().includes(q) ||
        i.ultimaMensagem.toLowerCase().includes(q)
    );
  }, [searchQuery, itensChat]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );

  /* =========================
     RENDER
  ========================= */
  return (
    <div className=" w-full  py-9">
      {/* BUSCA */}
      <div className="mb-4 flex items-center rounded-full bg-gray-100 p-2">
        <LucideSearch className="mr-2 h-5 w-5 text-gray-400" />
        <input
          className="flex-1 bg-transparent outline-none"
          placeholder="Buscar conversa"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LISTA */}
    <ul className="divide-y divide-gray-200">
        {conversasFiltradas.map((item) => (
          <li
            key={item.contatoId}
            onClick={() => router.push(`/chat/${item.contatoId}`)}
            className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer"
          >
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
              {item.foto ? (
                <img
                  src={item.foto}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <LucideUser />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.nome}</p>
              <p
                className={`truncate text-sm ${
                  item.naoLidas ? "font-bold text-gray-800" : "text-gray-500"
                }`}
              >
                {item.ultimaMensagem}
              </p>
            </div>

            <div className="ml-2 text-right text-xs text-gray-400">
              {dayjs(item.dataUltimaMensagem).fromNow(true)}
              {item.naoLidas > 0 && (
                <div className="mt-1 rounded-full bg-gray-800 px-2 text-white">
                  {item.naoLidas}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>



      
    </div>
  );
}
