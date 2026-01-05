"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CheckCircle,
  CloudUpload,
  FileText,
  Loader2,
  List,
  Info,
  Gift,
  Clock,
  Pencil,
  CheckSquare,
  Square,
  Circle,
} from "lucide-react";

/* ================= HEADER ================= */
const CustomHeader = ({ title, onBack }: any) => (
  <div className="flex items-center gap-3 bg-black text-white px-4 py-4 sticky top-0 z-20">
    <button onClick={onBack}>
      <ArrowLeft />
    </button>
    <h1 className="font-semibold truncate">{title}</h1>
  </div>
);

/* ================= HELPERS ================= */
const formatarData = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) ? d.toLocaleDateString("pt-BR") : "Data inválida";
};

/* ================= INFO BOX ================= */
const InfoBox = ({ icon: Icon, title, details, color }: any) => (
  <div className="border-t border-gray-300/30 py-3 mt-2">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={color || "text-gray-700"} size={18} />
      <span className="font-semibold">{title}</span>
    </div>
    {details.map((text: string, i: number) => {
      const parts = text.split("**");
      return (
        <p key={i} className="text-sm text-gray-700 ml-6">
          •{" "}
          {parts.map((p, idx) =>
            idx % 2 === 1 ? <strong key={idx}>{p}</strong> : <span key={idx}>{p}</span>
          )}
        </p>
      );
    })}
  </div>
);

/* ================= LABEL ================= */
const QuestionLabel = ({ numero, texto, isRequired, exigeUpload }: any) => (
  <p className="font-semibold text-gray-800 mb-2">
    {numero && <span className="font-bold">{numero}. </span>}
    {texto}
    {isRequired && <span> *</span>}
    {exigeUpload && <span className="text-gray-500"> (Arquivo)</span>}
  </p>
);

