"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, PlayCircle, CheckCircle2, Lock, Loader2 } from "lucide-react";

// Definindo a interface para evitar erros de build
interface Aula {
  id: number;
  titulo: string;
  url_video: string;
  ordem: number;
  modulo_titulo?: string;
}

interface Modulo {
  titulo: string;
  aulas: Aula[];
}

function NovaIcon() {
  return <span className="font-bold text-sm">N</span>;
}

export default function AreaMembros({ curso, onBack }: { curso: any; onBack: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null);
  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [metaSegundos, setMetaSegundos] = useState(0);
  const [podeConcluir, setPodeConcluir] = useState(false);
  const tempoMaximoAssistido = useRef(0);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const cursoId = curso?.curso_id || curso?.id;
      const { data: aulas } = await supabase
        .from("aulas_academia")
        .select("*")
        .eq("curso_id", cursoId)
        .order("ordem", { ascending: true });

      if (!aulas || aulas.length === 0) {
        setLoading(false);
        return;
      }

      const agrupado = aulas.reduce((acc: any, aula: Aula) => {
        const modulo = aula.modulo_titulo || "Conteúdo";
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push(aula);
        return acc;
      }, {});

      const modulosFormatados = Object.keys(agrupado).map(titulo => ({
        titulo,
        aulas: agrupado[titulo]
      }));

      setModulos(modulosFormatados);
      setAulaAtiva(aulas[0]);

      if (user) {
        const { data: progresso } = await supabase
          .from("progresso_aulas")
          .select("aula_id")
          .eq("user_id", user.id);
        if (progresso) setConcluidas(progresso.map(p => p.aula_id));
      }
      setLoading(false);
    };
    if (curso) carregar();
  }, [curso]);

  useEffect(() => {
    tempoMaximoAssistido.current = 0;
    if (aulaAtiva) setPodeConcluir(concluidas.includes(aulaAtiva.id));
  }, [aulaAtiva, concluidas]);

  const todasAsAulas = useMemo(() => modulos.flatMap(m => m.aulas), [modulos]);

  const estaLiberada = (id: number) => {
    const idx = todasAsAulas.findIndex(a => a.id === id);
    if (idx <= 0) return true;
    return concluidas.includes(todasAsAulas[idx - 1].id);
  };

  const aoCarregarMetadados = () => {
    if (videoRef.current) setMetaSegundos(Math.floor(videoRef.current.duration * 0.95));
  };

  const aoAtualizarTempo = () => {
    if (!videoRef.current || !aulaAtiva) return;
    const tempo = videoRef.current.currentTime;
    if (!concluidas.includes(aulaAtiva.id)) {
      if (tempo > tempoMaximoAssistido.current + 2) {
        videoRef.current.currentTime = tempoMaximoAssistido.current;
      } else {
        tempoMaximoAssistido.current = Math.max(tempoMaximoAssistido.current, tempo);
      }
      if (Math.floor(tempo) >= metaSegundos && metaSegundos > 0) setPodeConcluir(true);
    }
  };

  const concluir = async () => {
    if (!user || !aulaAtiva) return;
    setConcluidas(prev => [...prev, aulaAtiva.id]);
    await supabase.from("progresso_aulas").insert({ user_id: user.id, aula_id: aulaAtiva.id });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-400" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col text-zinc-900 bg-white">
      {/* HEADER */}
      <header className="flex items-center px-4 h-14 border-b gap-2 bg-white">
        <NovaIcon />
        <button onClick={onBack} className="text-zinc-600 hover:text-black transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-sm font-medium truncate">{curso?.curso_titulo}</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* PLAYER */}
        <main className="flex-1 overflow-y-auto bg-white">
          {aulaAtiva?.url_video && (
            <video
              ref={videoRef}
              key={aulaAtiva?.url_video}
              controls
              className="w-full h-[60vh] bg-black"
              onLoadedMetadata={aoCarregarMetadados}
              onTimeUpdate={aoAtualizarTempo}
              controlsList="nodownload"
            >
              <source src={aulaAtiva.url_video} type="video/mp4" />
            </video>
          )}

          <div className="px-4 py-4">
            <h2 className="text-lg font-semibold mb-2">{aulaAtiva?.titulo}</h2>

            {!concluidas.includes(aulaAtiva?.id || 0) && (
              <button
                disabled={!podeConcluir}
                onClick={concluir}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Marcar como concluída
              </button>
            )}

            {concluidas.includes(aulaAtiva?.id || 0) && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Aula Concluída
              </span>
            )}
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="w-[300px] border-l border-zinc-100 overflow-y-auto px-2 py-4 text-sm bg-white">
          {modulos.map((modulo, i) => (
            <div key={i} className="mb-4">
              <div className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider px-2 py-1">
                {modulo.titulo}
              </div>
              <div className="mt-1 space-y-0.5">
                {modulo.aulas.map((aula: Aula) => {
                  const liberada = estaLiberada(aula.id);
                  const ativa = aulaAtiva?.id === aula.id;
                  
                  return (
                    <button
                      key={aula.id}
                      onClick={() => setAulaAtiva(aula)}
                      disabled={!liberada}
                      className={`flex items-center gap-2 px-2 py-2 w-full text-left rounded-lg transition-colors
                        ${ativa ? "bg-zinc-100 text-black font-medium" : "text-zinc-600 hover:bg-zinc-50"}
                        ${!liberada && "opacity-40 cursor-not-allowed"}
                      `}
                    >
                      {concluidas.includes(aula.id) ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : liberada ? (
                        <PlayCircle size={14} className={ativa ? "text-black" : "text-zinc-400"} />
                      ) : (
                        <Lock size={14} className="text-zinc-300" />
                      )}
                      <span className="truncate flex-1">{aula.titulo}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}