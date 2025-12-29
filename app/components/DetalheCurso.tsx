"use client";

import Image from "next/image";
import {
  Layers,
  Clock,
  Check,
  ChevronRight,
  X,
  Loader2, // Ícone de carregamento
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* =========================
   TIPAGEM DAS PROPS
========================= */
interface Curso {
  id: string | number;
  title: string;
  description: string;
  rating?: number;
  reviews?: number;
  details?: string;
}

interface DetalheCursoProps {
  curso: Curso;
  onBack?: () => void;
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function DetalheCurso({ curso, onBack }: DetalheCursoProps) {
  const [dataAtual, setDataAtual] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [objetivo, setObjetivo] = useState("Aprimoramento Profissional");

  // Contador real de inscritos
  const [totalInscritos, setTotalInscritos] = useState<number | null>(null);

  useEffect(() => {
    const data = new Date();
    const opcoes = { day: 'numeric', month: 'short' } as const;
    setDataAtual(data.toLocaleDateString('pt-BR', opcoes));

    checkExistingEnrollment();
    fetchTotalEnrollments(); // Busca o total ao carregar
  }, [curso.id]);

  // 🔹 BUSCA O TOTAL DE INSCRITOS NA TABELA 'inscricoes_cursos'
  const fetchTotalEnrollments = async () => {
    try {
      const { count, error } = await supabase
        .from('inscricoes_cursos')
        .select('*', { count: 'exact', head: true })
        .eq('curso_id', String(curso.id));

      if (error) throw error;
      setTotalInscritos(count);
    } catch (error) {
      console.error("Erro ao contar inscritos:", error);
    }
  };

  const checkExistingEnrollment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('inscricoes_cursos')
          .select('id')
          .eq('usuario_id', session.user.id)
          .eq('curso_id', String(curso.id))
          .single();

        if (data) setIsEnrolled(true);
      }
    } catch (error) {
      console.error("Erro ao verificar inscrição:", error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      alert("Por favor, faça login para se inscrever!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('inscricoes_cursos')
        .insert([
          { 
            usuario_id: user.id,
            curso_id: String(curso.id), 
            curso_titulo: curso.title,
            objetivo: objetivo
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          setIsEnrolled(true);
        } else {
          throw error;
        }
      } else {
        setIsEnrolled(true);
        setIsModalOpen(false);
        fetchTotalEnrollments(); // Atualiza o contador imediatamente
        alert("Inscrição realizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Falha na inscrição.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-[#f7f8fa] overflow-hidden min-h-screen">
      {/* GRÁFICO DECORATIVO DIREITA */}
      <div className="hidden lg:block absolute right-[-100px] top-0 bottom-0 pointer-events-none">
        <svg viewBox="0 0 540 540" width="540" height="540" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <path d="M540 270c0 149.12-111.96 270-250 270S40 419.12 40 270 151.96 0 290 0s250 120.88 250 270z" fill="#eef1f6" />
        </svg>
      </div>

      {/* CONTAINER HERO */}
      <div className="max-w-[1180px] mx-auto px-6 pt-10 pb-20 relative z-10 lg:pt-14">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
          <div>
            <h1 className="text-[28px] leading-tight font-bold text-[#1f1f1f] max-w-[640px] mb-2 lg:text-[36px] lg:leading-[44px]">
              {curso.title}
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-[#373a3c] max-w-[620px] lg:text-[16px] lg:leading-[24px]">
               {curso.description} <strong> Certified Associate in Project Management (CAPM)</strong>.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-[#5b5f62]">
              <InstructorAvatars />
              <span>Instrutores:</span>
              <span className="text-[#0056d2] font-medium">John Rofrano</span>
              <span>+ Mais 6</span>
              <span className="bg-[#eef3ff] text-[#0056d2] text-[12px] px-2 py-[2px] rounded-full">Instrutor principal</span>
            </div>

            {/* CTA SECTION */}
            <div className="mt-6 flex flex-col gap-3">
              {checkingEnrollment ? (
                <div className="w-[260px] h-[52px] bg-gray-200 animate-pulse rounded-md" />
              ) : isEnrolled ? (
                <button className="w-full sm:w-[260px] bg-green-600 hover:bg-green-700 text-white text-[14px] font-semibold px-5 py-3 rounded-md transition flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Ir para o curso
                </button>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-[260px] bg-[#0056d2] hover:bg-[#00419e] text-white text-[14px] font-semibold px-5 py-4 rounded-md transition duration-200 shadow-lg shadow-blue-900/10"
                >
                  Inscreva-se gratuitamente
                  <span className="block text-[12px] font-normal mt-1 opacity-90">Inicia em {dataAtual || "..."}</span>
                </button>
              )}
              
              <p className="text-[14px] text-[#5b5f62] lg:text-[13px]">
                Experimente gratuitamente: teste de acesso total por 7 dias
              </p>
            </div>

            {/* CONTADOR */}
            <div className="mt-4 text-[13px] text-[#5b5f62] flex flex-wrap items-center gap-2">
              <strong className="text-[15px] text-[#1f1f1f]">
                {totalInscritos !== null ? totalInscritos.toLocaleString('pt-BR') : "..."}
              </strong>
              <span>já se inscreveram</span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
                Incluído com o <span className="text-[#0056d2] font-semibold flex items-center gap-1">NOVA <span className="bg-[#0056d2] text-white px-1">Plus</span> <ChevronRight className="w-3 h-3" /></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE INSCRIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Confirmar Matrícula</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEnroll} className="p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Você selecionou:</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{curso.title}</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Qual seu objetivo com este curso?</label>
                <select 
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option>Transição de Carreira</option>
                  <option>Aprimoramento Profissional</option>
                  <option>Curiosidade/Pessoal</option>
                  <option>Certificação Acadêmica</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">Sua jornada começa agora. Você terá acesso total a vídeos, leituras e fóruns.</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0056d2] hover:bg-[#00419e] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Inscrição Gratuita"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="relative z-20 -mt-10 lg:-mt-16">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <Metric icon={<Layers className="w-6 h-6 text-blue-600" />} title="Especialização" subtitle="11 séries de cursos" />
            <Metric icon={null} title={`${curso.rating} ★`} subtitle={`(${curso.reviews} avaliações)`} />
            <Metric icon={null} title="Nível" subtitle={curso.details || ""} />
            <Metric icon={null} title="Duração" subtitle="Aprox. 4 meses" />
            <Metric icon={null} title="Ritmo" subtitle="Cronograma flexível" />
          </div>
        </div>
      </div>

      {/* TABS & CONTEÚDO */}
      <div className="max-w-[1180px] mx-auto px-6 mt-12 pb-20">
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          <Tab label="Sobre" active />
          <Tab label="Conteúdo" />
          <Tab label="Avaliações" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">O que você vai aprender</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <LearnItem text="Domine as ferramentas práticas mais atualizadas do mercado de TI." />
          <LearnItem text="Aprenda conceitos Agile, Scrum e melhoria contínua." />
          <LearnItem text="Gerencie projetos complexos e situações reais com clientes." />
          <LearnItem text="Aplique habilidades em laboratórios práticos e projetos reais." />
        </div>
      </div>
    </section>
  );
}

/* =========================
   COMPONENTES INTERNOS TIPADOS
========================= */
interface MetricProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
}
function Metric({ icon, title, subtitle }: MetricProps) {
  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
      {icon && <div className="mb-2">{icon}</div>} 
      <p className="text-[15px] font-bold text-[#1f1f1f]">{title}</p>
      <p className="text-[12px] text-[#5b5f62] leading-tight">{subtitle}</p>
    </div>
  );
}

interface TabProps {
  label: string;
  active?: boolean;
}
function Tab({ label, active = false }: TabProps) {
  return (
    <button className={`pb-4 text-[15px] font-medium transition-all whitespace-nowrap ${active ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
      {label}
    </button>
  );
}

interface LearnItemProps {
  text: string;
}
function LearnItem({ text }: LearnItemProps) {
  return (
    <div className="flex gap-3 items-start">
      <div className="bg-blue-100 p-1 rounded-full mt-1">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <p className="text-[15px] text-gray-700">{text}</p>
    </div>
  );
}

function InstructorAvatars() {
  return (
    <div className="flex -space-x-2 items-center">
      <div className="w-7 h-7 border-2 border-white rounded-full bg-blue-500 shadow-sm" />
      <div className="w-7 h-7 border-2 border-white rounded-full bg-indigo-400 shadow-sm" />
    </div>
  );
}
