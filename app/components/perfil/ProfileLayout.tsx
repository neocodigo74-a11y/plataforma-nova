"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  BadgeCheck,
  Crown,
  Languages,
  ThumbsUp,
  ExternalLink,
  UserPlus,
  Check,
  Briefcase,
  MapPin,
  Phone,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import EditPerfilModal from "../EditPerfilModal";
import { useRouter } from "next/navigation";
import AddIdiomaModal from "../AddIdiomaModal";
import AddInteresseModal from "../AddInteresseModal";


/* =======================
   Funções auxiliares
======================= */
function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function membroHa(date: string) {
  if (!date) return "";
  const start = new Date(date);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  if (diff < 1) return "Membro há menos de 1 mês";
  return `Membro há ${diff} meses`;
}

function calcularPercentual(pontuacao: number, maximo: number) {
  return Math.round((pontuacao / maximo) * 100);
}

function nivelAvaliacao(percentual: number) {
  if (percentual >= 90) return "Excelente";
  if (percentual >= 70) return "Bom";
  if (percentual >= 50) return "Médio";
  return "Baixo";
}

/* =======================
   Componentes auxiliares
======================= */
function Stat({ value, label }: any) {
  return (
    <div className="text-center">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
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

function Card({ icon, title, children }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* =======================
   Componente Principal
======================= */
interface ProfileLayoutProps {
  perfil: any;
  cursosInscritos?: any[]; // <--- adicionar
  cursosConcluidos: any[];
  loadingCursos: boolean;
  isOwner: boolean;
  idiomas?: { id?: string; nome: string; nivel: string }[];
  conexao?: any;
  interessesHobbies?: string[];
  habilidades?: { id?: string; nome: string }[]; 
  usuarioLogadoId?: string | null;
  onConectar?: () => void;
  onAceitar?: () => void;
  onRecusar?: () => void;
  onUpdatePerfil: (updated: any) => void;
   onNavigate?: (destino: string) => void;
}


export default function ProfileLayout({
  perfil,
  cursosConcluidos,
  loadingCursos,
  isOwner,
   interessesHobbies = [],
  idiomas = [], // <- valor padrão
  habilidades = [],
  onUpdatePerfil,
  conexao,
  usuarioLogadoId,
  onConectar,
  onAceitar,
  onRecusar,
  onNavigate,
  
}: ProfileLayoutProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showAddIdiomaModal, setShowAddIdiomaModal] = useState(false);
  const router = useRouter();
  const isCriador = perfil?.email === "osvaniosilva74@gmail.com";
 const [showAddInteresseModal, setShowAddInteresseModal] = useState(false);
const interessesHobbiesState = interessesHobbies || [];






  /* =======================
     Scroll Listener
  ======================== */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 180) setShowStickyHeader(true);
      else setShowStickyHeader(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const recomendacoes: any[] = [];

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

 


  /* Variants do framer-motion para os cards */
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  return (
    <div className="min-h-screen bg-[#ffff]">
      {/* CAPA */}
      <div className="relative">
        <img src={perfil.foto_capa || "/capa.png"} className="h-[150px] w-full object-cover" alt="Capa" />
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

       {/* =======================
         HEADER FIXO AO SCROLL
      ======================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showStickyHeader ? 1 : 0, y: showStickyHeader ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-md px-4 py-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {/* Botão de voltar */}
          <button
            onClick={() => router.back()}
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-100  transition"
          >
            ←
          </button>
          {/* Foto de perfil */}
          <img
            src={perfil.foto_perfil || "/avatar.png"}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
            alt="Avatar"
          />
          {/* Nome + verificado + criador */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{perfil.nome}</span>
              {perfil.verificado && <BadgeCheck size={16} className="text-yellow-500" />}
              {isCriador && (
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 text-xs font-semibold text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"
                >
                  <Crown size={12} /> Criador
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Botão de ação */}
        <div className="flex gap-2">
          {isOwner ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="border border-gray-300 rounded-lg py-1 px-3 text-sm font-medium hover:bg-gray-100 transition"
            >
              Editar
            </button>
          ) : !conexao ? (
            <button
              onClick={onConectar}
              className="bg-black text-white rounded-lg py-1 px-3 text-sm font-medium flex items-center gap-1 hover:bg-gray-800 transition"
            >
              <UserPlus size={16} /> Conectar
            </button>
          ) : conexao.status === "aprovado" ? (
            <button className="border border-green-600 text-green-600 rounded-lg py-1 px-3 text-sm font-medium flex items-center gap-1 bg-green-50">
              <Check size={16} /> Networking
            </button>
          ) : conexao.receptor === usuarioLogadoId ? (
            <div className="flex gap-2">
              <button onClick={onAceitar} className="bg-blue-600 text-white rounded-lg py-1 px-3 text-sm font-medium">Aceitar</button>
              <button onClick={onRecusar} className="border border-gray-300 rounded-lg py-1 px-3 text-sm font-medium">Recusar</button>
            </div>
          ) : (
            <button className="bg-gray-100 text-gray-500 rounded-lg py-1 px-3 text-sm font-medium cursor-default">
              Pendente
            </button>
          )}
        </div>
      </motion.div>

      {/* =======================
         CONTEÚDO PRINCIPAL
      ======================== */}
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <h1 className="text-[18px] font-semibold flex items-center gap-1">
          {perfil.nome}
          {perfil.verificado && <BadgeCheck size={16} className="text-yellow-500" />}
          {isCriador && (
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"
            >
              <Crown size={12} /> Criador
            </motion.span>
          )}
        </h1>

        {/* BOTÕES DE AÇÃO */}
        <div className="mt-3 flex justify-end gap-2">
          {isOwner ? (
            <button
              onClick={() => setShowEditModal(true)}
              className="border border-gray-300 rounded-lg py-2 px-4 text-sm font-medium hover:bg-gray-100 transition"
            >
              Editar perfil
            </button>
          ) : !conexao ? (
            <button
              onClick={onConectar}
              className="bg-black text-white rounded-lg py-2 px-4 text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
            >
              <UserPlus size={18} /> Conectar
            </button>
          ) : conexao.status === "aprovado" ? (
            <button className="border border-green-600 text-green-600 rounded-lg py-2 px-4 text-sm font-medium flex items-center gap-2 bg-green-50">
              <Check size={18} /> Networking
            </button>
          ) : conexao.receptor === usuarioLogadoId ? (
            <div className="flex gap-2">
              <button onClick={onAceitar} className="bg-blue-600 text-white rounded-lg py-2 px-4 text-sm font-medium">Aceitar</button>
              <button onClick={onRecusar} className="border border-gray-300 rounded-lg py-2 px-4 text-sm font-medium">Recusar</button>
            </div>
          ) : (
            <button className="bg-gray-100 text-gray-500 rounded-lg py-2 px-4 text-sm font-medium cursor-default">
              Pendente
            </button>
          )}
        </div>

        {showEditModal && (
          <EditPerfilModal perfil={perfil} onClose={() => setShowEditModal(false)} onUpdate={onUpdatePerfil} />
        )}

        {/* ESTATÍSTICAS */}
        <div className="flex justify-around mt-6">
          <Stat value={perfil.seguindo || 0} label="Seguindo" />
          <Stat value={perfil.seguidores || 0} label="Seguidores" />
          <Stat value={perfil.networking || 0} label="Networking" />
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">{membroHa(perfil.created_at)}</p>

        {/* ===================== GRID DE CARDS ANIMADOS ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {[
            {
              icon: <Briefcase size={18} />,
              title: "Profissional",
              content: (
                <>
                  {perfil.ocupacao && <Info icon={<Briefcase size={16} />} text={perfil.ocupacao} />}
                  {perfil.localizacao && <Info icon={<MapPin size={16} />} text={perfil.localizacao} />}
                  {perfil.contacto && <Info icon={<Phone size={16} />} text={perfil.contacto} />}
                  {perfil.objetivo && (
                    <div className="flex gap-2 text-[13px] text-gray-700">
                      <Target size={14} />
                      <span>{perfil.objetivo}</span>
                    </div>
                  )}
                </>
              ),
            },
 {
  icon: <Languages size={18} />,
  title: "Idiomas",
  content: (
    <>
      {idiomas.length === 0 ? (
        <p className="text-[13px] text-gray-500 italic">
          Nenhum idioma informado
        </p>
      ) : (
        idiomas.map((idioma, i) => (
          <div
            key={idioma.id ?? i}
            className="flex justify-between text-[13px]"
          >
            <span className="font-medium text-gray-800">{idioma.nome}</span>
            <span className="text-gray-600">{idioma.nivel}</span>
          </div>
        ))
      )}

      {isOwner && (
        <>
          <button
            onClick={() => setShowAddIdiomaModal(true)}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            + Adicionar idioma
          </button>

          {showAddIdiomaModal && (
            <AddIdiomaModal
              onClose={() => setShowAddIdiomaModal(false)}
              onSave={onUpdatePerfil} // pai controla, filho chama callback
            />
          )}
        </>
      )}
    </>
  ),
},




            {
              icon: <ThumbsUp size={18} />,
              title: "Recomendações",
              content: recomendacoes.length === 0 ? (
                <p className="text-[13px] text-gray-500">Nenhuma recomendação</p>
              ) : (
                recomendacoes.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 text-[13px]">
                    <p className="text-gray-800">{rec.texto}</p>
                    <span className="text-xs text-gray-500">— {rec.autor}</span>
                  </div>
                ))
              ),
            },
            /** 
            {
              icon: <Briefcase size={18} />,
              title: "Avaliação do Sistema",
              content: (
                <div className="grid grid-cols-2 divide-x divide-y">
                  {avaliacaoSistema.criterios.map((item) => {
                    const percentual = calcularPercentual(item.pontuacao, item.maximo);
                    return (
                      <div key={item.id} className="p-4 flex flex-col items-center text-center gap-2">
                        <img src={item.icon} className="w-14 h-14" alt={item.titulo} />
                        <p className="text-sm font-medium text-gray-800">{item.titulo}</p>
                        <span className="text-blue-600 font-semibold text-sm">{item.pontuacao}/{item.maximo}</span>
                        <span className="text-[11px] text-gray-500">{nivelAvaliacao(percentual)}</span>
                      </div>
                    );
                  })}
                </div>
              ),
            }, **/
         {
  icon: <Briefcase size={18} />,
  title: "Habilidades",
  content: (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {habilidades.length === 0 ? (
          <p className="text-[13px] text-gray-500 italic">
            Nenhuma habilidade registrada
          </p>
        ) : (
          habilidades.map((hab, i) => (
            <div
              key={hab.id ?? i}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-blue-200 bg-white text-[13px] text-gray-700"
            >
              <img src="/google-skill.svg" alt="skill" className="w-4 h-4" />
              {hab.nome}
            </div>
          ))
        )}
      </div>

      {/* Botão sempre visível, levando para Home */}
      <button
        onClick={() => onNavigate?.("Home")}
        className="mt-2 text-xs text-blue-600 hover:underline"
      >
        Explorar Aprendizados
      </button>
    </div>
  ),
},



   {
  icon: <Briefcase size={18} />,
  title: "Interesses & Hobbies",
  content: (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {interessesHobbiesState.length === 0 ? (
  <p className="text-[13px] text-gray-500 italic">
    Nenhum interesse ou hobby informado
  </p>
) : (
  interessesHobbiesState.map((item, i) => (
    <span key={i} className="px-4 py-2 rounded-full bg-gray-100 text-[13px] text-gray-700">
      {item}
    </span>
  ))
)}
      </div>

      {/* Botão para adicionar, apenas para o dono do perfil */}
      {isOwner && (
        <>
          <button
            onClick={() => setShowAddInteresseModal(true)}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            + Adicionar interesse/hobby
          </button>

          {showAddInteresseModal && (
            <AddInteresseModal
             usuarioId={perfil.id} 
              onClose={() => setShowAddInteresseModal(false)}
              onSave={onUpdatePerfil} // callback para atualizar o perfil
            />
          )}
        </>
      )}
    </div>
  ),
},




            {
              icon: <ExternalLink size={18} />,
              title: `Cursos concluídos (${cursosConcluidos.length})`,
              content: loadingCursos ? (
                <p className="text-sm text-gray-400">Carregando cursos...</p>
              ) : cursosConcluidos.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum curso concluído</p>
              ) : (
                cursosConcluidos.map((curso) => (
                  <div key={curso.id} className="flex items-center gap-3 py-2 bg-white/30 rounded-lg p-2">
                    <img src={curso.imagem} alt={curso.titulo} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-[13px] font-medium">
                        {curso.titulo}
                        <ExternalLink size={14} className="text-gray-500" />
                      </div>
                      <p className="text-xs text-green-600">
                        {new Date(curso.data).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))
              ),
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card icon={card.icon} title={card.title}>
                {card.content}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
