"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle, Send } from "lucide-react";

/* ===================== TIPOS ===================== */
interface Comment {
  id: number;
  autor: string;
  texto: string;
  created_at: string;
}

interface Post {
  id: number;
  usuario_id: string;
  autor: string;
  avatar: string;
    slug: string; 
  conteudo: string;
  imagem?: string;
  likes: number; // total de reações
  likedByMe: boolean; // já reagiu?
  comentarios: Comment[];
  created_at: string;
}

/* ===================== DATA RELATIVA ===================== */
function formatDateRelative(dateString?: string) {
  if (!dateString) return "agora mesmo";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "agora mesmo";

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  if (hours < 24) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
  if (days < 30) return `há ${days} dia${days > 1 ? "s" : ""}`;
  if (months < 12) return `há ${months} mês${months > 1 ? "es" : ""}`;
  return `há ${years} ano${years > 1 ? "s" : ""}`;
}

/* ===================== COMPONENTE ===================== */
export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; nome: string } | null>(null);

  /* ===================== INICIALIZAÇÃO ===================== */
  useEffect(() => {
    const init = async () => {
      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .eq("id", user.id)
        .single();

      const currentUser = {
        id: user.id,
        nome: userData?.nome || "Você",
      };
      setCurrentUser(currentUser);

      // Buscar posts
     const { data, error } = await supabase
  .from("posts")
  .select(`
    id,
    usuario_id,
    conteudo,
    imagem,
    slug,
    created_at,
    usuarios!posts_usuario_id_fkey (nome, foto_perfil),
    comentarios(
      id,
      usuario_id,
      texto,
      created_at,
      usuarios!comentarios_usuario_id_fkey(nome)
    ),
    reacoes!reacoes_post_id_fkey(usuario_id, tipo)
  `)
  .order("created_at", { ascending: false });


      if (error) {
        console.error("Erro ao buscar posts:", error);
        setLoading(false);
        return;
      }

      const formatted: Post[] = (data || []).map((p: any) => {
  const likedByMe = p.reacoes?.some((r: any) => r.usuario_id === currentUser.id) || false;
  const likes = p.reacoes?.length || 0;

  return {
    id: p.id,
    usuario_id: p.usuario_id,
    autor: p.usuarios?.nome || "Desconhecido",
    avatar: p.usuarios?.foto_perfil || "/avatar.png",
    slug: p.slug, // ✅ ADICIONE ISTO
    conteudo: p.conteudo,
    imagem: p.imagem,
    likes,
    likedByMe,
    created_at: p.created_at,
    comentarios: (p.comentarios || []).map((c: any) => ({
      id: c.id,
      autor: c.usuarios?.nome || "Desconhecido",
      texto: c.texto,
      created_at: c.created_at,
    })),
  };
});


      setPosts(formatted);
      setLoading(false);
    };

    init();
  }, []);

  /* ===================== REAGIR / REMOVER REAÇÃO ===================== */
  const toggleLike = async (postId: number) => {
    if (!currentUser) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const liked = post.likedByMe;

    // Atualiza estado local
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !liked,
              likes: liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );

    if (!liked) {
      // Inserir reação
      await supabase.from("reacoes").insert({
        post_id: postId,
        usuario_id: currentUser.id,
        tipo: "adorei",
      });
    } else {
      // Remover reação
      await supabase
        .from("reacoes")
        .delete()
        .eq("post_id", postId)
        .eq("usuario_id", currentUser.id);
    }
  };

  /* ===================== ADICIONAR COMENTÁRIO ===================== */
  const addComment = async (postId: number, texto: string) => {
    if (!texto.trim() || !currentUser) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comentarios: [
                ...p.comentarios,
                {
                  id: Date.now(),
                  autor: currentUser.nome,
                  texto,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : p
      )
    );

    await supabase.from("comentarios").insert({
      post_id: postId,
      usuario_id: currentUser.id,
      texto,
    });
  };

  /* ===================== RENDER ===================== */
  if (loading)
    return <p className="text-center py-10 text-gray-500">Carregando...</p>;

  if (posts.length === 0)
    return (
      <p className="text-center py-10 text-gray-500">
        Nenhuma publicação encontrada.
      </p>
    );

  return (
    <div className="w-full max-w-xl mx-auto px-3 pt-6 space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <header className="flex items-center gap-3 px-3 py-3">
            <Image
              src={post.avatar}
              alt={post.autor}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="leading-tight flex-1">
              <p className="text-sm font-semibold text-gray-900">{post.autor}</p>
              <p className="text-xs text-gray-500">
                {formatDateRelative(post.created_at)}
              </p>
            </div>
          </header>

          {/* CONTEÚDO */}
          <div className="px-3 pb-3">
            <p className="text-sm text-gray-800 leading-relaxed break-words">
              {post.conteudo}
            </p>
          </div>

          {/* IMAGEM */}
          {post.imagem && (
            <div className="w-full">
              <Image
                src={post.imagem}
                alt="Post"
                width={600}
                height={300}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* AÇÕES */}
          <footer className="px-3 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-1 ${
                  post.likedByMe ? "text-pink-500" : "text-gray-600"
                }`}
                onClick={() => toggleLike(post.id)}
              >
                <Heart size={20} />
                <span className="text-xs">{post.likes}</span>
              </button>

              <button className="flex items-center gap-1 text-gray-600">
                <MessageCircle size={20} />
                <span className="text-xs">{post.comentarios.length}</span>
              </button>
            </div>
<div className="flex items-center gap-3 mt-2">
  {/* Botão Detalhes */}
<button
  className="text-blue-500 text-sm"
  onClick={() => {
    console.log("Slug do post:", post.slug);
    if (post.slug) {
      window.location.href = `/post/${post.slug}`;
    } else {
      console.warn("Slug não definido!");
    }
  }}
>
  Detalhes
</button>


  
</div>

            {/* COMENTÁRIOS */}
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {post.comentarios.map((c) => (
                <p key={c.id} className="text-xs text-gray-700 break-words">
                  <span className="font-semibold">{c.autor}: </span>
                  {c.texto}{" "}
                  <span className="text-gray-400">
                    ({formatDateRelative(c.created_at)})
                  </span>
                </p>
              ))}
            </div>

            {/* INPUT COMENTÁRIO */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="Escreva um comentário..."
              className="flex-1 rounded-full border border-gray-400/40 px-3 py-1 text-sm  outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addComment(post.id, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <button
                className="p-2 text-indigo-600"
                onClick={(e) => {
                  const input = (e.currentTarget.parentNode as HTMLElement).querySelector(
                    "input"
                  ) as HTMLInputElement;
                  addComment(post.id, input.value);
                  input.value = "";
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}
