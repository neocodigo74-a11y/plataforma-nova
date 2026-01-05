"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Calendar, CheckCircle, ArrowLeft } from "lucide-react";

interface Pergunta {
  id: string;
  texto: string;
  obrigatoria: boolean;
  exige_upload: boolean;
  tipo_selecao: string;
  quantidade_selecao: number;
  opcoes?: string;
}

interface Resposta {
  pergunta_id: string;
  resposta: string | string[];
  arquivo?: File | null;
}

interface Formulario {
  id: string;
  titulo: string;
  descricao?: string;
  nome_autor?: string;
  criado_por?: string;
  usuarios?: { nome: string };
  imagem_url?: string;
  recompensa_ativa?: boolean | string | number;
  tipo_recompensa?: string;
  valor_recompensa?: number;
  data_inicio?: string;
  data_fim?: string;
  premiado?: boolean;
  limitado?: boolean;
  total_candidatos?: number;
  empresas?: { nome: string } | null;
}

interface InfoBoxProps {
  icon: React.ReactNode;
  title: string;
  details: string[];
  color?: string;
  horizontal?: boolean;
}

export default function FormularioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFormularioId = searchParams.get("id");

  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [participantes, setParticipantes] = useState<Record<string, number>>({});
  const [tabSelecionado, setTabSelecionado] = useState("ativos");
  const [searchQuery, setSearchQuery] = useState("");

  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [criterios, setCriterios] = useState<{ texto: string }[]>([]);
  const [detalhes, setDetalhes] = useState<{ texto: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarioJaRespondeu, setUsuarioJaRespondeu] = useState(false);

  // --- Formatação ---
  const formatarData = (d?: string) =>
    d
      ? `${new Date(d).getDate().toString().padStart(2, "0")}.${(
          new Date(d).getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}.${new Date(d).getFullYear()}`
      : "--.--.--";

  const calcularPrazo = (dataFim?: string) => {
    if (!dataFim) return "--";
    const dias = Math.ceil(
      (new Date(dataFim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return dias > 0
      ? `Faltam ${dias} dia${dias > 1 ? "s" : ""}`
      : dias === 0
      ? "Encerra hoje"
      : `Encerrado há ${Math.abs(dias)} dia${Math.abs(dias) > 1 ? "s" : ""}`;
  };

  // --- Carregar lista de formulários ---
  const fetchFormularios = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("formularios")
      .select(
        "id, titulo, descricao, tipo_recompensa, data_inicio, data_fim, premiado, limitado, total_candidatos, empresas(nome)"
      )
      .order("created_at", { ascending: false });

    if (data) {
      const f = data.map((f: any) => ({ ...f, empresas: f.empresas?.[0] || null }));
      setFormularios(f);

      // Participantes
      const { data: respostas } = await supabase
        .from("respostas")
        .select("formulario_id, usuario_id");
      const contagem: Record<string, Set<string>> = {};
      respostas?.forEach((r: any) => {
        if (!contagem[r.formulario_id]) contagem[r.formulario_id] = new Set();
        contagem[r.formulario_id].add(r.usuario_id);
      });
      const total: Record<string, number> = {};
      Object.keys(contagem).forEach((id) => (total[id] = contagem[id].size));
      setParticipantes(total);
    }
    setLoading(false);
  }, []);

  // --- Carregar dados detalhados do formulário ---
  const carregarDados = useCallback(async (formularioId: string | null) => {
    if (!formularioId) return setFormulario(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    // Já respondeu?
    const { data: jaRespondeu } = await supabase
      .from("respostas")
      .select("id")
      .eq("formulario_id", formularioId)
      .eq("usuario_id", user.id)
      .limit(1);

    if (jaRespondeu?.length) {
      setUsuarioJaRespondeu(true);
      setLoading(false);
      return;
    }

    const { data: f } = await supabase.from("formularios").select("*").eq("id", formularioId).single();
    setFormulario(f);

    const { data: perguntasData } = await supabase.from("perguntas").select("*").eq("formulario_id", formularioId);
    setPerguntas(perguntasData || []);

    // Inicializa respostas com tipo seguro
    setRespostas(
      (perguntasData || []).map((p: Pergunta) => ({
        pergunta_id: p.id,
        resposta: p.tipo_selecao === "radio" && p.quantidade_selecao > 1 ? [] : "",
        arquivo: null
      }))
    );

    const { data: criteriosData } = await supabase.from("criterios").select("texto").eq("formulario_id", formularioId);
    const { data: detalhesData } = await supabase.from("detalhes_evento").select("texto").eq("formulario_id", formularioId);

    setCriterios(criteriosData || []);
    setDetalhes(detalhesData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFormularios(); }, [fetchFormularios]);
  useEffect(() => { carregarDados(selectedFormularioId); }, [carregarDados, selectedFormularioId]);

  // --- Função filtrar ---
  const filtrar = (): Formulario[] => {
    return formularios.filter(f => {
      const hoje = new Date();
      const dataFim = f.data_fim ? new Date(f.data_fim) : null;

      if (tabSelecionado === "ativos" && dataFim && dataFim < hoje) return false;
      if (tabSelecionado === "encerrados" && (!dataFim || dataFim >= hoje)) return false;
      if (tabSelecionado === "premiados" && !f.premiado) return false;

      if (searchQuery && !f.titulo.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  };

  // --- Respostas ---
  const handleRespostaChange = useCallback((perguntaId: string, valor: string, quantidadeSelecao = 1) => {
    setRespostas(prev => prev.map(r => {
      if (r.pergunta_id !== perguntaId) return r;
      if (quantidadeSelecao > 1) {
        const atuais = Array.isArray(r.resposta) ? r.resposta : [];
        let novo = [...atuais];
        if (atuais.includes(valor)) novo = atuais.filter(x => x !== valor);
        else if (atuais.length < quantidadeSelecao) novo.push(valor);
        return { ...r, resposta: novo };
      }
      return { ...r, resposta: valor };
    }));
  }, []);

  const handleArquivoSelecionado = (perguntaId: string, file?: File) => {
    if (!file) return;
    setRespostas(prev => prev.map(r => r.pergunta_id === perguntaId ? { ...r, arquivo: file } : r));
  };

  const enviarRespostas = async () => {
    if (!formulario?.id) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const entradasFinais: any[] = [];
      for (const pergunta of perguntas) {
        const resp = respostas.find(r => r.pergunta_id === pergunta.id) || { pergunta_id: pergunta.id, resposta: '', arquivo: null };
        let respostaFinal: string = "";
        const respostaTexto = Array.isArray(resp.resposta) ? resp.resposta.join(", ") : resp.resposta || "";

        if (resp.arquivo) {
          const file = resp.arquivo;
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `respostas/${formulario.id}/${user.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from("respostas").upload(filePath, file, { contentType: file.type, upsert: true });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from("respostas").getPublicUrl(filePath);
          if (data?.publicUrl) respostaFinal = data.publicUrl;
        } else respostaFinal = respostaTexto;

        entradasFinais.push({
          formulario_id: formulario.id,
          pergunta_id: pergunta.id,
          pergunta_texto: pergunta.texto,
          resposta_texto: respostaFinal,
          usuario_id: user.id
        });
      }

      const { error } = await supabase.from("respostas").insert(entradasFinais);
      if (error) throw error;

      alert("Respostas enviadas com sucesso!");
      setUsuarioJaRespondeu(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar respostas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 max-w-7xl mx-auto gap-4">
      {/* Lista de formulários */}
      <div className="md:w-1/3 flex flex-col gap-2">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 gap-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            placeholder={`Buscar ${tabSelecionado}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex justify-center gap-2 border-b border-gray-200 mt-2">
          {["ativos", "encerrados", "premiados"].map(tab => (
            <button
              key={tab}
              onClick={() => setTabSelecionado(tab)}
              className={`text-sm font-medium pb-2 ${tabSelecionado === tab ? "border-b-2 border-black text-black" : "text-gray-500"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-col overflow-y-auto max-h-[80vh]">
          {filtrar().map((item: Formulario) => {
            const hoje = new Date();
            const dataFim = item.data_fim ? new Date(item.data_fim) : null;
            const isEncerrado = dataFim ? dataFim < hoje : false;
            const qtd = participantes[item.id] || 0;

            return (
              <div
                key={item.id}
                className="border-t border-gray-300 py-2 px-3 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`?id=${item.id}`)}
              >
                <h2 className="text-sm font-semibold">{item.titulo}</h2>
                <p className="text-xs text-gray-500">{item.empresas?.nome || "Anónimo"}</p>
                <p className={`text-xs mt-1 ${isEncerrado ? "text-red-600" : "text-green-600"}`}>{calcularPrazo(item.data_fim)}</p>
                {item.limitado && (
                  <div className="w-full h-1 bg-gray-200 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((qtd / (item.total_candidatos || 1)) * 100, 100)}%`,
                        backgroundColor: qtd >= (item.total_candidatos || 0) ? "#e74c3c" : "#2ecc71"
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalhes do formulário */}
      <div className="md:w-2/3">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="border-4 border-gray-200 border-t-black rounded-full w-8 h-8 animate-spin"></div>
          </div>
        ) : formulario ? (
          <>
            {usuarioJaRespondeu ? (
              <div>
                <button className="flex items-center gap-2 mb-4 text-blue-600" onClick={() => router.back()}>
                  <ArrowLeft size={20} /> Voltar
                </button>
                <h1 className="text-2xl font-bold">{formulario.titulo}</h1>
                <p className="bg-green-100 text-green-800 p-3 rounded flex items-center gap-2 mt-4">
                  <CheckCircle />Você já respondeu.
                </p>
              </div>
            ) : (
              <div>
                <button className="flex items-center gap-2 mb-4 text-blue-600" onClick={() => router.back()}>
                  <ArrowLeft size={20} /> Voltar
                </button>
                <h1 className="text-2xl font-bold">{formulario.titulo}</h1>
                <p className="text-gray-500 mb-2">
                  Criado por: <strong>{formulario.nome_autor || formulario.criado_por || formulario.usuarios?.nome}</strong>
                </p>

                {perguntas.map((p, idx) => {
                  const r: Resposta = respostas.find(res => res.pergunta_id === p.id) || { pergunta_id: p.id, resposta: '', arquivo: null };

                  return (
                    <div key={p.id} className="border rounded p-3 mb-2">
                      <p className="font-semibold mb-1">{idx + 1}. {p.texto} {p.obrigatoria && '*'}</p>

                      {/* Radio */}
                      {p.tipo_selecao === "radio" && JSON.parse(p.opcoes || "[]").map((o: string) => (
                        <button
                          key={o}
                          className={`px-2 py-1 mr-1 mb-1 border rounded ${Array.isArray(r.resposta) ? r.resposta.includes(o) : r.resposta === o ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'}`}
                          onClick={() => handleRespostaChange(p.id, o, p.quantidade_selecao)}
                        >
                          {Array.isArray(r.resposta) ? r.resposta.includes(o) ? '🔘' : '⚪' : r.resposta === o ? '🔘' : '⚪'} {o}
                        </button>
                      ))}

                      {/* Combobox */}
                      {p.tipo_selecao === "combobox" && (
                        <select
                          className="w-full border p-1 rounded"
                          value={Array.isArray(r.resposta) ? '' : r.resposta}
                          onChange={e => handleRespostaChange(p.id, e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {JSON.parse(p.opcoes || "[]").map((o: string) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      )}

                      {/* Upload */}
                      {p.exige_upload && (
                        <input
                          type="file"
                          className="mt-1"
                          onChange={e => e.target.files?.[0] && handleArquivoSelecionado(p.id, e.target.files[0])}
                        />
                      )}

                      {/* Textarea */}
                      {!p.tipo_selecao && !p.exige_upload && (
                        <textarea
                          className="w-full border p-2 rounded"
                          value={Array.isArray(r.resposta) ? '' : r.resposta}
                          onChange={e => handleRespostaChange(p.id, e.target.value)}
                          rows={3}
                        />
                      )}
                    </div>
                  )
                })}

                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
                  onClick={enviarRespostas}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
              </div>
            )}
          </>
        ) : <p>Selecione um formulário</p>}
      </div>
    </div>
  );
}

// InfoBox
const InfoBox = ({ icon, title, details, color }: InfoBoxProps) => (
  <div className="border rounded p-3 mb-3 bg-gray-50">
    <div className="flex items-center mb-2" style={{ color }}>
      {icon} <span className="ml-2 font-semibold">{title}</span>
    </div>
    {details.map((d, idx) => {
      const parts = d.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
      return <p key={idx} className="ml-6">{parts}</p>;
    })}
  </div>
);
