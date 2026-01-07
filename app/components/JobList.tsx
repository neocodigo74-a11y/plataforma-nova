"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Building2, Calendar, X } from "lucide-react";

/* ======================= TIPOS ======================= */
type Vaga = {
  id: number;
  cargo: string;
  localizacao: string;
  empresa: string;
  salario: string;
  etiqueta?: string;
  descricao?: string;
};

/* ======================= COMPONENTE PRINCIPAL ======================= */
export default function ListaVagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [search, setSearch] = useState("");
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [candidaturaAberta, setCandidaturaAberta] = useState(false);

  useEffect(() => {
    buscarVagas();
  }, [search]);

  async function buscarVagas() {
    let query = supabase
      .from("vagas")
      .select("*")
      .order("data_criacao", { ascending: false });

    if (search) query = query.ilike("cargo", `%${search}%`);

    const { data, error } = await query;
    if (error) console.log(error);
    else setVagas(data || []);
  }

  return (
    <div className="w-full bg-white p-4 md:p-6 space-y-5">
      {/* 🔍 Search */}
      <div className="relative py-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Pesquisar por cargos e habilidades"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* 💼 LISTA DE VAGAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vagas.map((vaga) => (
          <VagaCard
            key={vaga.id}
            {...vaga}
            onVerDetalhes={() => setVagaSelecionada(vaga)}
          />
        ))}
      </div>

      {/* ================= MODAL DE DETALHES ================= */}
      {vagaSelecionada && !candidaturaAberta && (
        <Modal onClose={() => setVagaSelecionada(null)}>
          <h2 className="text-lg font-bold">{vagaSelecionada.cargo}</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Empresa:</span> {vagaSelecionada.empresa}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Localização:</span> {vagaSelecionada.localizacao}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Salário:</span> {vagaSelecionada.salario}
          </p>
          <p className="mt-2 text-gray-700">{vagaSelecionada.descricao || "Sem descrição."}</p>

          <button
            onClick={() => setCandidaturaAberta(true)}
            className="mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            Candidatar-se
          </button>
        </Modal>
      )}

      {/* ================= MODAL DE CANDIDATURA ================= */}
      {vagaSelecionada && candidaturaAberta && (
        <Modal onClose={() => setCandidaturaAberta(false)}>
          <h2 className="text-lg font-bold mb-2">Candidatura: {vagaSelecionada.cargo}</h2>
          <CandidaturaForm
            vagaId={vagaSelecionada.id}
            onSuccess={() => {
              alert("Candidatura enviada com sucesso!");
              setCandidaturaAberta(false);
              setVagaSelecionada(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

/* ======================= CARD DE VAGA ======================= */
function VagaCard({
  cargo,
  localizacao,
  empresa,
  salario,
  etiqueta,
  onVerDetalhes,
}: Vaga & { onVerDetalhes: () => void }) {
  return (
    <div
      className="flex gap-3 border border-gray-300/60 rounded-lg p-3 hover:shadow-sm transition cursor-pointer"
      onClick={onVerDetalhes}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100">
        <Building2 className="w-5 h-5 text-gray-500" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{cargo}</h3>
          {etiqueta && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
              {etiqueta}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {localizacao}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {empresa}
          </span>
        </div>

        <p className="text-xs text-gray-700">
          <span className="font-medium">Salário:</span> {salario}
        </p>
      </div>
    </div>
  );
}

/* ======================= MODAL GENÉRICO ======================= */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-5 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ======================= FORMULÁRIO DE CANDIDATURA ======================= */
function CandidaturaForm({
  vagaId,
  onSuccess,
}: {
  vagaId: number;
  onSuccess: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function enviarCandidatura() {
    const { error } = await supabase.from("candidaturas").insert([
      {
        vaga_id: vagaId,
        nome_candidato: nome,
        email_candidato: email,
        telefone: telefone,
        mensagem: mensagem,
      },
    ]);

    if (error) alert("Erro ao enviar candidatura: " + error.message);
    else onSuccess();
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
      <input
        type="email"
        placeholder="Seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
      <input
        type="text"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
      <textarea
        placeholder="Mensagem / Proposta"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      />
      <button
        onClick={enviarCandidatura}
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
      >
        Enviar Proposta
      </button>
    </div>
  );
}
