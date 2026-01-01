"use client";

import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Fragment } from "react";
import EditPerfilModal from "../components/EditPerfilModal";


import {
  MoreHorizontal,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Users,
  Target,Crown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COVER_HEIGHT = 150;

interface InfoProps {
  icon: ReactNode;
  text?: string | null;
}

type TabType = "portfolio" | "academico" | "profissional" | "eventos";

/* ======================= UTIL ======================= */
function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function membroHa(date: string) {
  const start = new Date(date);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (diff < 1) return "Membro há menos de 1 mês";
  if (diff === 1) return "Membro há 1 mês";
  return `Membro há ${diff} meses`;
}

/* ======================= COMPONENT ======================= */
export default function PerfilClone() {
  const [mounted, setMounted] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFixedHeader, setShowFixedHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
const [isOwner, setIsOwner] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
  const [cursosInscritos, setCursosInscritos] = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
const isCriador =
  perfil?.email === "osvaniosilva74@gmail.com";

  /* ======================= EFFECTS ======================= */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    carregarPerfil();
    carregarCursos();

    const onScroll = () =>
      setShowFixedHeader(window.scrollY > COVER_HEIGHT);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  /* ======================= DATA ======================= */
  async function carregarPerfil() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();
setIsOwner(user.id === usuario.id);

    const { data: onboarding } = await supabase
      .from("usuarios_onboarding")
      .select("objetivo, funcoes_interesse")
      .eq("id", user.id)
      .single();

    const { data: conexoes } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${user.id},receptor.eq.${user.id}`);

    let seguindo = 0,
      seguidores = 0,
      networking = 0;

    conexoes?.forEach((c) => {
      if (c.solicitante === user.id) seguindo++;
      if (c.receptor === user.id) seguidores++;
      if (c.status === "aprovado") networking++;
    });

    setPerfil({
      ...usuario,
      objetivo: onboarding?.objetivo || null,
      funcoes_interesse: onboarding?.funcoes_interesse || [],
      seguindo,
      seguidores,
      networking,
    });

    setLoading(false);
  }

  async function carregarCursos() {
    setLoadingCursos(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoadingCursos(false);

   const { data } = await supabase
  .from("dashboard_cursos_progresso")
  .select(`
    id,
    usuario_id,
    curso_id,
    data_inscricao,
    aulas_concluidas,
    total_aulas,
    cursos_academia (
      titulo
    )
  `)
  .eq("usuario_id", user.id)
  .order("data_inscricao", { ascending: false });

  }

  if (loading) {
    return <div className="p-6 text-center">Carregando perfil...</div>;
  }

  if (!perfil) return null;

  /* ======================= MAP ======================= */
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

  /* ======================= UI ======================= */
  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {showFixedHeader && (
        <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b px-4 py-3">
          <p className="font-semibold text-sm">{perfil.nome}</p>
        </div>
      )}

      {/* CAPA */}
      <div className="relative">
        <img
          src={perfil.foto_capa || "/capa.png"}
          className="h-[150px] w-full object-cover"
          alt="Capa"
        />
        <button className="absolute top-4 right-4 bg-white rounded-xl p-2 shadow">
          <MoreHorizontal size={18} />
        </button>
        <div className="absolute -bottom-10 left-4">
          <img
            src={perfil.foto_perfil || "/avatar.png"}
            className="w-[88px] h-[88px] rounded-full border-[3px] border-white object-cover"
            alt="Avatar"
          />
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="pt-14 px-4">
        <h1 className="text-[18px] font-semibold flex items-center gap-1">
          {perfil.nome}
          {perfil.verificado && (
            <BadgeCheck size={16} className="text-yellow-500" />
          )}
{isCriador && (
  <div className="relative group">
   <motion.span
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{
    opacity: 1,
    scale: [1, 1.06, 1],
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    repeatDelay: 1,
  }}
  className="
    flex items-center gap-1 text-xs font-semibold text-white
    px-2.5 py-0.5 rounded-full
    bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400
    bg-[length:200%_200%] shadow-[0_0_14px_rgba(236,72,153,0.5)]
    pointer-events-none
  "
>
  <Crown size={12} className="animate-pulse" />
  Criador
</motion.span>


    {/* TOOLTIP */}
    <div
      className="
        absolute -bottom-9 left-1/2 -translate-x-1/2
        whitespace-nowrap
        bg-black text-white text-[10px]
        px-2 py-1 rounded
        opacity-0 group-hover:opacity-100
        transition
        pointer-events-none
      "
    >
      Criador da plataforma
    </div>
  </div>
)}
     </h1>
{isOwner && (
  <button
    onClick={() => setShowEditModal(true)}
    className="mt-3 w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition"
  >
    Editar perfil
  </button>
)}


{showEditModal && (
  <EditPerfilModal
    perfil={perfil}
    onClose={() => setShowEditModal(false)}
    onUpdate={(updated) => setPerfil(updated)}
  />
)}


        <div className="flex justify-around mt-6">
          <Stat value={perfil.seguindo} label="Seguindo" />
          <Stat value={perfil.seguidores} label="Seguidores" />
          <Stat value={perfil.networking} label="Networking" />
        </div>
<p className="text-xs text-gray-500 text-center mt-2">
  {membroHa(perfil.created_at)}
</p>

        {/* TABS */}
        <div className="flex gap-6 mt-6 border-b text-[14px]">
          <Tab label="Portfólio" active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")} />
          <Tab label="Académico" active={activeTab === "academico"} onClick={() => setActiveTab("academico")} />
          <Tab label="Profissional" active={activeTab === "profissional"} onClick={() => setActiveTab("profissional")} />
          <Tab label="Eventos" active={activeTab === "eventos"} onClick={() => setActiveTab("eventos")} />
        </div>

        {/* CONTEÚDO DAS TABS */}
        <div className="mt-6 bg-white rounded-xl px-4 py-3 shadow-sm min-h-[160px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* PROFISSIONAL */}
              {activeTab === "profissional" &&
  (perfil.ocupacao || perfil.objetivo ? (
    <Fragment key="profissional">
      <Info icon={<Briefcase size={16} />} text={perfil.ocupacao} />
      <Info icon={<MapPin size={16} />} text={perfil.localizacao} />
      <Info icon={<Phone size={16} />} text={perfil.contacto} />

      {perfil.objetivo && (
        <div className="flex gap-2 text-[13px] text-gray-700">
          <Target size={14} />
          <span>
            {objetivoTextoMap[perfil.objetivo]}{" "}
            {perfil.funcoes_interesse.join(", ")}
          </span>
        </div>
      )}
    </Fragment>
  ) : (
    <p className="text-gray-500 text-center">
      Nenhuma informação profissional adicionada
    </p>
  ))}


              {/* ACADÉMICO */}
            {activeTab === "academico" &&
  (perfil.curso || perfil.universidade ? (
    <Fragment key="academico">
      <Info icon={<BookOpen size={16} />} text={perfil.curso} />
      <Info icon={<GraduationCap size={16} />} text={perfil.universidade} />
    </Fragment>
  ) : (
    <p className="text-gray-500 text-center">
      Nenhuma informação académica
    </p>
  ))}


         {/* PORTFÓLIO */}
{activeTab === "portfolio" && (
  loadingCursos ? (
    <p className="text-gray-500 text-center">
      Carregando cursos...
    </p>
  ) : cursosInscritos.filter(c => c.concluido).length === 0 ? (
    <p className="text-gray-500 text-center">
      Nenhum curso concluído
    </p>
  ) : (
    cursosInscritos
      .filter(c => c.concluido)
      .map((curso) => (
        <div
          key={curso.id}
          className="p-3 border rounded-md"
        >
          <p className="font-semibold">
            {curso.titulo}
          </p>

          <p className="text-xs text-gray-500">
            Concluído em: {formatDate(curso.data_inscricao)}
          </p>
        </div>
      ))
  )
)}



              {/* EVENTOS */}
              {activeTab === "eventos" && (
                <p className="text-gray-500 text-center">
                  Nenhum evento disponível
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ======================= AUX ======================= */
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
    <button
      onClick={onClick}
      className={`pb-3 ${
        active ? "border-b-2 border-black font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </button>
  );
}

function Info({ icon, text }: InfoProps) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-3 text-[13px] text-gray-700">
      <span className="text-gray-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
