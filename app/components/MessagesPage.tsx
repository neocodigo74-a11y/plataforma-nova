"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import {
  LucideUser,
  LucideSearch,
  LucideMessageCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

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

interface UserNetworking {
  id: string;
  nome: string;
  foto_perfil?: string | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itensChat, setItensChat] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de usuários com networking
  const [openModal, setOpenModal] = useState(false);
  const [networkingUsers, setNetworkingUsers] = useState<UserNetworking[]>([]);

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
        .select(
          "remetente_id, destinatario_id, conteudo, img_url, created_at, visualizado"
        )
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
     BUSCAR USUÁRIOS COM NETWORKING
  ========================= */
  const fetchNetworkingUsers = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("conexoes")
      .select("solicitante, receptor")
      .eq("status", "aprovado")
      .or(`solicitante.eq.${userId},receptor.eq.${userId}`);

    if (!data) return;

    const userIds = data.map((c: any) =>
      c.solicitante === userId ? c.receptor : c.solicitante
    );

    const { data: perfis } = await supabase
      .from("usuarios")
      .select("id, nome, foto_perfil")
      .in("id", userIds);

    setNetworkingUsers(perfis || []);
  };

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

  // Total de mensagens não lidas para exibir no botão flutuante
  const totalNaoLidas = useMemo(() => {
    return itensChat.reduce((acc, i) => acc + i.naoLidas, 0);
  }, [itensChat]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );

  return (
    <div className="w-full py-9 relative">
  


      {/* MODAL DE NETWORKING */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center text-white justify-center bg-black/70 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setOpenModal(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold mb-4">Enviar mensagem</h2>

              <ul className="divide-y divide-gray-700">
                {networkingUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-800 cursor-pointer rounded"
                    onClick={() => router.push(`/chat/${user.id}`)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden">
                      {user.foto_perfil ? (
                        <img
                          src={user.foto_perfil}
                          alt={user.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <LucideUser className="h-6 w-6 text-gray-300 m-auto" />
                      )}
                    </div>
                    <span>{user.nome}</span>
                  </li>
                ))}
                {networkingUsers.length === 0 && (
                  <p className="text-white text-sm mt-2">
                    Nenhum contato com networking .
                  </p>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
{/* BOTÃO DE NOVA MENSAGEM */}
<div className="max-w-md mx-auto mb-4">
  <button
    className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
    onClick={() => {
      fetchNetworkingUsers();
      setOpenModal(true);
    }}
  >
    <LucideMessageCircle size={20} />
    Nova Mensagem
  </button>
</div>

      {/* BUSCA */}
      <div className="mb-4 flex items-center rounded-full bg-gray-100 p-2 max-w-md mx-auto">
        <LucideSearch className="mr-2 h-5 w-5 text-gray-400" />
        <input
          className="flex-1 bg-transparent outline-none text-black"
          placeholder="Buscar conversa"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LISTA DE CONVERSAS */}
      <ul className="divide-y divide-gray-200 max-w-md mx-auto">
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
