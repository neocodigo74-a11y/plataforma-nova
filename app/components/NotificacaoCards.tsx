"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Users,
  UserPlus,
  Check,
  X,
  MoreVertical,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Notificacao = {
  id: number;
  tipo: string;
  conteudo: string;
  criado_em: string;
  lido: boolean;
  enviado_por?: string;
  nomeRemetente?: string;
};

export default function NotificacoesCard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  /* =============================
     Carregar notificações
  ============================== */
  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    setCarregando(true);

    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (!session?.user) {
      setCarregando(false);
      return;
    }

    setUser(session.user);

    const { data: notificacoesData } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("recebido_por", session.user.id)
      .order("criado_em", { ascending: false })
      .limit(3);

    if (!notificacoesData) {
      setCarregando(false);
      return;
    }

    // Buscar nomes dos remetentes
    const remetenteIds = notificacoesData
      .map((n) => n.enviado_por)
      .filter(Boolean);

    let remetentesMap: Record<string, string> = {};

    if (remetenteIds.length) {
      const { data: remetentes } = await supabase
        .from("usuarios")
        .select("id, nome")
        .in("id", remetenteIds);

      remetentes?.forEach((r) => {
        remetentesMap[r.id] = r.nome;
      });
    }

    const formatadas = notificacoesData.map((n) => ({
      ...n,
      nomeRemetente: remetentesMap[n.enviado_por!] || "Alguém",
    }));

    setNotificacoes(formatadas);
    setCarregando(false);
  };

  /* =============================
     Ações
  ============================== */
  const marcarComoLida = async (id: number) => {
    await supabase.from("notificacoes").update({ lido: true }).eq("id", id);
    carregarNotificacoes();
  };

  const aceitarSolicitacao = async (notificacao: Notificacao) => {
    try {
      await supabase
        .from("conexoes")
        .update({ status: "aprovado" })
        .eq("receptor", user.id)
        .eq("solicitante", notificacao.enviado_por);

      await supabase.from("notificacoes").insert({
        tipo: "conexao_aprovada",
        conteudo: "Sua solicitação de conexão foi aprovada!",
        recebido_por: notificacao.enviado_por,
        enviado_por: user.id,
      });

      marcarComoLida(notificacao.id);
    } catch (e) {
      console.error(e);
    }
  };

  const recusarSolicitacao = async (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id);
  };

  /* =============================
     UI
  ============================== */
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Últimas notificações
        </h3>

        <button onClick={() => router.push("/notificacoes")}>
          <MoreVertical size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <div className="flex justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      ) : notificacoes.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-3">
          Nenhuma notificação recente.
        </p>
      ) : (
        <div className="space-y-2">
          {notificacoes.map((item) => {
            const mensagem =
              item.tipo === "convite_grupo"
                ? `${item.nomeRemetente} convidou você para ${item.conteudo}`
                : item.tipo === "solicitacao_conexao"
                ? `${item.nomeRemetente} enviou uma solicitação para você`
                : item.conteudo;

            const Icon =
              item.tipo === "convite_grupo"
                ? Users
                : item.tipo === "solicitacao_conexao"
                ? UserPlus
                : Bell;

            return (
              <div
                key={item.id}
                className="flex gap-3 border-b border-gray-200 dark:border-zinc-700 pb-2"
              >
                <div className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800">
                  <Icon size={18} className="text-gray-700 dark:text-gray-300" />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {mensagem}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(item.criado_em).toLocaleString()}
                  </p>

                  {/* Ações */}
                  {item.tipo === "solicitacao_conexao" && !item.lido && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => aceitarSolicitacao(item)}
                        className="flex items-center gap-1 bg-emerald-500 text-white text-[11px] px-2 py-1 rounded-md"
                      >
                        <Check size={12} />
                        Aceitar
                      </button>

                      <button
                        onClick={() => recusarSolicitacao(item)}
                        className="flex items-center gap-1 bg-red-500 text-white text-[11px] px-2 py-1 rounded-md"
                      >
                        <X size={12} />
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
