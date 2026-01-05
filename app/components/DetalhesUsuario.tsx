"use client";

import React, { useEffect, useState, Fragment } from "react";

import { supabase } from "@/lib/supabase";
import { UserPlus, Verified, BadgeCheck, Crown, Briefcase, MapPin, Phone, Target, BookOpen, GraduationCap, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditPerfilModal from "../components/EditPerfilModal";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  tipo: string;
  email?: string;
  foto_perfil?: string;
  foto_capa?: string;
  bio?: string;
  verificado?: boolean;
  premium?: boolean;
  criador?: boolean;
  ocupacao?: string;
  localizacao?: string;
  contacto?: string;
  objetivo?: string;
  funcoes_interesse?: string[];
  curso?: string;
  universidade?: string;
  seguindo?: number;
  seguidores?: number;
  networking?: number;
  created_at?: string;
}

interface Conexao {
  id: string;
  status: "pendente" | "aprovado";
  solicitante: string;
  receptor: string;
}

interface Curso {
  id: string;
  titulo: string;
  data_inscricao: string;
  concluido: boolean;
}

type TabType = "portfolio" | "academico" | "profissional" | "eventos";

const COVER_HEIGHT = 150;
/* ================== PROPS ================== */
interface DetalhesUsuarioProps {
  usuarioId: string;
  usuarioLogadoId: string;
  onBack?: () => void;
}

