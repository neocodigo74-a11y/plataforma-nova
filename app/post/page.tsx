"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // AJUSTE O CAMINHO
import {
  Briefcase,
  FileText,
  Users,
  HelpCircle,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  Filter,
  Search,
  List,
  LayoutGrid,
  Heart,
  MessageCircle,
  Eye,
  X,
  LucideIcon,
  Loader2,
  User,
} from "lucide-react";

// --- Definições de Tipos ---
export type PostType = "artigo" | "freelancer" | "parceria" | "vaga" | "ajuda";

interface Liker {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  status: "published" | "scheduled" | "draft";
  creationDate: Date;
  tags?: string[];
  local?: string;
  salario?: string;
  author: string;
  authorAvatarUrl?: string;
  likers: Liker[]; 
  likes: number;
  comments: number;
  views: number;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
}

// Mapeamento Odoo-like
const POST_TYPE_INFO: Record<PostType, any> = {
  artigo: { label: "Artigo", Icon: FileText, colorClass: "text-blue-600", bgColorClass: "bg-blue-100" },
  freelancer: { label: "Freelancer", Icon: Briefcase, colorClass: "text-indigo-600", bgColorClass: "bg-indigo-100" },
  parceria: { label: "Parceria", Icon: Users, colorClass: "text-purple-600", bgColorClass: "bg-purple-100" },
  vaga: { label: "Vaga", Icon: Briefcase, colorClass: "text-green-600", bgColorClass: "bg-green-100" },
  ajuda: { label: "Ajuda", Icon: HelpCircle, colorClass: "text-red-600", bgColorClass: "bg-red-100" },
};

const postTypesList: { id: PostType | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "artigo", label: "Artigos" },
  { id: "freelancer", label: "Freelancer" },
  { id: "parceria", label: "Parcerias" },
  { id: "vaga", label: "Vagas" },
  { id: "ajuda", label: "Ajuda" },
];

const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(num);
};

