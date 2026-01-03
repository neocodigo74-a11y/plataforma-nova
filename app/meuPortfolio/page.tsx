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


          {/* ANEXOS */}
<div className="mt-6 space-y-4">

  {/* PROFICIÊNCIA EM IDIOMAS */}
  <div className="bg-white rounded-xl border border-gray-200 p-4 ">
    <div className="flex items-center gap-2 mb-3">
      <Languages size={18} className="text-gray-700" />
      <h3 className="text-sm font-semibold">
        Proficiência em idiomas
      </h3>
    </div>

    <div className="space-y-2">
      {idiomas.map((idioma, i) => (
        <div
          key={i}
          className="flex justify-between text-[13px]"
        >
          <span className="font-medium text-gray-800">
            {idioma.nome}
          </span>
          <span className="text-gray-600">
            {idioma.nivel}
          </span>
        </div>
      ))}
    </div>
  </div>


  {/* RECOMENDAÇÕES RECEBIDAS */}
  <div className="bg-white rounded-xl p-4 rounded-xl border border-gray-200 p-4">
    <div className="flex items-center gap-2 mb-3">
      <ThumbsUp size={18} className="text-gray-700" />
      <h3 className="text-sm font-semibold">
        Recomendações recebidas
      </h3>
    </div>

    {recomendacoes.length === 0 ? (
      <p className="text-[13px] text-gray-500">
        Nenhuma recomendação
      </p>
    ) : (
      <div className="space-y-3">
        {recomendacoes.map((rec) => (
          <div
            key={rec.id}
            className="border rounded-lg p-3 text-[13px]"
          >
            <p className="text-gray-800">{rec.texto}</p>
            <span className="text-xs text-gray-500">
              — {rec.autor}
            </span>
          </div>
        ))}
      </div>
    )}

    <button className="mt-3 text-[13px] text-blue-600 font-medium">
      + Recomendar {perfil.nome.split(" ")[0]}
    </button>
  </div>

</div>
<div className="mt-6 bg-white rounded-xl overflow-hidden border border-gray-200">

  {/* HEADER */}
  <div className="bg-[#1f3b63] px-4 py-3">
    <h3 className="text-sm font-semibold text-white">
      Principais pontos fortes no ambiente de trabalho
    </h3>
  </div>

  {/* GRID */}
  <div className="grid grid-cols-2 divide-x divide-y">
    {avaliacaoSistema.criterios.map((item) => {
      const percentual = calcularPercentual(
        item.pontuacao,
        item.maximo
      );

      return (
        <div
          key={item.id}
          className="p-4 flex flex-col items-center text-center gap-2"
        >
          <img
            src={item.icon}
            className="w-14 h-14"
            alt={item.titulo}
          />

          <p className="text-sm font-medium text-gray-800">
            {item.titulo}
          </p>

          <span className="text-blue-600 font-semibold text-sm">
            {item.pontuacao}/{item.maximo}
          </span>

          <span className="text-[11px] text-gray-500">
            {nivelAvaliacao(percentual)}
          </span>
        </div>
      );
    })}
  </div>

  {/* FOOTER */}
  <div className="bg-gray-50 px-4 py-3 text-center text-[12px] text-gray-600">
    Esses resultados são derivados da
    <span className="font-medium text-blue-700">
      {" "}{avaliacaoSistema.titulo}
    </span>
    .
    <br />
    Último teste realizado em{" "}
    {new Date(avaliacaoSistema.ultima_avaliacao).toLocaleDateString("pt-PT")}
  </div>

  {/* CTA */}
  <button className="w-full bg-[#1f3b63] text-white text-sm font-medium py-3 hover:bg-[#183153] transition">
    Solicitar relatório completo
  </button>

</div>

{/* HABILIDADES */}
<div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
  <h3 className="text-sm font-semibold text-gray-800 mb-3">
    Habilidades que possuo
  </h3>

  <div className="flex items-center justify-between mb-2">
    <h4 className="text-[12px] font-medium text-gray-700">
      {habilidadesSistema.titulo}
    </h4>
  </div>

  <div className="flex flex-wrap gap-2">
    {habilidadesSistema.habilidades.map((habilidade, i) => (
      <div
        key={i}
        className="
          flex items-center gap-2
          px-3 py-2
          rounded-full
          border border-blue-200
          bg-white
          text-[13px]
          text-gray-700
        "
      >
        <img
          src="/google-skill.svg"
          alt="skill"
          className="w-4 h-4"
        />
        {habilidade}
      </div>
    ))}
  </div>
</div>

{/* INTERESSES E HOBBIES */}
<div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
  <div className="flex items-center gap-2 mb-3">
    <span className="text-lg">🎹</span>
    <h3 className="text-sm font-semibold text-gray-800">
      Interesses e Hobbies
    </h3>
  </div>

  <div className="flex flex-wrap gap-3">
    {interessesHobbies.map((item, i) => (
      <span
        key={i}
        className="
          px-4 py-2
          rounded-full
          bg-gray-100
          text-[13px]
          text-gray-700
        "
      >
        {item}
      </span>
    ))}
  </div>
</div>


{/* CURSOS CONCLUÍDOS */}
<div className="mt-2 bg-white/70 rounded-xl border border-gray-200 p-4">
  <div className="flex items-center gap-2 mb-3">
    <img
      src="/nova.svg"
      alt="Cursos"
      className="w-7 h-7"
    />
    <h3 className="text-sm font-semibold">
      Cursos concluídos ({cursosConcluidos.length})
    </h3>
  </div>

  {loadingCursos ? (
    <p className="text-sm text-gray-400">
      Carregando cursos...
    </p>
  ) : cursosConcluidos.length === 0 ? (
    <p className="text-sm text-gray-500">
      Nenhum curso concluído
    </p>
  ) : (
    cursosConcluidos.map((curso) => (
      <div
        key={curso.id}
        className="flex items-center gap-3 py-2 bg-white/30 rounded-lg p-2"
      >
        <img
          src={curso.imagem}
          alt={curso.titulo}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
        />

        <div className="flex-1">
          <div className="flex items-center gap-1 text-[13px] font-medium">
            {curso.titulo}
            <ExternalLink
              size={14}
              className="text-gray-500"
            />
          </div>

          <p className="text-xs text-green-600">
            {new Date(curso.data).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    ))
  )}

  {cursosConcluidos.length > 0 && (
    <button className="mt-3 text-[13px] text-center text-gray-600 font-medium hover:underline">
      Ver todos os cursos concluídos
    </button>
  )}
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
