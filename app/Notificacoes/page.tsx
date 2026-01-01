"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Bell, ArrowLeft, Users2 } from "lucide-react";

interface NotificacaoType {
  id: number;
  tipo: string;
  conteudo: string;
  lido: boolean;
  criado_em: string;
  enviado_por?: string;
  nomeRemetente?: string;
}

export default function Notificacoes() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<NotificacaoType[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    setCarregando(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      console.error("Erro ao obter sessão:", sessionError);
      setCarregando(false);
      return;
    }

    setUser(session.user);

    const { data: usuarioData } = await supabase
      .from("usuarios")
      .select("nome, foto_perfil")
      .eq("id", session.user.id)
      .single();

    setUsuarioInfo(usuarioData);

    const { data: notificacoesData, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("recebido_por", session.user.id)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao buscar notificações:", error);
      setCarregando(false);
      return;
    }

    const remetenteIds = notificacoesData
      .map((n: any) => n.enviado_por)
      .filter(Boolean);

    let remetentesMap: Record<string, string> = {};

    if (remetenteIds.length > 0) {
      const { data: remetentes } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", remetenteIds);

      // ✅ Garantindo que remetentes não seja null
      remetentesMap = Object.fromEntries(
        (remetentes ?? []).map((r: any) => [r.id, r.nome])
      );
    }

    const notificacoesComNomes = notificacoesData.map((n: any) => ({
      ...n,
      nomeRemetente: remetentesMap[n.enviado_por] || "Alguém",
    }));

    setNotificacoes(notificacoesComNomes);
    setCarregando(false);
  };

  const marcarComoLida = async (notificacaoId: number) => {
    const { error } = await supabase
      .from("notificacoes")
      .update({ lido: true })
      .eq("id", notificacaoId);

    if (error) console.error("Erro ao marcar como lida:", error);
    else await carregarNotificacoes();
  };

  const aceitarSolicitacao = async (notificacao: NotificacaoType) => {
    try {
      const { error: conexaoError } = await supabase
        .from("conexoes")
        .update({ status: "aprovado" })
        .eq("receptor", user.id)
        .eq("solicitante", notificacao.enviado_por);

      if (conexaoError) throw conexaoError;

      const { error: notificacaoError } = await supabase
        .from("notificacoes")
        .insert({
          tipo: "conexao_aprovada",
          conteudo: "Sua solicitação de conexão foi aprovada!",
          recebido_por: notificacao.enviado_por,
          enviado_por: user.id,
        });

      if (notificacaoError) throw notificacaoError;

      await marcarComoLida(notificacao.id);
    } catch (error) {
      console.error("Erro ao aceitar solicitação:", error);
    }
  };

  const recusarSolicitacao = async (notificacao: NotificacaoType) => {
    await marcarComoLida(notificacao.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white min-h-screen"
    >
      {/* Header */}
      <div className="flex py-6 items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-200 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-lg font-semibold">Notificações</h1>

        <span className="text-gray-600">
          {usuarioInfo
            ? usuarioInfo.nome
            : user?.email?.split("@")[0] || ""}
        </span>
      </div>

      {/* Loading */}
      {carregando ? (
        <div className="flex justify-center mt-10">
          <div className="loader border-4 border-t-green-500 border-gray-200 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : notificacoes.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Nenhuma notificação encontrada.
        </p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notificacoes.map((item) => {
              const mensagem =
                item.tipo === "convite_grupo"
                  ? `${item.nomeRemetente} ${item.conteudo}`
                  : item.tipo === "solicitacao_conexao"
                  ? `${item.nomeRemetente} enviou uma solicitação para você`
                  : item.conteudo;

              const icon =
                item.tipo === "convite_grupo" ? (
                  <Users2 size={22} />
                ) : item.tipo === "solicitacao_conexao" ? (
                  <UserPlus size={22} />
                ) : (
                  <Bell size={22} />
                );

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  className="flex items-start justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
                >
                  <div className="p-2 bg-gray-200 rounded-lg">{icon}</div>

                  <div className="flex-1 ml-3">
                    <p className="font-medium">{mensagem}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.criado_em).toLocaleString()}
                    </p>

                    {item.tipo === "solicitacao_conexao" && !item.lido && (
                      <div className="flex gap-2 mt-2">
                        <button
                          className="flex-1 py-1 rounded-full bg-black text-white text-sm"
                          onClick={() => aceitarSolicitacao(item)}
                        >
                          Aceitar
                        </button>
                        <button
                          className="flex-1 py-1 rounded-full bg-red-600 text-white text-sm"
                          onClick={() => recusarSolicitacao(item)}
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>

                  {!item.lido && item.tipo !== "solicitacao_conexao" && (
                    <button
                      onClick={() => marcarComoLida(item.id)}
                      className="self-start bg-green-600 text-white text-xs px-2 py-1 rounded-lg"
                    >
                      Ler
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
