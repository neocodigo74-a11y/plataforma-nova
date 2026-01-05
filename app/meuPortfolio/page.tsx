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
  Target,Crown ,Languages,
ThumbsUp,  ExternalLink

} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COVER_HEIGHT = 150;

interface InfoProps {
  icon: ReactNode;
  text?: string | null;
}

type TabType = "portfolio" | "academico" | "profissional" | "eventos";
interface CursoConcluido {
  id: string;
  titulo: string;
  imagem: string;
  data: string;
}

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
  const [idiomas] = useState([
  { nome: "Inglês", nivel: "Fluente" },
  { nome: "Mandarim", nivel: "Nível Intermediário" },
]);
const [cursosConcluidos, setCursosConcluidos] = useState<any[]>([]);


const avaliacaoSistema = {
  titulo: "Avaliação de Personalidade no Local de Trabalho",
  ultima_avaliacao: "2021-10-17",
  criterios: [
    {
      id: "aprendizagem",
      titulo: "Estilo de Aprendizagem Criativa",
      icon: "/aprendizagem.jpg",
      pontuacao: 9,
      maximo: 10,
    },
    {
      id: "estrutura",
      titulo: "Estrutura de trabalho",
      icon: "/aprendizagem.jpg",
      pontuacao: 9,
      maximo: 10,
    },
    {
      id: "positivo",
      titulo: "Ser positivo",
      icon: "/aprendizagem.jpg",
      pontuacao: 9,
      maximo: 10,
    },
    {
      id: "assertivo",
      titulo: "Ser assertivo",
      icon: "/aprendizagem.jpg",
      pontuacao: 8,
      maximo: 10,
    },
  ],
};

const habilidadesSistema = {
  nivel: "iniciante",
  titulo: "Habilidades de nível iniciante",
  habilidades: [
    "Saúde e Segurança",
    "Primeiro socorro",
    "Assistência médica",
    "Enfermagem",
    "RCP",
    "Ano de Transição: Desenvolvimento Moral, Social e Pessoal",
    "Programas de Pré-Aprendizagem",
    "ODS 3: Boa Saúde e Bem-Estar",
  ],
};
const interessesHobbies = [
  "Escrita / Blog",
  "Arte e Design",
  "Fotografia / Videografia",
];


const [recomendacoes] = useState<any[]>([]);

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

  // 1️⃣ Verifica se o usuário existe na tabela 'usuarios'
  let { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2️⃣ Se não existir, cria registro automático
  if (!usuario) {
    const nomeDoMetadata = user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";
    
    const { data: novoUsuario } = await supabase.from("usuarios").insert({
      id: user.id,
      nome: nomeDoMetadata,
      tipo: "Estudante", // padrão, pode ajustar conforme seu app
      created_at: new Date().toISOString()
    }).select("*").single();

    usuario = novoUsuario; // garante que 'usuario' tem o valor para continuar
  }

  // 3️⃣ Define se é dono do perfil
  setIsOwner(user.id === usuario.id);

  // 4️⃣ Carrega dados de onboarding
  const { data: onboarding } = await supabase
    .from("usuarios_onboarding")
    .select("objetivo, funcoes_interesse")
    .eq("id", user.id)
    .single();

  // 5️⃣ Carrega conexões
  const { data: conexoes } = await supabase
    .from("conexoes")
    .select("*")
    .or(`solicitante.eq.${user.id},receptor.eq.${user.id}`);

  let seguindo = 0, seguidores = 0, networking = 0;
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
  if (!user) {
    setLoadingCursos(false);
    return;
  }

  try {
    // Buscar cursos do usuário usando a view
    const { data, error } = await supabase
      .from("dashboard_cursos_progresso")
      .select("*")
      .eq("usuario_id", user.id)
      .order("data_inscricao", { ascending: false });

    if (error) {
      console.error("Erro ao carregar cursos:", error);
      setLoadingCursos(false);
      return;
    }

    if (!data || data.length === 0) {
      setCursosInscritos([]);
      setCursosConcluidos([]);
      setLoadingCursos(false);
      return;
    }

    console.log("Cursos recebidos da view:", data); // <- útil para debugging

    // Processa cada curso
    const cursos = data.map((c: any) => {
      const total = c.total_aulas ?? 0; // fallback caso seja null
      const concluidas = c.aulas_concluidas ?? 0;

      return {
        id: c.inscricao_id || c.id,
        titulo: c.curso_titulo || c.titulo || c.cursos_academia?.titulo || "Sem título",
        data: c.data_inscricao,
        total_aulas: total,
        aulas_concluidas: concluidas,
        concluido: total > 0 && concluidas >= total,
        imagem: c.curso_imagem || "/capa.png", // caso tenha campo de imagem
      };
    });

    // Atualiza estados
    setCursosInscritos(cursos);
    setCursosConcluidos(cursos.filter(c => c.concluido));
  } catch (err) {
    console.error("Erro ao carregar cursos:", err);
  } finally {
    setLoadingCursos(false);
  }
}


function calcularPercentual(valor: number, max: number) {
  return Math.round((valor / max) * 100);
}

function nivelAvaliacao(percentual: number) {
  if (percentual >= 90) return "Excelente";
  if (percentual >= 75) return "Muito bom";
  if (percentual >= 60) return "Bom";
  return "Em desenvolvimento";
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
    <div className="min-h-screen bg-[#ffff]">
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
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 px-4 py-3 m min-h-[160px]">
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
