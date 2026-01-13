"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle, Send } from "lucide-react";

/* ===================== TIPAGENS ===================== */

interface Comment {
  id: number;
  autor: string;
  texto: string;
  created_at: string;
}

interface PostDetailProps {
  slug: string;
}

interface PostResponse {
  id: number;
  usuario_id: string;
  conteudo: string;
  imagem?: string;
  created_at: string;
  slug: string;
  usuarios: { nome: string; foto_perfil: string }[] | null;
  comentarios: {
    id: number;
    usuario_id: string;
    texto: string;
    created_at: string;
    usuarios: { nome: string }[] | null;
  }[];
  reacoes: { usuario_id: string; tipo: string }[];
}

interface Post {
  id: number;
  usuario_id: string;
  autor: string;
  avatar: string;
  conteudo: string;
  slug: string;
  imagem?: string;
  likes: number;
  likedByMe: boolean;
  comentarios: Comment[];
  created_at: string;
}

/* ===================== FUNÇÃO DATA RELATIVA ===================== */

function formatDateRelative(dateString?: string): string {
  if (!dateString) return "agora mesmo";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return new Date(dateString).toLocaleDateString();

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

export default function PostDetail({ slug }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; nome: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");

  /* -------------------- FETCH POST -------------------- */
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);

      // 1. Usuário logado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", user.id)
        .single();

      setCurrentUser({ id: user.id, nome: userData?.nome || "Você" });

      // 2. Buscar post pelo slug
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          usuario_id,
          conteudo,
          imagem,
          created_at,
          slug,
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
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.error("Erro ao buscar post:", error);
        setPost(null);
        setLoading(false);
        return;
      }

      const postData = data as PostResponse;

      // Processar usuário do post
      const userInfo = postData.usuarios && postData.usuarios.length > 0
        ? postData.usuarios[0]
        : { nome: "Desconhecido", foto_perfil: "/avatar.png" };

      // Processar comentários
      const comments: Comment[] = (postData.comentarios || []).map((c) => {
        const commentUser = c.usuarios && c.usuarios.length > 0
          ? c.usuarios[0]
          : { nome: "Desconhecido" };
        return {
          id: c.id,
          autor: commentUser.nome,
          texto: c.texto,
          created_at: c.created_at,
        };
      }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const likedByMe = postData.reacoes?.some(r => r.usuario_id === user.id) || false;
      const likes = postData.reacoes?.length || 0;

      setPost({
        id: postData.id,
        usuario_id: postData.usuario_id,
        autor: userInfo.nome,
        avatar: userInfo.foto_perfil,
        conteudo: postData.conteudo,
        imagem: postData.imagem,
        slug: postData.slug,
        likes,
        likedByMe,
        created_at: postData.created_at,
        comentarios: comments,
      });

      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  /* -------------------- FUNÇÕES -------------------- */

  const toggleLike = async () => {
    if (!currentUser || !post) return;

    const liked = post.likedByMe;
    const postId = post.id;

    setPost(prev => prev ? { ...prev, likedByMe: !liked, likes: liked ? prev.likes - 1 : prev.likes + 1 } : null);

    if (!liked) {
      await supabase.from("reacoes").insert({ post_id: postId, usuario_id: currentUser.id, tipo: "adorei" });
    } else {
      await supabase.from("reacoes").delete().eq("post_id", postId).eq("usuario_id", currentUser.id);
    }
  };

  const addComment = async () => {
    if (!newCommentText.trim() || !currentUser || !post) return;

    const texto = newCommentText.trim();
    const newComment: Comment = {
      id: Date.now(),
      autor: currentUser.nome,
      texto,
      created_at: new Date().toISOString(),
    };

    setPost(prev => prev ? { ...prev, comentarios: [...prev.comentarios, newComment] } : null);
    setNewCommentText("");

    await supabase.from("comentarios").insert({
      post_id: post.id,
      usuario_id: currentUser.id,
      texto,
    });
  };

  /* -------------------- RENDER -------------------- */

  if (loading) return <p className="text-center py-10 text-gray-500">Carregando post...</p>;
  if (!post) return <p className="text-center py-10 text-red-500">Post não encontrado.</p>;

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 bg-white rounded-xl shadow-md mt-6">
      {/* Header */}
      <header className="flex items-center gap-3 border-b pb-3">
        <Image src={post.avatar} alt={post.autor} width={50} height={50} className="rounded-full object-cover" />
        <div>
          <p className="text-lg font-bold text-gray-900">{post.autor}</p>
          <p className="text-xs text-gray-500">Publicado {formatDateRelative(post.created_at)}</p>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="py-2 text-gray-800 whitespace-pre-wrap">{post.conteudo}</div>

      {/* Imagem */}
      {post.imagem && (
        <div className="w-full my-4">
          <Image src={post.imagem} alt="Post" width={600} height={300} className="w-full rounded-lg object-cover max-h-96" />
        </div>
      )}

      {/* Likes e comentários */}
      <div className="flex items-center justify-between border-t border-b py-2 text-gray-600">
        <button
          className={`flex items-center gap-1 transition-colors ${post.likedByMe ? "text-pink-500 hover:text-pink-600" : "hover:text-gray-900"}`}
          onClick={toggleLike}
        >
          <Heart size={20} fill={post.likedByMe ? "currentColor" : "none"} />
          <span className="text-sm font-semibold">{post.likes} Reação{post.likes !== 1 ? "s" : ""}</span>
        </button>

        <div className="flex items-center gap-1">
          <MessageCircle size={20} />
          <span className="text-sm">{post.comentarios.length} Comentário{post.comentarios.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Comentários */}
      <div className="mt-4 space-y-3">
        <h3 className="text-md font-semibold text-gray-800">Comentários</h3>

        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
          {post.comentarios.length === 0 && (
            <p className="text-sm text-gray-500">Seja o primeiro a comentar!</p>
          )}
          {post.comentarios.map(c => (
            <div key={c.id} className="text-sm bg-gray-50 p-2 rounded-lg">
              <p className="font-semibold text-gray-700 inline">{c.autor}:</p>
              <span className="text-gray-800 ml-1 break-words">{c.texto}</span>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateRelative(c.created_at)}</p>
            </div>
          ))}
        </div>

        {/* Input de comentário */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <input
            type="text"
            placeholder={currentUser ? "Escreva um comentário..." : "Faça login para comentar"}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={!currentUser}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && currentUser) addComment(); }}
          />
          <button
            className={`p-2 rounded-full transition-colors ${currentUser && newCommentText.trim() ? "text-indigo-600 hover:bg-indigo-50" : "text-gray-400 cursor-not-allowed"}`}
            disabled={!currentUser || !newCommentText.trim()}
            onClick={addComment}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
