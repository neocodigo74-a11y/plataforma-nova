"use client"; // Mantém a lógica do lado do cliente

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  PlayCircle, CheckCircle2, ChevronLeft, FileText, 
  Loader2, Trophy, Lock, Clock, Menu, X, ShieldAlert, 
  Eye, BookOpen, AlignLeft
} from "lucide-react";

// Definição de Cores Modernas (Exemplo de Paleta: Azul Profundo e Verde de Sucesso)
const primaryColor = 'bg-blue-600 hover:bg-blue-700'; // Principal para botões de ação
const successColor = 'bg-emerald-500 hover:bg-emerald-600'; // Para progresso/concluído
const inactiveColor = 'bg-zinc-100 text-zinc-400'; // Para inativo/bloqueado

export default function AreaMembros({ curso, onBack }: { curso: any; onBack: () => void }) {
  const [aulaAtiva, setAulaAtiva] = useState<any>(null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Estados de Modais
  const [modalPdfOpen, setModalPdfOpen] = useState(false);
  const [modalTextoOpen, setModalTextoOpen] = useState(false);
  
  const [segundosAtuais, setSegundosAtuais] = useState(0);
  const [metaSegundos, setMetaSegundos] = useState(0);
  const [podeConcluir, setPodeConcluir] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const tempoMaximoAssistido = useRef(0);

  // --- LÓGICA DE DADOS E ESTADOS (Mantida) ---

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (curso?.curso_id) {
        await fetchAulas();
        if (user) await fetchProgresso(user.id);
      }
      setLoading(false);
    };
    getInitialData();
  }, [curso]);

  useEffect(() => {
    setSegundosAtuais(0);
    setMetaSegundos(0);
    tempoMaximoAssistido.current = 0;
    setSidebarOpen(false);
    setModalPdfOpen(false);
    setModalTextoOpen(false);

    if (aulaAtiva) {
      const jaConcluida = concluidas.includes(aulaAtiva.id);
      if (aulaAtiva.tipo_conteudo === 'video') {
        setPodeConcluir(jaConcluida);
      } else {
        setPodeConcluir(jaConcluida);
      }
    }
  }, [aulaAtiva, concluidas]);

  // Funções de vídeo (Mantidas)
  const aoCarregarMetadados = () => {
    if (videoRef.current) {
      const alvo = Math.floor(videoRef.current.duration * 0.95);
      setMetaSegundos(alvo);
    }
  };

  const aoAtualizarTempo = () => {
    if (videoRef.current && !concluidas.includes(aulaAtiva?.id)) {
      const tempoAtual = videoRef.current.currentTime;
      if (tempoAtual > tempoMaximoAssistido.current + 2) {
        // Previne 'seeking' além do ponto máximo assistido (anti-pulo)
        videoRef.current.currentTime = tempoMaximoAssistido.current;
      } else {
        tempoMaximoAssistido.current = Math.max(tempoMaximoAssistido.current, tempoAtual);
      }
      setSegundosAtuais(Math.floor(tempoAtual));
      if (Math.floor(tempoAtual) >= metaSegundos && metaSegundos > 0) setPodeConcluir(true);
    }
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  };

  const fetchAulas = async () => {
    const { data, error } = await supabase
      .from("aulas_academia")
      .select("*")
      .eq("curso_id", curso.curso_id)
      .order("ordem", { ascending: true });

    if (!error && data) {
      const agrupado = data.reduce((acc: any, aula: any) => {
        const mod = aula.modulo_titulo || "Módulo 01";
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(aula);
        return acc;
      }, {});
      const listaModulos = Object.keys(agrupado).map(titulo => ({ titulo, aulas: agrupado[titulo] }));
      setModulos(listaModulos);
      // Garante que uma aula ativa seja definida se houver dados
      if (!aulaAtiva && data.length > 0) {
        setAulaAtiva(data[0]);
      }
    }
  };

  const fetchProgresso = async (userId: string) => {
    const { data, error } = await supabase.from("progresso_aulas").select("aula_id").eq("user_id", userId);
    if (!error && data) setConcluidas(data.map(item => item.aula_id));
  };

  const todasAsAulas = useMemo(() => modulos.flatMap(m => m.aulas), [modulos]);

  const estaLiberada = (aulaId: number) => {
    const index = todasAsAulas.findIndex(a => a.id === aulaId);
    if (index <= 0) return true; // Primeira aula é sempre liberada
    return concluidas.includes(todasAsAulas[index - 1].id);
  };

  const progressoGeral = useMemo(() => {
    if (todasAsAulas.length === 0) return 0;
    return Math.round((concluidas.length / todasAsAulas.length) * 100);
  }, [todasAsAulas, concluidas]);

  const toggleConcluir = async (id: number) => {
    const isConcluida = concluidas.includes(id);
    if (!isConcluida && !podeConcluir) return;
    if (!user) return;
    
    // Atualiza o estado local primeiro (otimista)
    if (isConcluida) {
      setConcluidas(prev => prev.filter(a => a !== id));
      const { error } = await supabase.from("progresso_aulas").delete().eq("user_id", user.id).eq("aula_id", id);
      if (error) console.error("Erro ao remover progresso:", error); // Reverter em caso de erro
    } else {
      setConcluidas(prev => [...prev, id]);
      const { error } = await supabase.from("progresso_aulas").insert({ user_id: user.id, aula_id: id });
      if (error) console.error("Erro ao inserir progresso:", error); // Reverter em caso de erro
    }
  };

  // Se estiver carregando, mostra o spinner de forma centralizada
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
  );

  // Renderização principal do componente
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden text-zinc-900 py-6">
      
      {/* HEADER (Barra superior) - Melhoria de contraste e foco no progresso */}
      <header className="flex-none bg-white border-b border-zinc-100  shadow-sm">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <button 
              onClick={onBack} 
              className="p-2 text-zinc-600 hover:bg-blue-50 hover:text-blue-600 rounded-full flex-none transition-colors"
              title="Voltar para a lista de cursos"
            >
              <ChevronLeft size={22}/>
            </button>
            <div className="truncate">
              <h1 className="text-base font-extrabold truncate max-w-[180px] md:max-w-md text-zinc-900">{curso?.curso_titulo}</h1>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-zinc-500">
                <Trophy size={12} className="text-emerald-500" /> 
                <span className="text-zinc-600 font-bold">{progressoGeral}%</span> concluído
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="lg:hidden p-2 text-zinc-600 bg-zinc-100 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-colors"
            title="Abrir/Fechar Menu de Aulas"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {/* Barra de Progresso Visível */}
        <div className="w-full h-1 bg-zinc-200/80">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
            style={{ width: `${progressoGeral}%` }} 
            role="progressbar" 
            aria-valuenow={progressoGeral} 
            aria-valuemin={0} 
            aria-valuemax={100} 
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#fffff] pb-8 md:pb-12">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            
            {/* ÁREA DE CONTEÚDO (VIDEO, PDF OU TEXTO) - Maior destaque, bordas arredondadas e sombra sutil */}
            <div className="w-full mb-4 md:mb-8 shadow-xl md:shadow-2xl rounded-3xl overflow-hidden">
              {aulaAtiva?.tipo_conteudo === 'pdf' ? (
                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-inner flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 border-4 border-red-100"><FileText size={40} /></div>
                  <h2 className="text-2xl font-extrabold mb-2 text-zinc-800">Material em PDF</h2>
                  <p className="text-zinc-500 mb-8 max-w-md text-sm">Arquivo complementar para aprofundamento. Clique para visualizar e marcar como concluído.</p>
                  <button 
                    onClick={() => { setModalPdfOpen(true); setPodeConcluir(true); }}
                    className={`w-full max-w-sm px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-md text-white ${primaryColor}`}
                  >
                    <Eye size={20} /> Visualizar PDF
                  </button>
                </div>
              ) : aulaAtiva?.tipo_conteudo === 'texto' ? (
                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-inner flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100"><BookOpen size={40} /></div>
                  <h2 className="text-2xl font-extrabold mb-2 text-zinc-800">Conteúdo de Leitura</h2>
                  <p className="text-zinc-500 mb-8 max-w-md text-sm">Esta aula é baseada em conteúdo escrito. Inicie a leitura para prosseguir.</p>
                  <button 
                    onClick={() => { setModalTextoOpen(true); setPodeConcluir(true); }}
                    className={`w-full max-w-sm px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-md text-white ${primaryColor}`}
                  >
                    <AlignLeft size={20} /> Iniciar Leitura
                  </button>
                </div>
              ) : (
                // Player de Vídeo
                <div className="bg-black aspect-video w-full">
                  <video 
                    ref={videoRef} key={aulaAtiva?.url_video}
                    className="w-full h-full object-contain"
                    controls onLoadedMetadata={aoCarregarMetadados} onTimeUpdate={aoAtualizarTempo}
                    disablePictureInPicture controlsList="nodownload" playsInline
                  >
                    <source src={aulaAtiva?.url_video} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>

            {/* INFO DA AULA & BOTÃO DE CONCLUSÃO - Mais limpo e focado na ação */}
            <div className="px-0 md:px-0">
              <div className="bg-white p-6 md:p-10 rounded-3xl border border-zinc-100 shadow-lg">
                <div className="flex flex-col gap-6">
                  {/* Título e Descrição da Aula */}
                  <div className="space-y-2 border-b pb-6 border-zinc-50">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-900 leading-tight">{aulaAtiva?.titulo}</h2>
                    <p className="text-zinc-500 leading-relaxed text-sm md:text-base">{aulaAtiva?.descricao}</p>
                  </div>
                  
                  {/* Botão de Conclusão Central */}
                  <button 
                    onClick={() => toggleConcluir(aulaAtiva.id)}
                    disabled={!podeConcluir && !concluidas.includes(aulaAtiva.id)}
                    className={`w-full py-3 rounded-full font-extrabold transition-all shadow-lg flex items-center justify-center gap-3 text-sm uppercase tracking-wider
                      ${concluidas.includes(aulaAtiva.id) 
                        ? `${inactiveColor} cursor-default` // Concluída
                        : !podeConcluir 
                          ? `${inactiveColor} cursor-not-allowed` // Bloqueada
                          : `${successColor} text-white` // Liberada para Concluir
                      }`}
                  >
                    {concluidas.includes(aulaAtiva?.id) ? (
                      <><CheckCircle2 size={20} /> AULA CONCLUÍDA</>
                    ) : podeConcluir ? (
                      <><CheckCircle2 size={20} /> MARCAR COMO CONCLUÍDA</>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span className="opacity-70">
                          {aulaAtiva?.tipo_conteudo === 'video' 
                            ? `ASSISTA 95% (${formatarTempo(metaSegundos - segundosAtuais)} restantes)` 
                            : "ABRA PARA CONCLUIR"
                          }
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* SIDEBAR (Menu de Aulas) - Mais refinado e responsivo */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-[80] lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed lg:static inset-y-0 right-0 z-[90] lg:z-0 w-[300px] md:w-[360px] bg-white flex flex-col h-full transform transition-transform duration-300 ease-in-out border-l border-zinc-100 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} shadow-xl lg:shadow-none`}>
          
          <div className="flex-none p-6 border-b font-extrabold text-[12px] uppercase tracking-[1px] text-zinc-500 flex justify-between items-center bg-zinc-50/50">
            Conteúdo do Curso
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-zinc-600 hover:text-blue-600"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-4">
            {modulos.map((modulo, idx) => (
              <div key={idx} className="mb-0">
                <div className="bg-zinc-100/60 px-6 py-3 text-[11px] font-bold text-zinc-600 uppercase border-y border-zinc-200/50">
                  {modulo.titulo}
                </div>
                {modulo.aulas.map((aula: any, aulaIdx: number) => {
                  const liberada = estaLiberada(aula.id);
                  const ativa = aulaAtiva?.id === aula.id;
                  const concluida = concluidas.includes(aula.id);
                  
                  // Icone da Aula
                  const IconeAula = concluida ? CheckCircle2 : !liberada ? Lock : 
                                   aula.tipo_conteudo === 'pdf' ? FileText : 
                                   aula.tipo_conteudo === 'texto' ? AlignLeft : PlayCircle;
                  
                  // Cor do Ícone
                  const iconColor = concluida ? 'text-emerald-500' : 
                                    !liberada ? 'text-zinc-400' : 
                                    ativa ? 'text-blue-600' : 'text-zinc-400';

                  return (
                    <button 
                      key={aula.id} disabled={!liberada}
                      onClick={() => { setAulaAtiva(aula); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-4 px-6 py-4 text-left border-b border-zinc-100 transition-all group
                        ${ativa ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
                        ${!liberada ? 'opacity-60 cursor-not-allowed' : 'hover:bg-zinc-50'}`}
                    >
                      <div className="flex-none transition-transform group-hover:scale-105">
                        <IconeAula size={20} className={iconColor} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[13px] font-bold leading-snug ${ativa ? 'text-blue-700' : 'text-zinc-800'}`}>{aula.titulo}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                            {concluida ? 'Concluída' : !liberada ? 'Bloqueada' : aula.tipo_conteudo === 'video' ? 'Vídeo Aula' : aula.tipo_conteudo === 'pdf' ? 'Material PDF' : 'Leitura'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* MODAL PDF - Fundo escuro para foco no conteúdo */}
      {modalPdfOpen && (
        <div className="fixed inset-0 z-[200] bg-zinc-900/95 flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white shadow-lg">
            <span className="font-bold text-base truncate max-w-[80%]">{aulaAtiva?.titulo} - Visualização de PDF</span>
            <button 
              onClick={() => setModalPdfOpen(false)} 
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors"
              title="Fechar PDF"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 bg-zinc-800 relative">
             <iframe 
               src={`${aulaAtiva?.url_anexo}#toolbar=0&navpanes=0&scrollbar=0`} 
               className="w-full h-full border-none"
             />
             <div className="absolute inset-0 pointer-events-none" onContextMenu={e => e.preventDefault()} /> 
          </div>
        </div>
      )}

      {/* MODAL TEXTO (LEITURA) - Design focado em leitura, com fonte grande e centralizado */}
      {modalTextoOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
          
          {/* Barra Superior do Modal */}
          <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 shadow-sm">
            <div className="flex items-center gap-2">
               <BookOpen className="text-blue-600" size={20} />
               <span className="font-bold text-base truncate max-w-[200px] md:max-w-md text-zinc-800">{aulaAtiva?.titulo}</span>
            </div>
            <button 
              onClick={() => setModalTextoOpen(false)}
              className="bg-zinc-100 p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600"
              title="Finalizar Leitura"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Conteúdo de Leitura */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-zinc-900 leading-tight border-b pb-4 border-blue-50">{aulaAtiva?.titulo}</h1>
              {/* Uso de 'prose-xl' para melhor legibilidade em leitura longa */}
              <article className="prose prose-zinc prose-xl max-w-none text-zinc-700 leading-relaxed">
                  {aulaAtiva?.conteudo_texto ? (
                      <div dangerouslySetInnerHTML={{ __html: aulaAtiva.conteudo_texto }} />
                  ) : (
                      <div className="py-20 text-center text-zinc-400 text-lg font-medium">Nenhum conteúdo de leitura disponível para esta aula.</div>
                  )}
              </article>
            </div>
          </div>
          
          {/* Footer Fixo para Conclusão da Leitura */}
          <div className="p-4 border-t bg-white sticky bottom-0 shadow-2xl">
              <button 
               onClick={() => setModalTextoOpen(false)}
               className={`w-full max-w-sm mx-auto block py-4 rounded-full font-bold text-white transition-all shadow-lg ${primaryColor}`}
              >
               FINALIZAR LEITURA E VOLTAR
              </button>
          </div>
        </div>
      )}
    </div>
  );
}