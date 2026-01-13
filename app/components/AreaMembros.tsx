"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, PlayCircle, CheckCircle2, Lock, Loader2 } from "lucide-react";

function NovaIcon() {
  return <span className="font-bold text-sm">N</span>;
}

export default function AreaMembros({ curso, onBack }: { curso: any; onBack: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [aulaAtiva, setAulaAtiva] = useState<any>(null);
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

      if (!aulas || aulas.length === 0) { setLoading(false); return; }

      const agrupado = aulas.reduce((acc: any, aula: any) => {
        const modulo = aula.modulo_titulo || "Conteúdo";
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push(aula);
        return acc;
      }, {});

      setModulos(Object.keys(agrupado).map(titulo => ({ titulo, aulas: agrupado[titulo] })));
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
    return concluidas.includes(todasAsAulas[idx-1].id);
  };

  const aoCarregarMetadados = () => {
    if(videoRef.current) setMetaSegundos(Math.floor(videoRef.current.duration * 0.95));
  }

  const aoAtualizarTempo = () => {
    if (!videoRef.current || !aulaAtiva) return;
    const tempo = videoRef.current.currentTime;
    if (!concluidas.includes(aulaAtiva.id)) {
      if (tempo > tempoMaximoAssistido.current + 2) videoRef.current.currentTime = tempoMaximoAssistido.current;
      else tempoMaximoAssistido.current = Math.max(tempoMaximoAssistido.current, tempo);
      if(Math.floor(tempo) >= metaSegundos && metaSegundos>0) setPodeConcluir(true);
    }
  }

  const concluir = async () => {
    if(!user || !aulaAtiva) return;
    setConcluidas(prev => [...prev, aulaAtiva.id]);
    await supabase.from("progresso_aulas").insert({ user_id: user.id, aula_id: aulaAtiva.id });
  }

  if(loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-400"/>
    </div>
  )

  return (
    <div className="h-screen flex flex-col text-zinc-900 bg-white">
      {/* HEADER */}
      <header className="flex items-center px-4 h-14 border-b gap-2">
        <NovaIcon />
        <button onClick={onBack} className="text-zinc-600"><ChevronLeft size={18}/></button>
        <h1 className="text-sm font-medium truncate">{curso?.curso_titulo}</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* PLAYER */}
        <main className="flex-1 overflow-y-auto">
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
              <source src={aulaAtiva.url_video} type="video/mp4"/>
            </video>
          )}

          <div className="px-4 py-2">
            <h2 className="text-sm font-medium mb-1">{aulaAtiva?.titulo}</h2>

            {!concluidas.includes(aulaAtiva.id) && (
              <button 
                disabled={!podeConcluir}
                onClick={concluir}
                className="text-xs text-zinc-600 hover:text-black disabled:text-zinc-300"
              >Marcar como concluída</button>
            )}

            {concluidas.includes(aulaAtiva.id) && (
              <span className="text-xs text-zinc-500 flex items-center gap-1"><CheckCircle2 size={14}/> Concluída</span>
            )}
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="w-[300px] border-l overflow-y-auto px-2 py-2 text-sm">
          {modulos.map((modulo, i) => (
            <div key={i} className="mb-2">
              <div className="text-zinc-500 uppercase text-xs font-medium px-1 py-1">{modulo.titulo}</div>
              {modulo.aulas.map(aula => {
                const liberada = estaLiberada(aula.id);
                return (
                  <button
                    key={aula.id}
                    onClick={() => setAulaAtiva(aula)}
                    disabled={!liberada}
                    className={`flex items-center gap-1 px-1 py-1 w-full text-left 
                      ${aulaAtiva?.id === aula.id ? "font-medium text-black" : "text-zinc-700"}
                      ${!liberada && "opacity-40 cursor-not-allowed"}
                    `}
                  >
                    {concluidas.includes(aula.id) ? <CheckCircle2 size={12}/> : liberada ? <PlayCircle size={12}/> : <Lock size={12}/>}
                    <span className="truncate">{aula.titulo}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
