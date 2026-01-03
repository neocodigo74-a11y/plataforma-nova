"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  UserPlus,
  Verified,
  RefreshCw,
  SearchX,
  Info,
  X,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DetalhesUsuario from "../components/DetalhesUsuario";

/* ===================== TYPES ===================== */
interface Usuario {
  id: string;
  nome: string;
  tipo: string;
  bio?: string;
  foto_perfil?: string;
  verificado?: boolean;
  premium?: boolean;
}

interface Conexao {
  status: "pendente" | "aprovado";
  solicitante: string;
  receptor: string;
}

interface Props {
  onSelectUser?: (id: string) => void;
}

/* ===================== DEBOUNCE ===================== */
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/* ===================== COMPONENT ===================== */
export default function Networking({ onSelectUser }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [networkingUsers, setNetworkingUsers] = useState<Usuario[]>([]);
  const [conexoes, setConexoes] = useState<Record<string, Conexao>>({});
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] =
    useState<"sugestoes" | "networking">("sugestoes");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 500);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string | null>(
    null
  );
  const [mostrarBanner, setMostrarBanner] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);

  const ITENS_POR_PAGINA = 10;

  /* ===================== USUÁRIO LOGADO ===================== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuarioId(data?.session?.user?.id || null);
    });
  }, []);

  /* ===================== CONEXÕES ===================== */
  const fetchConexoes = async (id: string) => {
    const { data } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${id},receptor.eq.${id}`);

    const mapa: Record<string, Conexao> = {};
    data?.forEach((c: any) => {
      const outroId = c.solicitante === id ? c.receptor : c.solicitante;
      mapa[outroId] = {
        status: c.status,
        solicitante: c.solicitante,
        receptor: c.receptor,
      };
    });

    setConexoes(mapa);
  };

  /* ===================== BUSCA USUÁRIOS ===================== */
  const fetchUsuarios = async (paginaAtual = 0, reset = false) => {
    if (!usuarioId) return;

    if (reset) {
      setUsuarios([]);
      setPagina(0);
      setHasMore(true);
      setCarregando(true);
    }

    let query = supabase
      .from("usuarios")
      .select("id, nome, tipo, bio, foto_perfil, verificado, premium")
      .in("tipo", [
        "Empresa",
        "Startup",
        "Universidade",
        "Investidor",
        "Estudante",
      ])
      .neq("id", usuarioId)
      .order("created_at", { ascending: false });

    if (buscaDebounced.trim()) {
      query = query.or(
        `nome.ilike.%${buscaDebounced}%,tipo.ilike.%${buscaDebounced}%`
      );
    }

    const { data } = await query.range(
      paginaAtual * ITENS_POR_PAGINA,
      paginaAtual * ITENS_POR_PAGINA + ITENS_POR_PAGINA - 1
    );

    if (data?.length) {
      setUsuarios((prev) =>
        reset
          ? data
          : [...prev, ...data.filter((u) => !prev.some((p) => p.id === u.id))]
      );
    }

    if (!data || data.length < ITENS_POR_PAGINA) setHasMore(false);
    setCarregando(false);
  };

  /* ===================== NETWORKING ===================== */
  const fetchNetworking = async () => {
    if (!usuarioId) return;

    const { data } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${usuarioId},receptor.eq.${usuarioId}`)
      .eq("status", "aprovado");

    if (!data?.length) {
      setNetworkingUsers([]);
      return;
    }

    const ids = data.map((c) =>
      c.solicitante === usuarioId ? c.receptor : c.solicitante
    );

    const { data: usuariosData } = await supabase
      .from("usuarios")
      .select("id, nome, tipo, bio, foto_perfil, verificado, premium")
      .in("id", ids);

    setNetworkingUsers(usuariosData || []);
  };

  /* ===================== INIT ===================== */
  useEffect(() => {
    if (!usuarioId) return;
    fetchConexoes(usuarioId);
    fetchUsuarios(0, true);
    fetchNetworking();
  }, [usuarioId]);

  /* ===================== BUSCA REATIVA ===================== */
  useEffect(() => {
    if (!usuarioId) return;
    fetchUsuarios(0, true);
  }, [buscaDebounced]);

  /* ===================== INFINITE SCROLL ===================== */
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !carregando &&
          activeTab === "sugestoes"
        ) {
          const next = pagina + 1;
          setPagina(next);
          fetchUsuarios(next);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [pagina, hasMore, carregando, activeTab]);

  /* ===================== CONEXÃO ===================== */
  const iniciarConexao = async (receptorId: string) => {
    if (!usuarioId) return;

    await supabase.from("conexoes").insert({
      solicitante: usuarioId,
      receptor: receptorId,
      status: "pendente",
    });
       await supabase.from("notificacoes").insert({
      tipo: "solicitacao_conexao",
      conteudo: "Enviou uma solicitação de conexão para você.",
      recebido_por: receptorId,
      enviado_por: usuarioId,
    });

    setConexoes((prev) => ({
      ...prev,
      [receptorId]: {
        status: "pendente",
        solicitante: usuarioId,
        receptor: receptorId,
      },
    }));
  };

  const renderBotaoConexao = (id: string) => {
    const c = conexoes[id];

    if (!usuarioId)
      return (
        <span className="px-3 py-1 rounded-full bg-gray-300 text-white text-sm">
          Login p/ conectar
        </span>
      );

    if (c?.status === "aprovado")
      return (
        <span className="px-3 py-1 rounded-full bg-gray-500 text-white text-sm">
          Networking
        </span>
      );

    if (c?.status === "pendente")
      return (
        <span className="px-3 py-1 rounded-full bg-gray-400 text-white text-sm">
          Pendente
        </span>
      );

    return (
      <button
        onClick={() => iniciarConexao(id)}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-sm"
      >
        <UserPlus size={14} /> Conectar
      </button>
    );
  };

  /* ===================== LISTA ===================== */
  const renderLista = (lista: Usuario[]) => {
    if (!carregando && lista.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <SearchX size={48} />
          <p className="mt-2 text-sm">
            Nenhum usuário encontrado para “{buscaDebounced}”
          </p>
        </div>
      );
    }

    return (
      <AnimatePresence>
        {lista.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg mb-2"
          >
            <div className="relative">
              {item.foto_perfil ? (
             <div className="w-11 h-11 rounded-full overflow-hidden relative flex-shrink-0">
  <Image
    src={item.foto_perfil}
    alt={item.nome}
    fill
    style={{ objectFit: "cover" }}
    className="rounded-full"
  />
</div>
              ) : (
                <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center">
                  {item.nome[0].toUpperCase()}
                </div>
              )}
              {item.verificado && (
                <Verified
                  size={14}
                  className="absolute -bottom-1 -right-1"
                  color={item.premium ? "#DAA520" : "#000"}
                />
              )}
            </div>

            <div className="flex-1">
              <p
                onClick={() => setUsuarioSelecionado(item.id)}
                className="font-semibold cursor-pointer"
              >
                {item.nome}{" "}
                <span className="text-gray-500 font-normal">
                  • {item.tipo}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {item.bio || "Conta para networking"}
              </p>
            </div>

            {renderBotaoConexao(item.id)}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  if (usuarioSelecionado) {
    return (
      <DetalhesUsuario
        usuarioId={usuarioSelecionado}
        usuarioLogadoId={usuarioId!}
      />
    );
  }

  return (
    <div className="w-full">
    {/* 🔥 BANNER FULL WIDTH */}
    {mostrarBanner && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-screen -mx-4 border-b mb-5 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 relative"
      >
          <button
            onClick={() => setMostrarBanner(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-black"
          >
            <X size={16} />
          </button>

          <div className="flex gap-3">
            <Info size={22} className="text-blue-600 mt-1" />
            <div>
            
              <p className="text-sm text-blue-800 mt-9">
                Conecta-te com startups, empresas, investidores e universidades.
                Cria oportunidades reais através de conexões estratégicas.
              </p>
            </div>
          </div>
        </motion.div>
      )}
 
      

      {/* Busca */}
<div className="w-full mb-1 px-3  bg-white">
  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-1 py-1">
    {/* Ícone de pesquisa */}
    <Search size={16} className="text-gray-400 shrink-0" />

    {/* Tag decorativa */}
    <div className="bg-gray-200 px-2 py-0.5 rounded-md">
      <span className="text-xs text-gray-700 whitespace-nowrap">
       Networking
      </span>
    </div>

    {/* Input real */}
    <input
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      placeholder="Pesquisar usuários..."
      className="flex-1 bg-transparent outline-none text-sm text-gray-800"
    />
  </div>
</div>


      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("sugestoes")}
          className={`flex-1 py-2 ${
            activeTab === "sugestoes"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Sugestões
        </button>
        <button
          onClick={() => setActiveTab("networking")}
          className={`flex-1 py-2 ${
            activeTab === "networking"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Networking
        </button>
      </div>

      {activeTab === "sugestoes" && renderLista(usuarios)}
      {activeTab === "networking" && renderLista(networkingUsers)}

      <div ref={loaderRef} className="h-6 flex justify-center mt-3">
        {carregando && (
          <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