/* ================= QUESTION FIELD ================= */
const QuestionField = ({
  pergunta,
  respostaObj,
  handleRespostaChange,
  handleArquivoSelecionado,
  isSubmitting,
  numero,
}: any) => {
  const isMultiple = pergunta.tipo_selecao === "radio" && pergunta.quantidade_selecao > 1;
  const isRequired = pergunta.obrigatoria || pergunta.exige_upload;

  /* RADIO / CHECKBOX */
  if (pergunta.tipo_selecao === "radio") {
    const options = JSON.parse(pergunta.opcoes || "[]");

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-300/30 p-4 mb-3">
        <QuestionLabel numero={numero} texto={pergunta.texto} isRequired={isRequired} />

        {options.map((op: string, idx: number) => {
          const atual = respostaObj.resposta || (isMultiple ? [] : "");
          const selected = isMultiple ? atual.includes(op) : atual === op;

          return (
            <button
              key={idx}
              onClick={() =>
                handleRespostaChange(pergunta.id, op, pergunta.quantidade_selecao)
              }
              className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-2xl border mb-2
                ${selected ? "border-black bg-gray-100" : "border-gray-300/30 hover:border-gray-500"}`}
            >
              {isMultiple ? (
                selected ? <CheckSquare /> : <Square />
              ) : selected ? (
                <Circle fill="black" />
              ) : (
                <Circle />
              )}
              <span>{op}</span>
            </button>
          );
        })}

        {isMultiple && (
          <p className="text-xs text-gray-500 italic">
            Selecione até {pergunta.quantidade_selecao}
          </p>
        )}
      </div>
    );
  }

  /* COMBOBOX */
  if (pergunta.tipo_selecao === "combobox") {
    const options = JSON.parse(pergunta.opcoes || "[]");

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-300/30 p-4 mb-3">
        <QuestionLabel numero={numero} texto={pergunta.texto} isRequired={isRequired} />
        <select
          value={respostaObj.resposta || ""}
          onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
          className="w-full border rounded-2xl border-gray-300/30 p-2 bg-gray-50"
        >
          <option value="">Selecione uma opção...</option>
          {options.map((o: string, i: number) => (
            <option key={i} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }

  /* UPLOAD */
  if (pergunta.exige_upload) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-300/30 p-4 mb-3">
        <QuestionLabel
          numero={numero}
          texto={pergunta.texto}
          isRequired={isRequired}
          exigeUpload
        />
        <label className="flex items-center justify-center gap-2 bg-gray-700 text-white py-2 rounded cursor-pointer">
          <CloudUpload />
          {respostaObj?.arquivo ? "Arquivo Selecionado" : "Selecionar Arquivo"}
          <input
            type="file"
            className="hidden"
            disabled={isSubmitting}
            onChange={(e) => handleArquivoSelecionado(pergunta.id, e.target.files?.[0])}
          />
        </label>
        {respostaObj?.arquivo && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <FileText />
            {respostaObj.arquivo.name}
          </div>
        )}
      </div>
    );
  }

  /* TEXTO */
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-300/30 p-4 mb-3">
      <QuestionLabel numero={numero} texto={pergunta.texto} isRequired={isRequired} />
      <textarea
        rows={4}
        className="w-full border rounded-2xl border-gray-300/30 p-2 bg-gray-50"
        placeholder="Digite sua resposta aqui"
        value={respostaObj.resposta || ""}
        onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
      />
    </div>
  );
};

/* ================= PAGE ================= */
export default function DetalhesFormulario() {
  const { id } = useParams();
  const router = useRouter();

  const [formObj, setFormObj] = useState<any>({});
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [respostas, setRespostas] = useState<any[]>([]);
  const [criterios, setCriterios] = useState<any[]>([]);
  const [detalhes, setDetalhes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!id) return setLoading(false);

      try {
        const { data: form, error: formError } = await supabase
          .from("formularios")
          .select("*")
          .eq("id", id)
          .single();
        if (formError || !form) return setLoading(false);
        setFormObj(form);

        const { data: perguntasData } = await supabase
          .from("perguntas")
          .select("*")
          .eq("formulario_id", id);
        const perguntasSafe = Array.isArray(perguntasData) ? perguntasData : [];
        setPerguntas(perguntasSafe);

        setRespostas(
          perguntasSafe.map((p: any) => ({
            pergunta_id: p.id,
            resposta: p.quantidade_selecao > 1 ? [] : "",
            arquivo: null,
          }))
        );

        const { data: critData } = await supabase
          .from("criterios")
          .select("texto")
          .eq("formulario_id", id);
        setCriterios(critData || []);

        const { data: detData } = await supabase
          .from("detalhes_evento")
          .select("texto")
          .eq("formulario_id", id);
        setDetalhes(detData || []);

        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: ja } = await supabase
            .from("respostas")
            .select("id")
            .eq("formulario_id", id)
            .eq("usuario_id", userData.user.id)
            .limit(1);
          if (ja?.length) setJaRespondeu(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleRespostaChange = useCallback(
    (perguntaId: string, valor: any, limite = 1) => {
      setRespostas((prev) =>
        prev.map((r) => {
          if (r.pergunta_id !== perguntaId) return r;
          if (Array.isArray(r.resposta)) {
            let novo = [...r.resposta];
            if (novo.includes(valor)) novo = novo.filter((x) => x !== valor);
            else if (novo.length < limite) novo.push(valor);
            return { ...r, resposta: novo };
          }
          return { ...r, resposta: valor };
        })
      );
    },
    []
  );

  const handleArquivoSelecionado = (perguntaId: string, file?: File) => {
    if (!file) return;
    setRespostas((prev) =>
      prev.map((r) => (r.pergunta_id === perguntaId ? { ...r, arquivo: file } : r))
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userResp = await supabase.auth.getUser();
      const userId = userResp.data.user?.id;
      if (!userId) {
        alert("Você precisa estar logado para enviar respostas!");
        setIsSubmitting(false);
        return;
      }

      for (const r of respostas) {
        let arquivoUrl = null;
        if (r.arquivo) {
          const fileExt = r.arquivo.name.split(".").pop();
          const fileName = `${userId}_${r.pergunta_id}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from("respostas_arquivos")
            .upload(fileName, r.arquivo, { upsert: true });
          if (error) {
            console.error("Erro ao enviar arquivo:", error);
            continue;
          }
          arquivoUrl = data.path;
        }

        await supabase.from("respostas").insert({
          formulario_id: id,
          pergunta_id: r.pergunta_id,
          usuario_id: userId,
          resposta: Array.isArray(r.resposta) ? r.resposta : r.resposta || null,
          arquivo_url: arquivoUrl,
          criado_em: new Date(),
        });
      }

      alert("Respostas enviadas com sucesso!");
      setJaRespondeu(true);
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
      alert("Ocorreu um erro ao enviar suas respostas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" />
        Carregando formulário...
      </div>
    );

  if (jaRespondeu)
    return (
      <>
        <CustomHeader title="Detalhes do Formulário" onBack={() => router.back()} />
        <div className="max-w-xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-300/30">
          <h2 className="text-xl font-bold">{formObj.titulo}</h2>
          <div className="flex items-center gap-2 mt-4 bg-green-100 p-3 rounded">
            <CheckCircle className="text-green-600" />
            Você já respondeu este formulário.
          </div>
        </div>
      </>
    );

  return (
    <>
      <CustomHeader title="Responder Formulário" onBack={() => router.back()} />

      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="bg-white mt-6 p-6 rounded-2xl shadow-lg border border-gray-300/30">
          <h1 className="text-2xl font-bold">{formObj.titulo}</h1>
          <p className="italic text-sm text-gray-500">
            Criado por: {formObj.nome_autor || formObj.criado_por}
          </p>
          {formObj.descricao && <p className="mt-4 text-gray-700">{formObj.descricao}</p>}

          {(formObj.recompensa_ativa === true ||
            formObj.recompensa_ativa === "true" ||
            formObj.recompensa_ativa === 1) && (
            <InfoBox
              icon={Gift}
              title="Recompensa"
              color="text-yellow-500"
              details={[
                formObj.tipo_recompensa && `Tipo: **${formObj.tipo_recompensa}**`,
                formObj.valor_recompensa &&
                  `Valor: **${new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(formObj.valor_recompensa)}**`,
              ].filter(Boolean)}
            />
          )}

          <InfoBox
            icon={Clock}
            title="Período"
            details={[
              `Início: **${formatarData(formObj.data_inicio)}**`,
              `Fim: **${formatarData(formObj.data_fim)}**`,
            ]}
          />

          {criterios.length > 0 && (
            <InfoBox icon={List} title="Critérios" details={criterios.map((c) => c.texto)} />
          )}

          {detalhes.length > 0 && (
            <InfoBox icon={Info} title="Detalhes" details={detalhes.map((d) => d.texto)} />
          )}
        </div>

        {perguntas.length > 0 && (
          <div className="flex items-center gap-2 mt-8 mb-4">
            <Pencil />
            <h2 className="font-bold text-lg">Preenchimento do Formulário</h2>
          </div>
        )}

        {perguntas.map((p, i) => (
          <QuestionField
            key={p.id}
            pergunta={p}
            respostaObj={respostas.find((r) => r.pergunta_id === p.id) || {}}
            handleRespostaChange={handleRespostaChange}
            handleArquivoSelecionado={handleArquivoSelecionado}
            isSubmitting={isSubmitting}
            numero={i + 1}
          />
        ))}

        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="mt-8 w-full bg-black text-white py-4 rounded-full font-bold"
        >
          {isSubmitting ? "Enviando..." : "Enviar Respostas"}
        </button>
      </div>
    </>
  );
}