// --- MODAL: LISTA DE LIKERS (LAYOUT MANTIDO) ---
function OdooModalLikers({ open, onClose, likers, currentUserId }: any) {
    if (!open) return null;
    const sortedLikers = useMemo(() => {
        const authIndex = likers.findIndex((l: any) => l.id === currentUserId);
        if (authIndex !== -1) {
            const authLiker = likers[authIndex];
            const otherLikers = likers.filter((l: any) => l.id !== currentUserId);
            return [authLiker, ...otherLikers];
        }
        return likers;
    }, [likers, currentUserId]);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full md:max-w-md rounded-t-xl md:rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <h3 className="font-semibold text-base line-clamp-1 text-gray-800">Pessoas que reagiram ({likers.length})</h3>
                    <button onClick={onClose} className="text-xl text-zinc-500 hover:text-zinc-800 p-1 rounded hover:bg-gray-200 transition"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {sortedLikers.map((liker: any) => (
                        <div key={liker.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition">
                            {liker.avatarUrl ? <img src={liker.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200" /> : <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shrink-0">{getInitials(liker.name)}</div>}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">{liker.name}</p>
                                {liker.id === currentUserId && <div className="flex items-center gap-1 text-xs text-red-600"><Heart className="w-3 h-3 fill-red-600" /> Você</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- MODAL: COMENTÁRIOS (LAYOUT MANTIDO + BACKEND) ---
function OdooModalComments({ open, onClose, postId, postTitle, currentUserId, onCommentAdded }: any) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
    const { data, error } = await supabase
        .from('post_comment')
        .select('id, text, author_name, created_at') // Usando as colunas reais
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (!error && data) {
        setComments(data.map((c: any) => ({
            id: c.id,
            author: c.author_name,
            text: c.text,
            createdAt: new Date(c.created_at)
        })));
    }
};

    useEffect(() => { if (open) fetchComments(); }, [open, postId]);

   const handleAdd = async () => {
    if (!text.trim() || !currentUserId) return;
    setLoading(true);
    
    // Pegamos o nome do usuário logado (pode vir do seu estado de sessão)
    // Se não tiver o nome fácil, o ideal seria buscá-lo antes ou permitir que o DB resolva
    const { data: userData } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', currentUserId)
        .single();

    const { error } = await supabase
        .from('post_comment') // Verifique se é singular mesmo
        .insert([{ 
            post_id: postId, 
            author_id: currentUserId, // De user_id para author_id
            author_name: userData?.nome || "Usuário", // Coluna obrigatória na sua tabela
            text: text // De content para text
        }]);

    if (!error) {
        setText("");
        fetchComments();
        onCommentAdded();
    } else {
        console.error("Erro ao inserir:", error.message);
    }
    setLoading(false);
};

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full md:max-w-lg rounded-t-xl md:rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <h3 className="font-semibold text-base line-clamp-1 text-gray-800">Comentários • {postTitle}</h3>
                    <button onClick={onClose} className="text-xl text-zinc-500 hover:text-zinc-800 p-1 rounded hover:bg-gray-200 transition"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{getInitials(c.author)}</div>
                            <div className="bg-zinc-100 rounded-xl px-3 py-2 flex-1">
                                <p className="text-sm font-medium">{c.author}</p>
                                <p className="text-sm text-zinc-700">{c.text}</p>
                                <span className="text-xs text-zinc-400 mt-1 block">{c.createdAt.toLocaleString("pt-BR")}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t px-4 py-3 flex gap-2 bg-gray-50">
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva um comentário..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md">
                        {loading ? "..." : "Enviar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MODAL: DETALHES COM AÇÃO DE CONTATO ---
function OdooModalDetails({ open, onClose, post, info, currentUserId }: any) {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [jaInteragiu, setJaInteragiu] = useState(false);

  // 1. Verificar se o usuário já enviou solicitação para este post
  useEffect(() => {
    const verificarInteracao = async () => {
      if (!open || !post || !currentUserId) return;
      
      const { data, error } = await supabase
        .from('interacoes_post')
        .select('id')
        .eq('post_id', post.id)
        .eq('destinatario_id', currentUserId)
        .maybeSingle(); // Retorna 1 ou null

      if (data) setJaInteragiu(true);
      else setJaInteragiu(false);
    };

    verificarInteracao();
  }, [open, post?.id, currentUserId]);

  const configAcao = useMemo(() => {
    if (!post) return { label: "Carregando...", tipo: "contato", cor: "bg-gray-400" };

    // Lógica de Bloqueio para o Autor
    if (currentUserId === post.author_id) {
      return { label: "Seu próprio post", tipo: "proprio", cor: "bg-zinc-400 cursor-not-allowed" };
    }

    // Lógica para quem já enviou
    if (jaInteragiu) {
      return { label: "Solicitação já enviada", tipo: "duplicado", cor: "bg-amber-600 cursor-not-allowed" };
    }

    switch (post.type as PostType) {
      case "vaga": 
        return { label: "Candidatar-se à Vaga", tipo: "candidatura", cor: "bg-green-600 hover:bg-green-700" };
      case "freelancer": 
        return { label: "Enviar Proposta", tipo: "proposta", cor: "bg-indigo-600 hover:bg-indigo-700" };
      case "parceria": 
        return { label: "Propor Parceria", tipo: "parceria", cor: "bg-purple-600 hover:bg-purple-700" };
      case "ajuda": 
        return { label: "Aceitar Ajuda", tipo: "ajuda_oferecida", cor: "bg-red-600 hover:bg-red-700" };
      default: 
        return { label: "Entrar em Contato", tipo: "contato", cor: "bg-blue-600 hover:bg-blue-700" };
    }
  }, [post?.type, post?.author_id, currentUserId, jaInteragiu]);

  if (!open || !post) return null;

  const handleInteracao = async () => {
    if (!currentUserId) return alert("Faça login para interagir!");
    if (currentUserId === post.author_id) return; // Segurança extra
    if (jaInteragiu) return; // Evita cliques duplos se o botão não desabilitar a tempo

    setLoading(true);

    try {
      // 1. Criar a Interação
      const { error: interacaoError } = await supabase
        .from('interacoes_post')
        .insert([{
          post_id: post.id,
          remetente_id: currentUserId,
          destinatario_id: post.author_id,
          tipo: configAcao.tipo,
          mensagem: `Interação iniciada via: ${post.title}`,
          status: 'pendente'
        }]);

      if (interacaoError) throw interacaoError;

      // 2. Criar a Notificação
      await supabase
        .from('notificacoes')
        .insert([{
          recebido_por: post.author_id,
          enviado_por: currentUserId,
          tipo: configAcao.tipo,
          conteudo: `recebeu uma nova ${configAcao.tipo} no post "${post.title}"`
        }]);

      setEnviado(true);
      setJaInteragiu(true); // Atualiza o estado local imediatamente
      
      setTimeout(() => {
        setEnviado(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar contato.");
    } finally {
      setLoading(false);
    }
  };

  // Determinar se o botão deve estar desabilitado
  const isButtonDisabled = loading || enviado || jaInteragiu || (currentUserId === post.author_id);

  return (
    <div className="fixed inset-0    bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* ... (Todo o cabeçalho e conteúdo permanecem iguais) ... */}
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center px-6 py-9 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${info?.bgColorClass || 'bg-gray-100'}`}>
              {info?.Icon && <info.Icon className={`w-5 h-5 ${info?.colorClass}`} />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{post.title}</h3>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{info?.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           {/* Grid de Informações */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Publicado:</span>
                <span className="font-medium text-gray-900">{post.creationDate.toLocaleDateString("pt-BR")}</span>
              </div>
              {post.local && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Local:</span>
                  <span className="font-medium text-gray-900">{post.local}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Autor:</span>
                <span className="font-medium text-gray-900">{post.author}</span>
              </div>
              {post.salario && (
                <div className="flex items-center gap-3 text-sm text-green-700 font-medium">
                  <DollarSign className="w-4 h-4" />
                  <span>{post.salario}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-tight">Descrição</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
              {post.description}
            </div>
          </div>
        </div>

        {/* Rodapé Dinâmico */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition">
            Fechar
          </button>
          
          {post.type !== "artigo" && (
            <button 
              disabled={isButtonDisabled}
              onClick={handleInteracao}
              className={`px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition transform active:scale-95 flex items-center gap-2 ${enviado ? 'bg-zinc-400' : configAcao.cor} disabled:opacity-70 disabled:active:scale-100`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
               enviado ? "Solicitação Enviada!" : 
               configAcao.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- ITEM DO POST (LAYOUT MANTIDO + BACKEND) ---
function PostItem({ post, currentUserId, onRefresh }: { post: Post, currentUserId: string | null, onRefresh: () => void }) {
  const info = POST_TYPE_INFO[post.type];
  const Icon = info.Icon;

  const [liked, setLiked] = useState(post.likers.some(l => l.id === currentUserId));
  const [openComments, setOpenComments] = useState(false);
  const [openLikers, setOpenLikers] = useState(false);
  const [openDetails, setOpenDetails] = useState(false); // Estado para o novo modal

  useEffect(() => { setLiked(post.likers.some(l => l.id === currentUserId)); }, [post.likers, currentUserId]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    const originalState = liked;
    setLiked(!originalState);
    const { error } = await supabase.rpc('toggle_post_like', { p_post_id: post.id, p_usuario_id: currentUserId });
    if (error) setLiked(originalState);
  };

  const handleViewDetails = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // 1. Abrimos o modal visualmente primeiro para agilidade
    setOpenDetails(true);

    if (!currentUserId) return;

    try {
      // 2. Contabilizamos a view no banco
      const { error } = await supabase.rpc('increment_post_view', { 
        p_post_id: post.id, 
        p_usuario_id: currentUserId 
      });

      if (!error) {
        onRefresh(); // Atualiza o contador na tela
      }
    } catch (err) {
      console.error("Erro ao registrar view:", err);
    }
  };

  const currentLikersList = useMemo(() => {
    let list = [...post.likers];
    const authInList = post.likers.some(l => l.id === currentUserId);
    if (liked && !authInList) list = [{ id: currentUserId!, name: "Você" }, ...list];
    else if (!liked && authInList) list = list.filter(l => l.id !== currentUserId);
    return list;
  }, [post.likers, liked, currentUserId]);

  const totalLikes = currentLikersList.length;
  const visibleAvatars = currentLikersList.slice(0, 5);
  const remainingLikersCount = totalLikes > 5 ? totalLikes - 5 : 0;

  return (
    <>
      <div 
        onClick={() => setOpenDetails(true)} // Clique no card abre o modal
        className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition space-y-3 cursor-pointer"
      >
        <div className="flex justify-between items-start">
            <div className={`flex items-center gap-2 ${info.bgColorClass} px-2 py-1 rounded-md`}>
                <Icon className={`w-4 h-4 ${info.colorClass}`} />
                <span className={`text-sm font-medium ${info.colorClass}`}>{info.label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{post.author}</span>
                {post.authorAvatarUrl ? <img src={post.authorAvatarUrl} className="w-8 h-8 rounded-full border border-gray-200" /> : <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{getInitials(post.author)}</div>}
            </div>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 mt-1">{post.title}</h3>
        <p className="text-sm text-zinc-600 line-clamp-3">{post.description}</p>

        <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.creationDate.toLocaleDateString("pt-BR")}</span>
                {post.local && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.local}</span>}
                {post.salario && <span className="flex items-center gap-1 font-medium text-green-700"><DollarSign className="w-3 h-3" />{post.salario}</span>}
            </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm"> 
          <div className="flex items-center gap-4 text-zinc-500">
            <div className="relative flex items-center h-6 min-w-[50px] pr-2"> 
                {totalLikes > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); setOpenLikers(true); }} className="absolute bottom-full left-0 mb-1 cursor-pointer z-20">
                        <div className="flex -space-x-1.5">
                            {visibleAvatars.map((liker, i) => (
                                <div key={liker.id} className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs overflow-hidden shadow-sm" style={{ zIndex: 10 + i }}>
                                    {liker.avatarUrl ? <img src={liker.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px]">{getInitials(liker.name)}</span>}
                                </div>
                            ))}
                            {remainingLikersCount > 0 && <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600 shadow-sm">+{remainingLikersCount}</div>}
                        </div>
                    </button>
                )}
                <button onClick={handleToggleLike} className={`flex items-center gap-1 p-1 rounded transition ${liked ? "text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-red-600 hover:bg-red-50"} relative z-10`}>
                    <Heart className={`w-4 h-4 ${liked ? "fill-red-600" : ""}`} />
                    {totalLikes > 0 && <span className="text-xs font-semibold text-gray-700">{formatCount(totalLikes)}</span>}
                </button>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setOpenComments(true); }} className="flex items-center gap-1 p-1 rounded hover:bg-gray-100 hover:text-blue-600 transition">
              <MessageCircle className="w-4 h-4" />{post.comments}
            </button>
            <div className="flex items-center gap-1 text-zinc-400 p-1"><Eye className="w-4 h-4" />{post.views}</div>
          </div>
          {/* Botão de Ver Detalhes chama a função que abre o modal e conta a view */}
          <button onClick={handleViewDetails} className="text-blue-600 text-sm font-medium hover:underline">Ver detalhes →</button>
        </div>
      </div>

      {/* Renderização dos Modais */}
      <OdooModalComments 
        open={openComments} 
        onClose={() => setOpenComments(false)} 
        postId={post.id} 
        postTitle={post.title} 
        currentUserId={currentUserId} 
        onCommentAdded={onRefresh} 
      />
      
      <OdooModalLikers 
        open={openLikers} 
        onClose={() => setOpenLikers(false)} 
        likers={currentLikersList} 
        currentUserId={currentUserId} 
      />

 <OdooModalDetails 
  open={openDetails} 
  onClose={() => setOpenDetails(false)} 
  post={post} 
  info={info} 
  currentUserId={currentUserId} // <-- Essencial para gravar quem enviou
/>
    </>
  );
}

// --- VIEW PRINCIPAL ---
export default function OdooPostCommunityView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<PostType | "all">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('v_posts_completos').select('*').order('criado_em', { ascending: false });
      if (!error && data) {
        setPosts(data.map((p: any) => ({
          id: p.id, type: p.tipo as PostType, title: p.titulo, description: p.descricao, status: "published",
          creationDate: new Date(p.criado_em), tags: p.tags || [], local: p.local, salario: p.salario,
          author_id: p.usuario_id || p.author_id,
          author: p.author_name, authorAvatarUrl: p.author_avatar, likes: p.likes_count || 0,
          comments: p.comments_count || 0, views: p.views_count || 0, likers: p.likers_sample || []
        })));
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const match = filterType === "all" || p.type === filterType;
      const s = search.toLowerCase();
      return match && (p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.author.toLowerCase().includes(s));
    });
  }, [posts, filterType, search]);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            
            {loading && <Loader2 className="animate-spin text-blue-600" />}
        </div>

        <div className="bg-white p-3 rounded-lg shadow-md flex flex-wrap gap-4 items-center border border-gray-100">
            <div className="flex gap-4 items-center flex-grow">
                <div className="relative max-w-sm flex-grow min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar em Título, Descrição ou Autor..." className="w-full pl-9 p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2 items-center text-sm text-gray-700">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="border border-gray-300 p-2 rounded-lg text-sm bg-white cursor-pointer">
                        {postTypesList.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-1 bg-gray-100 shrink-0">
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"}`}><LayoutGrid className="w-4 h-4" /></button>
            </div>
        </div>

        <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
            {filtered.map((post) => (
                <PostItem key={post.id} post={post} currentUserId={currentUserId} onRefresh={fetchPosts} />
            ))}
        </div>
    </div>
  );
}