/* ================== COMPONENT ================== */
export default function DetalhesUsuario({
  usuarioId,
  usuarioLogadoId,
  onBack,
}: DetalhesUsuarioProps) {

  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [conexao, setConexao] = useState<Conexao | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
const router = useRouter();

  const isCriador = perfil?.email === "osvaniosilva74@gmail.com";

  /* ======================= EFFECTS ======================= */
  useEffect(() => {
    carregarPerfil();
    carregarConexao();
    carregarCursos();

    const onScroll = () => setShowFixedHeader(window.scrollY > COVER_HEIGHT);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [usuarioId]);

  async function carregarPerfil() {
    setLoading(true);
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", usuarioId)
      .single();

    const { data: onboarding } = await supabase
      .from("usuarios_onboarding")
      .select("objetivo, funcoes_interesse")
      .eq("id", usuarioId)
      .single();

    const { data: conexoes } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${usuarioId},receptor.eq.${usuarioId}`);

    let seguindo = 0, seguidores = 0, networking = 0;
    conexoes?.forEach((c: any) => {
      if (c.solicitante === usuarioId) seguindo++;
      if (c.receptor === usuarioId) seguidores++;
      if (c.status === "aprovado") networking++;
    });

    setPerfil({
      ...usuario,
      criador: usuario?.email === "osvaniosilva74@gmail.com",
      objetivo: onboarding?.objetivo,
      funcoes_interesse: onboarding?.funcoes_interesse || [],
      seguindo,
      seguidores,
      networking,
    });

    setIsOwner(usuarioId === usuarioLogadoId);
    setLoading(false);
  }

  async function carregarCursos() {
    setLoadingCursos(true);
    const { data } = await supabase
      .from("dashboard_cursos_progresso")
      .select(`id, data_inscricao, aulas_concluidas, total_aulas, cursos_academia(titulo)`)
      .eq("usuario_id", usuarioId);

    const cursosFormatados: Curso[] = (data || []).map((c: any) => ({
      id: c.id,
      titulo: c.cursos_academia?.titulo || "Curso",
      data_inscricao: c.data_inscricao,
      concluido: c.aulas_concluidas >= c.total_aulas,
    }));

    setCursos(cursosFormatados);
    setLoadingCursos(false);
  }

  async function carregarConexao() {
    const { data } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${usuarioLogadoId},receptor.eq.${usuarioLogadoId}`)
      .eq("solicitante", usuarioLogadoId)
      .eq("receptor", usuarioId)
      .single();

    setConexao(data || null);
  }

  async function iniciarConexao() {
    if (!usuarioLogadoId || !usuarioId) return;
    const { data } = await supabase.from("conexoes").insert({
      solicitante: usuarioLogadoId,
      receptor: usuarioId,
      status: "pendente",
    }).select().single();
    setConexao(data || { status: "pendente", solicitante: usuarioLogadoId, receptor: usuarioId, id: "" });
  }

  async function aceitarConexao() {
    if (!conexao) return;
    await supabase.from("conexoes").update({ status: "aprovado" }).eq("id", conexao.id);
    setConexao({ ...conexao, status: "aprovado" });
  }

  async function recusarConexao() {
    if (!conexao) return;
    await supabase.from("conexoes").delete().eq("id", conexao.id);
    setConexao(null);
  }

  if (loading) return <p className="p-4 text-center">Carregando perfil...</p>;
  if (!perfil) return <p className="p-4 text-center">Usuário não encontrado</p>;

  const objetivoTextoMap: Record<string, string> = {
    iniciar_carreira: "Iniciar minha carreira em",
    mudar_carreira: "Mudar de carreira para",
    crescer_funcao: "Crescer profissionalmente em",
    explorar_topicos: "Explorar tópicos como",
    estagio_emprego: "Buscar estágio ou emprego em",
    freelancer: "Atuar como freelancer em",
    consultoria: "Atuar em consultoria em",
    oportunidades_projeto: "Participar de projetos em",
  };

  function formatDate(date: string) {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  }

  function membroHa(date?: string) {
    if (!date) return "";
    const start = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000*60*60*24*30));
    if (diff < 1) return "Membro há menos de 1 mês";
    if (diff === 1) return "Membro há 1 mês";
    return `Membro há ${diff} meses`;
  }

  return (
    <div className="w-full bg-[#ffff]  mt-8">
      {/* FIXED HEADER */}
    {showFixedHeader && (
  <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center gap-3">
    
    <button
      onClick={() => router.back()}
      className="p-1 rounded-full hover:bg-gray-100 transition"
      aria-label="Voltar"
    >
      <ArrowLeft size={20} />
    </button>

    <p className="font-semibold text-sm truncate">{perfil.nome}</p>
  </div>
)}
{/*
<div className="flex items-center gap-2 px-4 mb-2">
{onBack && (
  <button
    onClick={onBack}
    className="flex items-center gap-2 text-sm mb-3 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 w-max"
  >
    ← Voltar
  </button>
)}

</div>  codigo para voltar */}


      {/* CAPA */}
      <div className="relative">
        <img src={perfil.foto_capa || "/capa.png"} className="h-[150px] w-full object-cover rounded-xl" />
        <div className="absolute -bottom-10 left-4">
          <img src={perfil.foto_perfil || "/avatar.png"} className="w-[88px] h-[88px] rounded-full border-[3px] border-white object-cover" />
        </div>
        {isOwner && (
          <button onClick={()=>setShowEditModal(true)} className="absolute top-4 right-4 bg-white rounded-xl p-2 shadow">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {/* RESTANTE DO PERFIL */}
      <div className="mt-12">
        <h1 className="text-[18px] font-semibold flex items-center gap-2">
          {perfil.nome} {perfil.verificado && <BadgeCheck size={16} className="text-yellow-500" />}
          {isCriador && (
            <div className="relative group">
              <motion.span
                initial={{ scale:0.8, opacity:0 }}
                animate={{ opacity:1, scale:[1,1.06,1], backgroundPosition:["0% 50%","100% 50%","0% 50%"] }}
                transition={{ duration:2, repeat:Infinity, repeatDelay:1 }}
                className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 bg-[length:200%_200%] shadow-[0_0_14px_rgba(236,72,153,0.5)] pointer-events-none"
              >
                <Crown size={12} className="animate-pulse" /> Criador
              </motion.span>
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Criador da plataforma
              </div>
            </div>
          )}
        </h1>
        <p className="text-gray-500 text-sm">{perfil.tipo}</p>
        {perfil.bio && <p className="text-gray-600 text-sm mt-2">{perfil.bio}</p>}

        {/* ESTATÍSTICAS */}
        <div className="flex justify-around mt-4">
          <Stat value={perfil.seguindo || 0} label="Seguindo" />
          <Stat value={perfil.seguidores || 0} label="Seguidores" />
          <Stat value={perfil.networking || 0} label="Networking" />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">{membroHa(perfil.created_at)}</p>
      </div>

      {/* TABS E CONTEÚDO */}
      {/* TABS */}
      <div className="flex gap-6 mt-6 border-b text-[14px]">
        <Tab label="Portfólio" active={activeTab==="portfolio"} onClick={()=>setActiveTab("portfolio")} />
        <Tab label="Acadêmico" active={activeTab==="academico"} onClick={()=>setActiveTab("academico")} />
        <Tab label="Profissional" active={activeTab==="profissional"} onClick={()=>setActiveTab("profissional")} />
        <Tab label="Eventos" active={activeTab==="eventos"} onClick={()=>setActiveTab("eventos")} />
      </div>

      {/* CONTEÚDO DAS TABS */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 px-4 py-3 m min-h-[160px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div key={activeTab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.25 }} className="space-y-3">
            
            {/* PORTFÓLIO */}
            {activeTab==="portfolio" && (
              loadingCursos ? <p className="text-gray-500 text-center">Carregando cursos...</p> :
              cursos.filter(c=>c.concluido).length===0 ? <p className="text-gray-500 text-center">Nenhum curso concluído</p> :
              cursos.filter(c=>c.concluido).map(c=>(
                <div key={c.id} className="p-3 border rounded-md">
                  <p className="font-semibold">{c.titulo}</p>
                  <p className="text-xs text-gray-500">Concluído em: {formatDate(c.data_inscricao)}</p>
                </div>
              ))
            )}

            {/* ACADÊMICO */}
            {activeTab==="academico" && (
              (perfil.curso || perfil.universidade) ? (
                <Fragment>
                  {perfil.curso && <Info icon={<BookOpen size={16}/>} text={perfil.curso} />}
                  {perfil.universidade && <Info icon={<GraduationCap size={16}/>} text={perfil.universidade} />}
                </Fragment>
              ) : <p className="text-gray-500 text-center">Nenhuma informação académica</p>
            )}

            {/* PROFISSIONAL */}
            {activeTab==="profissional" && (
              (perfil.ocupacao || perfil.localizacao || perfil.contacto || perfil.objetivo) ? (
                <Fragment>
                  {perfil.ocupacao && <Info icon={<Briefcase size={16}/>} text={perfil.ocupacao} />}
                  {perfil.localizacao && <Info icon={<MapPin size={16}/>} text={perfil.localizacao} />}
                  {perfil.contacto && <Info icon={<Phone size={16}/>} text={perfil.contacto} />}
                  {perfil.objetivo && (
                    <div className="flex gap-2 text-[13px] text-gray-700">
                      <Target size={14}/>
                      <span>{objetivoTextoMap[perfil.objetivo]} {perfil.funcoes_interesse?.join(", ")}</span>
                    </div>
                  )}
                </Fragment>
              ) : <p className="text-gray-500 text-center">Nenhuma informação profissional adicionada</p>
            )}

            {/* EVENTOS */}
            {activeTab==="eventos" && (
              <p className="text-gray-500 text-center">Nenhum evento disponível</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CONEXÃO */}
      <div className="mt-4">
        {conexao?.status==="aprovado" ? (
          <div className="px-3 py-1 rounded-full bg-gray-500 text-white text-sm w-max">Networking</div>
        ) : conexao?.status==="pendente" ? (
          conexao.receptor===usuarioLogadoId ? (
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-500 text-white rounded-full" onClick={aceitarConexao}>Aceitar</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded-full" onClick={recusarConexao}>Recusar</button>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-gray-400 text-white text-sm w-max">Pendente</div>
          )
        ) : (
          <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-sm mt-2" onClick={iniciarConexao}>
            <UserPlus size={16}/> Conectar
          </button>
        )}
      </div>

      {showEditModal && isOwner && (
        <EditPerfilModal perfil={perfil} onClose={()=>setShowEditModal(false)} onUpdate={(u)=>setPerfil(u)} />
      )}
    </div>
  );
}

/* ================== AUX ================== */
function Info({ icon, text }: { icon: React.ReactNode; text?: string }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-3 text-[13px] text-gray-700">
      <span className="text-gray-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: ()=>void }) {
  return (
    <button onClick={onClick} className={`pb-3 ${active ? "border-b-2 border-black font-semibold" : "text-gray-400"}`}>{label}</button>
  );
}
