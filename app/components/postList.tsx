"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Send, 
  MoreHorizontal,
  Globe,
  Plus
} from "lucide-react";

/* ===================== TIPOS ===================== */
interface Comment {
  id: number;
  autor: string;
    avatar?: string; 
  texto: string;
  created_at: string;
}

interface Post {
  id: number;
  usuario_id: string;
  autor: string;
  bio: string;
  avatar: string;
  slug: string; 
  conteudo: string;
  imagem?: string;
  likes: number; 
  likedByMe: boolean; 
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

  if (seconds < 60) return "agora";
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} h`;
  return `${days} d`;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
 const [currentUser, setCurrentUser] = useState<{
  id: string;
  nome: string;
  avatar?: string;
} | null>(null);

  const [visibleComments, setVisibleComments] = useState<{ [postId: number]: number }>({});


  /* ===================== INICIALIZAÇÃO ===================== */
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from("usuarios")
        .select("id, nome, foto_perfil")

        .eq("id", user.id)
        .single();

    const currentUser = {
  id: user.id,
  nome: userData?.nome || "Você",
  avatar: userData?.foto_perfil || "/avatar.png",
};

      setCurrentUser(currentUser);

      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          usuario_id,
          conteudo,
          imagem,
          slug,
          created_at,
          usuarios!posts_usuario_id_fkey (nome, foto_perfil,bio),
          comentarios(
            id,
            usuario_id,
            texto,
            created_at,
            usuarios!comentarios_usuario_id_fkey(nome,foto_perfil)
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
          bio: p.usuarios?.bio || "Membro da plataforma",

          avatar: p.usuarios?.foto_perfil || "/avatar.png",
          slug: p.slug,
          conteudo: p.conteudo,
          imagem: p.imagem,
          likes,
          likedByMe,
          created_at: p.created_at,
          comentarios: (p.comentarios || []).map((c: any) => ({
            id: c.id,
            autor: c.usuarios?.nome || "Desconhecido",
             avatar: c.usuarios?.foto_perfil || "/avatar.png",
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

  /* ===================== LOGICA DE REAÇÃO ===================== */
  const toggleLike = async (postId: number) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const liked = post.likedByMe;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !liked, likes: liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    if (!liked) {
      await supabase.from("reacoes").insert({
        post_id: postId,
        usuario_id: currentUser.id,
        tipo: "recomendar",
      });
    } else {
      await supabase
        .from("reacoes")
        .delete()
        .eq("post_id", postId)
        .eq("usuario_id", currentUser.id);
    }
  };

  /* ===================== LOGICA COMENTARIO ===================== */
  const addComment = async (postId: number, texto: string) => {
    if (!texto.trim() || !currentUser) return;

    const newId = Date.now();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comentarios: [
                ...p.comentarios,
                {
                  id: newId,
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
const deleteComment = async (postId: number, commentId: number) => {
  if (!currentUser) return;

  // Atualiza o estado local
  setPosts((prev) =>
    prev.map((p) =>
      p.id === postId
        ? { ...p, comentarios: p.comentarios.filter((c) => c.id !== commentId) }
        : p
    )
  );

  // Deleta no Supabase
  await supabase.from("comentarios").delete().eq("id", commentId);
};

const editComment = async (postId: number, commentId: number, novoTexto: string) => {
  if (!currentUser) return;

  // Atualiza o estado local
  setPosts((prev) =>
    prev.map((p) =>
      p.id === postId
        ? {
            ...p,
            comentarios: p.comentarios.map((c) =>
              c.id === commentId ? { ...c, texto: novoTexto } : c
            ),
          }
        : p
    )
  );

  // Atualiza no Supabase
  await supabase.from("comentarios").update({ texto: novoTexto }).eq("id", commentId);
};

  if (loading) return <p className="text-center py-10 text-gray-500 font-sans">Carregando feed...</p>;

  return (
    <div className="w-full max-w-[555px] mx-auto space-y-2 bg-[#ffff] py-9">
      {posts.map((post) => (
        <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          
          {/* HEADER */}
          <div className="flex justify-between items-start p-3 px-4">
            <div className="flex gap-2">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
                <Image
                  src={post.avatar || "/avatar.png"}
                  alt={post.autor}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer leading-tight">
                    {post.autor}
                  </span>
                  <span className="text-xs text-gray-500">• 2º</span>
                </div>
                <p className="text-xs text-gray-500 leading-tight">  {post.bio}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  <span>{formatDateRelative(post.created_at)}</span>
                  <span>•</span>
                  <Globe size={12} />
                </div>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* CONTEÚDO TEXTUAL */}
          <div className="px-4 pb-2">
            <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-line">
              {post.conteudo}
            </p>
            <button 
              onClick={() => { if(post.slug) window.location.href = `/post/${post.slug}` }}
              className="text-blue-600 text-sm font-semibold hover:underline mt-1 block"
            >
              ver detalhes
            </button>
          </div>

          {/* IMAGEM DO POST */}
          {post.imagem && (
            <div className="w-full bg-gray-50 border-y border-gray-100">
              <img
                src={post.imagem}
                alt="Post"
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
              />
            </div>
          )}

          {/* ESTATÍSTICAS */}
          <div className="px-4 py-2 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <div className="bg-[#0077A3] rounded-full p-0.5">
                <ThumbsUp size={10} className="text-white fill-white" />
              </div>
              <span className="hover:text-blue-600 cursor-pointer">{post.likes}</span>
            </div>
            <div className="text-[11px] text-gray-500 hover:text-blue-600 hover:underline cursor-pointer">
              {post.comentarios.length} comentários
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="px-3 py-1 flex justify-between">
            <button 
              onClick={() => toggleLike(post.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 hover:bg-gray-100 rounded transition-colors text-sm font-semibold ${post.likedByMe ? 'text-[#0077A3]' : 'text-gray-600'}`}
            >
              <ThumbsUp size={18} className={post.likedByMe ? 'fill-[#0077A3]' : ''} />
              <span>Gostar</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 hover:bg-gray-100 rounded transition-colors text-gray-600 text-sm font-semibold">
              <MessageSquare size={18} />
              <span>Comentar</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 hover:bg-gray-100 rounded transition-colors text-gray-600 text-sm font-semibold">
              <Share2 size={18} />
              <span>Compartilhar</span>
            </button>
           
          </div>

          {/* SEÇÃO DE COMENTÁRIOS ESTILO LINKEDIN */}
          <div className="px-4 pb-4 space-y-3">
            {/* Input para comentar */}
           <div className="flex gap-2 items-center mt-2">
  {/* Foto do usuário */}
  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
    <Image
      src={currentUser?.avatar || "/avatar.png"}
      fill
      className="object-cover"
      alt={currentUser?.nome || "Você"}
    />
  </div>

  {/* Input com ícone de enviar */}
  <div className="flex-1 relative">
    <input
      type="text"
      placeholder="Adicione um comentário..."
      className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 pr-10"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          addComment(post.id, (e.target as HTMLInputElement).value);
          (e.target as HTMLInputElement).value = "";
        }
      }}
      id={`comment-input-${post.id}`} // para selecionar depois no botão
    />
    {/* Ícone de enviar */}
    <Send
      size={18}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-600"
      onClick={() => {
        const input = document.getElementById(`comment-input-${post.id}`) as HTMLInputElement;
        if (input?.value.trim()) {
          addComment(post.id, input.value);
          input.value = "";
        }
      }}
    />
  </div>
</div>


            {/* Lista de comentários */}
            <div className="space-y-3">
              {post.comentarios.slice(0, visibleComments[post.id] || 1).map((c) => (
  <div key={c.id} className="flex gap-2">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden relative">
      <Image
        src={c.avatar || "/avatar.png"}
        fill
        className="object-cover"
        alt={c.autor}
      />
    </div>

    <div className="bg-[#F2F2F2] rounded-lg p-2 flex-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-900">{c.autor}</span>
        <span className="text-[10px] text-gray-500">{formatDateRelative(c.created_at)}</span>
      </div>
      <p className="text-xs text-gray-700 mt-1">{c.texto}</p>
    </div>
  </div>
))}

            {post.comentarios.length > (visibleComments[post.id] || 1) && (
  <button
    className="text-sm text-gray-500 font-semibold hover:underline px-1"
    onClick={() =>
      setVisibleComments((prev) => ({
        ...prev,
        [post.id]: (prev[post.id] || 1) + 3, // mostra mais 3 comentários
      }))
    }
  >
    Exibir mais comentários
  </button>
)}

            </div>
          </div>

        </article>
      ))}
    </div>
  );
}