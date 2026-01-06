"use client";

import { useState, ReactNode, Fragment } from "react";
import { 
  MoreHorizontal, BadgeCheck, BookOpen, GraduationCap, Briefcase, 
  MapPin, Phone, Target, Crown, Languages, ThumbsUp, ExternalLink, 
  UserPlus, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditPerfilModal from "../EditPerfilModal";

/* Funções auxiliares */
function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function membroHa(date: string) {
  if (!date) return "";
  const start = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (diff < 1) return "Membro há menos de 1 mês";
  return `Membro há ${diff} meses`;
}

interface ProfileLayoutProps {
  perfil: any;
  cursosInscritos: any[];
  cursosConcluidos: any[];
  loadingCursos: boolean;
  isOwner: boolean;
  conexao?: any; 
  usuarioLogadoId?: string | null;
  onConectar?: () => void;
  onAceitar?: () => void;
  onRecusar?: () => void;
  onUpdatePerfil: (updated: any) => void;
}

// CORREÇÃO AQUI: Adicionamos todas as props nos parênteses abaixo
export default function ProfileLayout({ 
  perfil, 
  cursosInscritos, 
  cursosConcluidos, 
  loadingCursos, 
  isOwner, 
  onUpdatePerfil,
  conexao, // <-- Adicionado
  usuarioLogadoId, // <-- Adicionado
  onConectar, // <-- Adicionado
  onAceitar, // <-- Adicionado
  onRecusar // <-- Adicionado
}: ProfileLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>("portfolio");
  const [showEditModal, setShowEditModal] = useState(false);

  const isCriador = perfil?.email === "osvaniosilva74@gmail.com";
  
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
            <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400">
              <Crown size={12} /> Criador
            </motion.span>
          )}
        </h1>

        {/* ÁREA DE BOTÕES DE AÇÃO */}
        <div className="mt-3 flex gap-2">
          {isOwner ? (
            <button onClick={() => setShowEditModal(true)} className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition">
              Editar perfil
            </button>
          ) : (
            <div className="w-full">
              {!conexao ? (
                <button onClick={onConectar} className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                  <UserPlus size={18} /> Conectar
                </button>
              ) : conexao.status === "aprovado" ? (
                <button className="w-full border border-green-600 text-green-600 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 bg-green-50">
                  <Check size={18} /> Networking
                </button>
              ) : conexao.receptor === usuarioLogadoId ? (
                <div className="flex gap-2 w-full">
                  <button onClick={onAceitar} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium">Aceitar</button>
                  <button onClick={onRecusar} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium">Recusar</button>
                </div>
              ) : (
                <button className="w-full bg-gray-100 text-gray-500 rounded-lg py-2 text-sm font-medium cursor-default">
                  Pendente
                </button>
              )}
            </div>
          )}
        </div>

        {showEditModal && <EditPerfilModal perfil={perfil} onClose={() => setShowEditModal(false)} onUpdate={onUpdatePerfil} />}

        {/* ESTATÍSTICAS */}
        <div className="flex justify-around mt-6">
          <Stat value={perfil.seguindo || 0} label="Seguindo" />
          <Stat value={perfil.seguidores || 0} label="Seguidores" />
          <Stat value={perfil.networking || 0} label="Networking" />
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">{membroHa(perfil.created_at)}</p>

        {/* ABAS */}
        <div className="flex gap-6 mt-6 border-b text-[14px]">
          <Tab label="Portfólio" active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")} />
          <Tab label="Académico" active={activeTab === "academico"} onClick={() => setActiveTab("academico")} />
          <Tab label="Profissional" active={activeTab === "profissional"} onClick={() => setActiveTab("profissional")} />
        </div>

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
                ) : <p className="text-gray-500 text-center">Nenhuma informação profissional</p>
              )}
              {/* Adicione as outras abas aqui conforme necessário */}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: any) { return <div className="text-center"><p className="font-semibold">{value}</p><p className="text-xs text-gray-500">{label}</p></div>; }
function Tab({ label, active, onClick }: any) { return <button onClick={onClick} className={`pb-3 ${active ? "border-b-2 border-black font-semibold" : "text-gray-400"}`}>{label}</button>; }
function Info({ icon, text }: any) { if (!text) return null; return <div className="flex items-center gap-3 text-[13px] text-gray-700"><span className="text-gray-500">{icon}</span><span>{text}</span></div>; }