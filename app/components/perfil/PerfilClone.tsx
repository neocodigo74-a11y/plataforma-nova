"use client";

import { useEffect, useState, ReactNode, Fragment } from "react";
import { supabase } from "@/lib/supabase";

import {
  MoreHorizontal,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Target,
  Crown,
  Languages,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COVER_HEIGHT = 150;

/* ======================= COMPONENT PRINCIPAL ======================= */
// Adicionei targetUserId como prop opcional
export default function PerfilClone({ targetUserId }: { targetUserId?: string }) {
  const [mounted, setMounted] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
  const [isOwner, setIsOwner] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cursosInscritos, setCursosInscritos] = useState<any[]>([]);
  const [cursosConcluidos, setCursosConcluidos] = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

  // Dados estáticos do seu código original
  const [idiomas] = useState([{ nome: "Inglês", nivel: "Fluente" }, { nome: "Mandarim", nivel: "Nível Intermediário" }]);
  const [recomendacoes] = useState<any[]>([]);
  const interessesHobbies = ["Escrita / Blog", "Arte e Design", "Fotografia / Videografia"];
  
  const avaliacaoSistema = {
    titulo: "Avaliação de Personalidade no Local de Trabalho",
    ultima_avaliacao: "2021-10-17",
    criterios: [
      { id: "aprendizagem", titulo: "Estilo de Aprendizagem Criativa", icon: "/aprendizagem.jpg", pontuacao: 9, maximo: 10 },
      { id: "estrutura", titulo: "Estrutura de trabalho", icon: "/aprendizagem.jpg", pontuacao: 9, maximo: 10 },
      { id: "positivo", titulo: "Ser positivo", icon: "/aprendizagem.jpg", pontuacao: 9, maximo: 10 },
      { id: "assertivo", titulo: "Ser assertivo", icon: "/aprendizagem.jpg", pontuacao: 8, maximo: 10 },
    ],
  };

  const habilidadesSistema = {
    titulo: "Habilidades de nível iniciante",
    habilidades: ["Saúde e Segurança", "Primeiro socorro", "Assistência médica", "Enfermagem", "RCP", "Ano de Transição", "Programas de Pré-Aprendizagem", "ODS 3"],
  };

  const isCriador = perfil?.email === "osvaniosilva74@gmail.com";

  /* ======================= DATA HANDLERS ======================= */
  
  async function carregarTudo() {
    setLoading(true);
    setLoadingCursos(true);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Prioridade: ID da URL (outro perfil) ou ID Logado (meu perfil)
    const effectiveId = targetUserId || currentUser?.id;

    if (!effectiveId) {
      setLoading(false);
      return;
    }

    // 1. Carregar Perfil do Usuário Alvo
    let { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", effectiveId)
      .single();

    // Criar perfil automaticamente se for o dono acessando pela primeira vez
    if (!usuario && effectiveId === currentUser?.id) {
      const nomeMeta = currentUser.user_metadata?.full_name || "Usuário";
      const { data: novo } = await supabase.from("usuarios").insert({
        id: effectiveId, nome: nomeMeta, tipo: "Estudante", created_at: new Date().toISOString()
      }).select("*").single();
      usuario = novo;
    }

    // 2. Definir se sou o dono desta página
    setIsOwner(currentUser?.id === effectiveId);

    // 3. Carregar Onboarding e Conexões
    const [{ data: onboarding }, { data: conexoes }] = await Promise.all([
      supabase.from("usuarios_onboarding").select("*").eq("id", effectiveId).single(),
      supabase.from("conexoes").select("*").or(`solicitante.eq.${effectiveId},receptor.eq.${effectiveId}`)
    ]);

    let seguindo = 0, seguidores = 0, networking = 0;
    conexoes?.forEach((c) => {
      if (c.solicitante === effectiveId) seguindo++;
      if (c.receptor === effectiveId) seguidores++;
      if (c.status === "aprovado") networking++;
    });

    setPerfil({
      ...usuario,
      objetivo: onboarding?.objetivo || null,
      funcoes_interesse: onboarding?.funcoes_interesse || [],
      seguindo, seguidores, networking,
    });
    setLoading(false);

    // 4. Carregar Cursos do Usuário Alvo
    const { data: cursosData } = await supabase
      .from("dashboard_cursos_progresso")
      .select("*")
      .eq("usuario_id", effectiveId)
      .order("data_inscricao", { ascending: false });

    const mapeados = cursosData?.map((c: any) => ({
      id: c.inscricao_id || c.id,
      titulo: c.curso_titulo || "Sem título",
      data: c.data_inscricao,
      concluido: (c.total_aulas > 0) && (c.aulas_concluidas >= c.total_aulas),
      imagem: c.curso_imagem || "/capa.png",
    })) || [];

    setCursosInscritos(mapeados);
    setCursosConcluidos(mapeados.filter(c => c.concluido));
    setLoadingCursos(false);
  }

  /* ======================= EFFECTS ======================= */
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted) {
      carregarTudo();
      const onScroll = () => setShowFixedHeader(window.scrollY > COVER_HEIGHT);
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [mounted, targetUserId]); // Recarrega se o ID na URL mudar

  if (!mounted || loading) return <div className="p-6 text-center">Carregando perfil...</div>;
  if (!perfil) return <div className="p-6 text-center">Usuário não encontrado</div>;

  const objetivoTextoMap: Record<string, string> = {
    iniciar_carreira: "Iniciar minha carreira em",
    mudar_carreira: "Mudar de carreira para",
    crescer_funcao: "Crescer profissionalmente em",
    explorar_topicos: "Explorar tópicos como",
    estagio_emprego: "Buscar estágio ou emprego em",
    freelancer: "Atuar como freelancer em",
  };

  return (
    <div className="min-h-screen bg-[#ffff]">
      {showFixedHeader && (
        <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b px-4 py-3">
          <p className="font-semibold text-sm">{perfil.nome}</p>
        </div>
      )}

      {/* CAPA */}
      <div className="relative">
        <img src={perfil.foto_capa || "/capa.png"} className="h-[150px] w-full object-cover" alt="Capa" />
        <button className="absolute top-4 right-4 bg-white rounded-xl p-2 shadow"><MoreHorizontal size={18} /></button>
        <div className="absolute -bottom-10 left-4">
          <img src={perfil.foto_perfil || "/avatar.png"} className="w-[88px] h-[88px] rounded-full border-[3px] border-white object-cover" alt="Avatar" />
        </div>
      </div>

      <div className="pt-14 px-4">
        <h1 className="text-[18px] font-semibold flex items-center gap-1">
          {perfil.nome}
          {perfil.verificado && <BadgeCheck size={16} className="text-yellow-500" />}
          {isCriador && (
            <div className="relative group">
              <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 shadow-[0_0_14px_rgba(236,72,153,0.5)]">
                <Crown size={12} /> Criador
              </motion.span>
            </div>
          )}
        </h1>

        {/* BOTÃO EDITAR (SÓ PARA O DONO) */}
        {isOwner && (
          <button onClick={() => setShowEditModal(true)} className="mt-3 w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition">
            Editar perfil
          </button>
        )}

     

        <div className="flex justify-around mt-6">
          <Stat value={perfil.seguindo} label="Seguindo" />
          <Stat value={perfil.seguidores} label="Seguidores" />
          <Stat value={perfil.networking} label="Networking" />
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">{membroHa(perfil.created_at)}</p>

        {/* TABS */}
        <div className="flex gap-6 mt-6 border-b text-[14px]">
          {["portfolio", "academico", "profissional", "eventos"].map((t) => (
            <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={activeTab === t} onClick={() => setActiveTab(t as TabType)} />
          ))}
        </div>

        {/* CONTEÚDO TABS */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {activeTab === "profissional" && (
                perfil.ocupacao || perfil.objetivo ? (
                  <>
                    <Info icon={<Briefcase size={16} />} text={perfil.ocupacao} />
                    <Info icon={<MapPin size={16} />} text={perfil.localizacao} />
                    <Info icon={<Phone size={16} />} text={perfil.contacto} />
                    {perfil.objetivo && (
                      <div className="flex gap-2 text-[13px] text-gray-700">
                        <Target size={14} />
                        <span>{objetivoTextoMap[perfil.objetivo]} {perfil.funcoes_interesse?.join(", ")}</span>
                      </div>
                    )}
                  </>
                ) : <p className="text-gray-500 text-center">Sem informações profissionais</p>
              )}

              {activeTab === "portfolio" && (
                loadingCursos ? <p className="text-center">Carregando...</p> :
                cursosConcluidos.length > 0 ? cursosConcluidos.map(c => (
                  <div key={c.id} className="p-3 border rounded-md">
                    <p className="font-semibold">{c.titulo}</p>
                    <p className="text-xs text-gray-500">Concluído em: {formatDate(c.data)}</p>
                  </div>
                )) : <p className="text-center text-gray-500">Nenhum curso concluído</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* IDIOMAS E PONTOS FORTES (Mantendo seu layout) */}
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Languages size={18} /> Idiomas</h3>
            {idiomas.map((id, i) => <div key={i} className="flex justify-between text-[13px] mb-1"><span>{id.nome}</span><span className="text-gray-500">{id.nivel}</span></div>)}
          </div>

          <div className="bg-[#1f3b63] rounded-t-xl px-4 py-3"><h3 className="text-sm font-semibold text-white">Principais pontos fortes</h3></div>
          <div className="grid grid-cols-2 border border-gray-200 divide-x divide-y">
            {avaliacaoSistema.criterios.map((item) => (
              <div key={item.id} className="p-4 flex flex-col items-center text-center gap-2">
                <img src={item.icon} className="w-14 h-14" alt="" />
                <p className="text-sm font-medium">{item.titulo}</p>
                <span className="text-blue-600 font-bold">{item.pontuacao}/{item.maximo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CURSOS CONCLUÍDOS (RODAPÉ) */}
        <div className="mt-6 bg-white/70 rounded-xl border border-gray-200 p-4 mb-10">
          <h3 className="text-sm font-semibold mb-3">Cursos concluídos ({cursosConcluidos.length})</h3>
          {cursosConcluidos.map((curso) => (
            <div key={curso.id} className="flex items-center gap-3 py-2">
              <img src={curso.imagem} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1">
                <p className="text-[13px] font-medium flex items-center gap-1">{curso.titulo} <ExternalLink size={14}/></p>
                <p className="text-xs text-green-600">{formatDate(curso.data)}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ======================= AUXILIARES ======================= */
function Stat({ value, label }: any) {
  return (
    <div className="text-center">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Tab({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`pb-3 ${active ? "border-b-2 border-black font-semibold" : "text-gray-400"}`}>
      {label}
    </button>
  );
}

function Info({ icon, text }: any) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-3 text-[13px] text-gray-700">
      <span className="text-gray-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR");
}

function membroHa(date: string) {
  if (!date) return "";
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30));
  return diff < 1 ? "Membro há menos de 1 mês" : `Membro há ${diff} meses`;
}

type TabType = "portfolio" | "academico" | "profissional" | "eventos";