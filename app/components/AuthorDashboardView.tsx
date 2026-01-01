"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ================= TIPOS ================= */
interface Interacao {
  id: string;
  tipo: string;
  criado_em: string;
  status: "pendente" | "aprovado" | "rejeitado";
  remetente: {
    nome: string;
    email?: string;
    foto_perfil?: string;
  };
}

interface Post {
  id: string;
  titulo: string;
  criado_em: string;
}

/* ================= VIEW ================= */
export default function AuthorDashboardView({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [interacoes, setInteracoes] = useState<
    Record<string, Interacao[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "pendente" | "aprovado" | "rejeitado"
  >("pendente");

  /* ===== FETCH ===== */
  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);

    const { data: postsData } = await supabase
      .from("v_posts_completos")
      .select("id, titulo, criado_em")
      .eq("usuario_id", currentUserId)
      .order("criado_em", { ascending: false });

    if (postsData) {
      setPosts(postsData);
      const map: Record<string, Interacao[]> = {};

      for (const post of postsData) {
        const { data: ints } = await supabase
          .from("interacoes_post")
          .select("*")
          .eq("post_id", post.id)
          .order("criado_em", { ascending: false });

        if (ints?.length) {
          const ids = ints.map((i) => i.remetente_id);
          const { data: users } = await supabase
            .from("usuarios")
            .select("id, nome, email, foto_perfil")
            .in("id", ids);

          map[post.id] = ints.map((i) => ({
            ...i,
            remetente:
              users?.find((u) => u.id === i.remetente_id) || {
                nome: "Usuário",
              },
          }));
        } else {
          map[post.id] = [];
        }
      }

      setInteracoes(map);
    }

    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ===== UPDATE STATUS ===== */
  const updateStatus = async (
  id: string,
  status: "aprovado" | "rejeitado"
) => {
  const { error } = await supabase
    .from("interacoes_post")
    .update({ status })
    .eq("id", id)
    .eq("status", "pendente"); // 👈 IMPORTANTE

  if (!error) {
    setInteracoes((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((pid) => {
        copy[pid] = copy[pid].map((i) =>
          i.id === id ? { ...i, status } : i
        );
      });
      return copy;
    });
  }
};


  return (
    <div className="w-full bg-[#F8F9FB] pb-24">
      {/* HEADER */}
      <header className="sticky py-6 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-base">
              Gestão de Engajamento
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">
          Podes ver quem se interagio 
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold"
          >
            <RefreshCw
              className={`w-3 h-3 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Atualizar
          </button>
        </div>

        {/* FILTRO GLOBAL */}
        <div className="flex gap-2 px-4 md:px-6 pb-3">
          {["pendente", "aprovado", "rejeitado"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* PIPELINE */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin w-8 h-8 text-zinc-400" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["pendente", "aprovado", "rejeitado"].map((col) => (
              <PipelineColumn
                key={col}
                title={col}
                posts={posts}
                interacoes={interacoes}
                status={col as any}
                statusFilter={statusFilter}
                onApprove={updateStatus}
                onReject={updateStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= PIPELINE COLUMN ================= */
function PipelineColumn({
  title,
  posts,
  interacoes,
  status,
  statusFilter,
  onApprove,
  onReject,
}: any) {
  if (status !== statusFilter) return null;

  return (
    <div className="bg-zinc-100 rounded-2xl p-4 space-y-4">
      <h2 className="text-xs font-black uppercase text-zinc-600">
        {title}
      </h2>

      {posts.map((post: Post) =>
        interacoes[post.id]
          ?.filter((i: Interacao) => i.status === status)
          .map((int: Interacao) => (
            <InteractionCard
              key={int.id}
              post={post}
              int={int}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))
      )}
    </div>
  );
}

/* ================= INTERACTION CARD ================= */
function InteractionCard({
  post,
  int,
  onApprove,
  onReject,
}: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div>
        <p className="text-xs font-bold text-zinc-500">
          {post.titulo}
        </p>
        <p className="text-sm font-bold">{int.remetente.nome}</p>
        <p className="text-xs text-zinc-400">
          {int.tipo} •{" "}
          {new Date(int.criado_em).toLocaleDateString()}
        </p>
      </div>

      {int.status === "pendente" ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onReject(int.id, "rejeitado")}
            className="px-4 py-2 rounded-full border text-xs font-bold"
          >
            Rejeitar
          </button>
          <button
            onClick={() => onApprove(int.id, "aprovado")}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold"
          >
            Aprovar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold">
          {int.status === "aprovado" ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              APROVADO
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              REJEITADO
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= EMPTY ================= */
function EmptyDashboard() {
  return (
    <div className="bg-white border rounded-2xl p-16 text-center">
      <Search className="w-8 h-8 mx-auto text-zinc-300 mb-4" />
      <p className="text-sm font-bold">
        Nenhuma interação encontrada
      </p>
    </div>
  );
}
