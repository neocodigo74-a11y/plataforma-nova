"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brain, Rocket, Clock, ChevronRight, BookOpen, Loader2, CheckCircle2 } from "lucide-react";

// Tipagem atualizada para os dados da VIEW
interface Inscricao {
  inscricao_id: string;
  curso_id: string;
  curso_titulo: string;
  data_inscricao: string;
  total_aulas: number;
  aulas_concluidas: number;
  concluido: boolean;
}

interface CareerDashboardProps {
  onCourseSelect: (curso: any) => void;
}

export default function DashboardClone({ onCourseSelect }: CareerDashboardProps) {
  const [userName, setUserName] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [funcoesInteresse, setFuncoesInteresse] = useState<string[]>([]);
  const [greeting, setGreeting] = useState("");
  
  const [cursosInscritos, setCursosInscritos] = useState<Inscricao[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"andamento" | "concluido">("andamento");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bom dia");
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Buscar Nome e Onboarding
    const { data: usuario } = await supabase.from("usuarios").select("nome").eq("id", user.id).single();
    if (usuario?.nome) setUserName(usuario.nome);

    const { data: onboarding } = await supabase.from("usuarios_onboarding").select("objetivo, funcoes_interesse").eq("id", user.id).single();
    if (onboarding?.objetivo) setObjetivo(onboarding.objetivo);
    if (onboarding?.funcoes_interesse) setFuncoesInteresse(onboarding.funcoes_interesse);

    // 2. BUSCAR CURSOS PELA VIEW (Muito mais rápido)
    const { data: inscricoes, error } = await supabase
      .from("dashboard_cursos_progresso")
      .select("*")
      .eq("usuario_id", user.id)
      .order("data_inscricao", { ascending: false });

    if (!error && inscricoes) {
      // Processa a flag 'concluido' localmente baseada nos números da view
      const processados = inscricoes.map(c => ({
        ...c,
        concluido: c.total_aulas > 0 && c.aulas_concluidas >= c.total_aulas
      }));
      setCursosInscritos(processados);
    }
    setLoadingCursos(false);
  };

  // Filtragem para as abas
  const cursosAndamento = cursosInscritos.filter(c => !c.concluido);
  const cursosConcluidos = cursosInscritos.filter(c => c.concluido);
  const cursosExibidos = abaAtiva === "andamento" ? cursosAndamento : cursosConcluidos;

  const objetivoTextoMap: Record<string, string> = {
    iniciar_carreira: "iniciar minha carreira",
    mudar_carreira: "mudar função para",
    crescer_funcao: "crescer na função atual como",
    explorar_topicos: "explorar tópicos como",
    estagio_emprego: "buscar estágio ou emprego em",
    freelancer: "fazer projetos freelancer em",
    consultoria: "atuar em consultoria em",
    oportunidades_projeto: "participar de oportunidades de projeto em",
  };

  return (
    <section className="w-full bg-white py-10 px-6 max-w-[1200px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0F2A44] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
            {userName ? userName[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] leading-tight">
              {greeting}, {userName || "Usuário"}
            </h1>
            {funcoesInteresse.length > 0 && objetivo && (
              <p className="text-[14px] text-[#4B5563] mt-1">
                Seu objetivo: {objetivoTextoMap[objetivo]}{" "}
                {funcoesInteresse.map((f, idx) => (
                  <span key={f} className="font-medium text-[#111827]">
                    {f}{idx < funcoesInteresse.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
        <button className="text-[14px] font-medium text-[#2563EB] border border-blue-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
          Editar meta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
        {/* COLUNA LATERAL */}
        <div className="space-y-6">
          <div className="border border-[#E5E7EB] rounded-2xl p-6 bg-gray-50/30">
            <h3 className="text-[15px] font-bold text-[#111827] mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" /> Plano de aprendizado
            </h3>
            <div className="flex gap-2 mb-5">
              {["2", "3", "4", "5", "6", "s", "d"].map((item) => (
                <span key={item} className="w-8 h-8 rounded-full border border-[#D1D5DB] flex items-center justify-center text-[12px] font-medium text-gray-500">
                  {item}
                </span>
              ))}
            </div>
            <button className="w-full py-2.5 text-[14px] font-semibold text-[#2563EB] bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition">
              Definir meta semanal
            </button>
          </div>
        </div>

        {/* ÁREA CENTRAL - LISTA DE CURSOS */}
        <div className="flex flex-col">
          {/* SELETOR DE ABAS */}
          <div className="flex gap-6 border-b border-gray-100 mb-6">
            <button 
              onClick={() => setAbaAtiva("andamento")}
              className={`pb-3 text-[15px] transition-all ${abaAtiva === "andamento" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-400 font-medium"}`}
            >
              Em andamento ({cursosAndamento.length})
            </button>
            <button 
              onClick={() => setAbaAtiva("concluido")}
              className={`pb-3 text-[15px] transition-all ${abaAtiva === "concluido" ? "border-b-2 border-blue-600 text-blue-600 font-bold" : "text-gray-400 font-medium"}`}
            >
              Concluído ({cursosConcluidos.length})
            </button>
          </div>

          {loadingCursos ? (
            <div className="flex justify-center py-20"><Loader2 size={40} className="text-blue-600 animate-spin" /></div>
          ) : cursosExibidos.length > 0 ? (
            <div className="grid gap-4">
              {cursosExibidos.map((curso) => {
                const percentual = curso.total_aulas > 0 ? Math.round((curso.aulas_concluidas / curso.total_aulas) * 100) : 0;
                
                return (
                  <div key={curso.inscricao_id} className="group flex flex-col md:flex-row items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-md transition bg-white hover:border-blue-100">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition ${curso.concluido ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        {curso.concluido ? <CheckCircle2 size={24} /> : <BookOpen size={24} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#111827]">{curso.curso_titulo}</h4>
                        
                        {/* BARRA DE PROGRESSO (Apenas para cursos em andamento) */}
                        {!curso.concluido && (
                          <div className="mt-2 w-full max-w-[250px]">
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase">
                              <span>{curso.aulas_concluidas}/{curso.total_aulas} Aulas</span>
                              <span>{percentual}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${percentual}%` }} />
                            </div>
                          </div>
                        )}
                        {curso.concluido && <p className="text-xs text-emerald-600 font-bold mt-1 uppercase tracking-tighter">Curso Finalizado</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => onCourseSelect(curso)}
                      className={`mt-4 md:mt-0 px-6 py-2 font-bold text-sm rounded-lg transition flex items-center gap-2 ${curso.concluido ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-[#0056d2] hover:text-white'}`}
                    >
                      {curso.concluido ? "Rever Curso" : "Continuar"} <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Rocket size={36} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">
                {abaAtiva === "andamento" ? "Nada para estudar agora" : "Nenhum curso concluído"}
              </h3>
              <button className="mt-6 px-8 py-3 bg-[#0056d2] text-white font-bold rounded-full hover:bg-blue-700 transition">
                Explorar Cursos
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}