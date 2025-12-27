"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, AlertCircle, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Formulario {
  id: string;
  titulo: string;
  descricao: string;
  tipo_recompensa: string;
  data_inicio: string;
  data_fim: string;
  premiado: boolean;
  limitado: boolean;
  total_candidatos?: number;
  empresas?: { nome: string };
}

export default function descubrir() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabSelecionado, setTabSelecionado] = useState("ativos");
  const [participantes, setParticipantes] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const formatarData = (dataString?: string) => {
    if (!dataString) return "--.--.--";
    const data = new Date(dataString);
    return `${String(data.getDate()).padStart(2, "0")}.${String(data.getMonth() + 1).padStart(2, "0")}.${data.getFullYear()}`;
  };

  const calcularPrazo = (dataFim?: string) => {
    if (!dataFim) return "--";
    const hoje = new Date();
    const fim = new Date(dataFim);
    const dias = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (dias > 0) return `Faltam ${dias} dia${dias > 1 ? "s" : ""}`;
    if (dias === 0) return "Encerra hoje";
    return `Encerrado há ${Math.abs(dias)} dia${Math.abs(dias) > 1 ? "s" : ""}`;
  };

  const fetchFormularios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("formularios")
      .select("id, titulo, descricao, tipo_recompensa, data_inicio, data_fim, premiado, limitado, total_candidatos, empresas(nome)")
      .order("created_at", { ascending: false });

    if (!error) {
      setFormularios(data || []);
      fetchParticipantes(data || []);
    }
    setLoading(false);
  };

  const fetchParticipantes = async (formulariosData: Formulario[]) => {
    try {
      const { data: respostas, error } = await supabase.from("respostas").select("formulario_id, usuario_id");
      if (error) return;

      const contagem: Record<string, Set<string>> = {};
      respostas.forEach((r: any) => {
        if (!contagem[r.formulario_id]) contagem[r.formulario_id] = new Set();
        contagem[r.formulario_id].add(r.usuario_id);
      });

      const totalUnicos: Record<string, number> = {};
      Object.keys(contagem).forEach((formId) => (totalUnicos[formId] = contagem[formId].size));
      setParticipantes(totalUnicos);
    } catch {}
  };

  useEffect(() => {
    fetchFormularios();
  }, []);

  const filtrarPorStatus = () => {
    const agora = new Date();
    let dados = [...formularios];

    if (tabSelecionado === "ativos") dados = dados.filter((f) => new Date(f.data_fim) >= agora);
    if (tabSelecionado === "encerrados") dados = dados.filter((f) => new Date(f.data_fim) < agora);
    if (tabSelecionado === "premiados") dados = dados.filter((f) => f.premiado);

    if (searchQuery) dados = dados.filter((f) => f.titulo.toLowerCase().includes(searchQuery.toLowerCase()));

    return dados;
  };

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-6 bg-white">
      {/* Busca */}
      <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 mb-4 gap-2">
        <Calendar size={16} className="text-gray-400" />
        <input
          className="flex-1 bg-transparent outline-none text-sm text-gray-700"
          placeholder={`Buscar ${tabSelecionado}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-4 border-b border-gray-200">
        {["ativos", "encerrados", "premiados"].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabSelecionado(tab)}
            className={`pb-2 text-sm font-medium ${
              tabSelecionado === tab ? "border-b-2 border-black text-black" : "text-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="border-4 border-gray-200 border-t-black rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : filtrarPorStatus().length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Nenhum item encontrado</p>
      ) : (
        <div className="flex flex-col overflow-y-auto">
          {filtrarPorStatus().map((item) => {
            const hoje = new Date();
            const dataFim = new Date(item.data_fim);
            const isEncerrado = dataFim < hoje;
            const qtdParticipantes = participantes[item.id] || 0;
            const limiteAtingido = item.limitado && qtdParticipantes >= (item.total_candidatos || 0);

            return (
              <div
                key={item.id}
                className="w-full border-t border-gray-300 py-3 bg-white/30"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-md font-bold text-gray-900">{item.titulo}</h2>
                  <div className="flex flex-col text-xs text-gray-500 gap-1 text-right">
                    <span>
                      Prazo: {formatarData(item.data_inicio)} → {formatarData(item.data_fim)}
                    </span>
                    <span className={isEncerrado ? "text-red-600" : "text-green-600"}>
                      {calcularPrazo(item.data_fim)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-1">{item.descricao}</p>

                {/* Limite */}
                {item.limitado && (
                  <div className="flex items-center gap-2 mt-1 mb-1">
                    <AlertCircle size={16} className="text-yellow-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {qtdParticipantes} de {item.total_candidatos || 0} participantes
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((qtdParticipantes / (item.total_candidatos || 1)) * 100, 100)}%`,
                            backgroundColor: limiteAtingido ? "#e74c3c" : "#2ecc71",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                  <div className="flex flex-col">
                    <span>Criado por {item.empresas?.nome || "Anónimo"}</span>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={12} /> {qtdParticipantes} {qtdParticipantes === 1 ? "participante" : "participantes"}
                    </div>
                  </div>

                  {isEncerrado ? (
                    <div className="flex items-center gap-1 bg-red-100 text-red-600 rounded px-2 py-1 text-xs">
                      <Lock size={14} /> Encerrado
                    </div>
                  ) : limiteAtingido ? (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-xs">
                      <AlertCircle size={14} /> Limite atingido
                    </div>
                  ) : (
                    <button
                      className="bg-black text-white px-3 py-1 rounded text-xs"
                      onClick={() => router.push(`/Detalhes/DetalhesFormulario?id=${item.id}`)}
                    >
                      Ver detalhes →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
