"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { UserPlus, Verified, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DetalhesUsuario from "../components/DetalhesUsuario"; // ajustar o caminho se necessário

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

interface SugestoesContasProps {
  onSelectUser?: (id: string) => void;
}

export default function networking({ onSelectUser }: SugestoesContasProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [networkingUsers, setNetworkingUsers] = useState<Usuario[]>([]);
  const [conexoes, setConexoes] = useState<Record<string, Conexao>>({});
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<"sugestoes" | "networking">("sugestoes");
  const loaderRef = useRef<HTMLDivElement>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string | null>(null);

  const ITENS_POR_PAGINA = 10;

  useEffect(() => {
    const carregarUsuario = async () => {
      const { data } = await supabase.auth.getSession();
      const id = data?.session?.user?.id || null;
      setUsuarioId(id);
    };
    carregarUsuario();
  }, []);

  const fetchConexoes = async (id: string) => {
    const { data } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${id},receptor.eq.${id}`);
    const mapa: Record<string, Conexao> = {};
    data?.forEach((c: any) => {
      const outroId = c.solicitante === id ? c.receptor : c.solicitante;
      mapa[outroId] = { status: c.status, solicitante: c.solicitante, receptor: c.receptor };
    });
    setConexoes(mapa);
  };

  const fetchUsuarios = async (paginaAtual = 0, reset = false) => {
    if (!usuarioId) return;
    if (reset) setCarregando(true);

    const { data } = await supabase
      .from("usuarios")
      .select("id, nome, tipo, bio, foto_perfil, verificado, premium")
      .in("tipo", ["Empresa", "Startup", "Universidade", "Estudante"])
      .neq("id", usuarioId)
      .order("created_at", { ascending: false })
      .range(paginaAtual * ITENS_POR_PAGINA, (paginaAtual + 1) * ITENS_POR_PAGINA - 1);

    if (data?.length) {
      setUsuarios((prev) =>
        reset ? data : [...prev, ...data.filter((u) => !prev.some((p) => p.id === u.id))]
      );
    }

    if (!data || data.length < ITENS_POR_PAGINA) setHasMore(false);
    setCarregando(false);
  };

  const fetchNetworking = async () => {
    if (!usuarioId) return;
    const { data: conexoesAprovadas } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${usuarioId},receptor.eq.${usuarioId}`)
      .eq("status", "aprovado");

    if (!conexoesAprovadas?.length) {
      setNetworkingUsers([]);
      return;
    }

    const idsNetworking = conexoesAprovadas.map(c => (c.solicitante === usuarioId ? c.receptor : c.solicitante));
    const { data: usuariosData } = await supabase
      .from("usuarios")
      .select("id, nome, tipo, bio, foto_perfil, verificado, premium")
      .in("id", idsNetworking);

    setNetworkingUsers(usuariosData || []);
  };

  useEffect(() => {
    if (!usuarioId) return;
    fetchConexoes(usuarioId);
    fetchUsuarios(0, true);
    fetchNetworking();
  }, [usuarioId]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !carregando && activeTab === "sugestoes") {
          const novaPagina = pagina + 1;
          setPagina(novaPagina);
          fetchUsuarios(novaPagina);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [pagina, hasMore, carregando, activeTab]);

  const sugestoesFiltradas = usuarios.filter((u) => {
    const conexao = conexoes[u.id];
    return !conexao || (conexao.status !== "pendente" && conexao.status !== "aprovado");
  });

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

    setConexoes((prev) => ({ ...prev, [receptorId]: { status: "pendente", solicitante: usuarioId, receptor: receptorId } }));
  };

  const renderBotaoConexao = (itemId: string) => {
    const conexao = conexoes[itemId];
    if (!usuarioId) return <button className="px-3 py-1 rounded-full bg-gray-300 text-white text-sm">Login p/ conectar</button>;
    if (conexao?.status === "aprovado") return <div className="px-3 py-1 rounded-full bg-gray-500 text-white text-sm">Networking</div>;
    if (conexao?.status === "pendente") return <div className="px-3 py-1 rounded-full bg-gray-400 text-white text-sm">Pendente</div>;
    return (
      <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-sm" onClick={() => iniciarConexao(itemId)}>
        <UserPlus size={16} /> Conectar
      </button>
    );
  };

  const renderLista = (lista: Usuario[]) => (
    <AnimatePresence>
      {(carregando && lista.length === 0 ? Array.from({ length: 5 }) : lista).map((item: any, index) => (
        <motion.div
          key={item?.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg mb-2"
        >
          {item ? (
            <>
              <div className="relative">
                {item.foto_perfil ? (
                  <Image src={item.foto_perfil} alt={item.nome} width={45} height={45} className="rounded-full" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center">
                    {item.nome?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                {item.verificado && <Verified className="absolute -bottom-1 -right-1" size={14} color={item.premium ? "#DAA520" : "#000"} />}
              </div>
              <div className="flex-1">
                <p className="font-semibold cursor-pointer" onClick={() => onSelectUser?.(item.id)}>
                  {item.nome} <span className="text-gray-500 font-normal">• {item.tipo}</span>
                </p>
                <p className="text-gray-600 text-sm">{item.bio || `Conta ${item.tipo.toLowerCase()} para networking`}</p>
              </div>
              <div>{renderBotaoConexao(item.id)}</div>
            </>
          ) : (
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );

  if (usuarioSelecionado) {
    return (
      <div>
        <button className="mb-4 px-3 py-1 bg-gray-200 rounded-full" onClick={() => setUsuarioSelecionado(null)}>
          ← Voltar
        </button>
        <DetalhesUsuario usuarioId={usuarioSelecionado} usuarioLogadoId={usuarioId!} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex py-8 justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Sugestões de Contas</h1>
        <button onClick={() => { fetchUsuarios(0, true); fetchNetworking(); }} className="p-2 rounded-full bg-gray-200">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex border-b border-gray-300 mb-4">
        <button
          className={`flex-1 py-2 text-center font-medium ${activeTab === "sugestoes" ? "border-b-2 border-black text-black" : "text-gray-500"}`}
          onClick={() => setActiveTab("sugestoes")}
        >
          Sugestões
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${activeTab === "networking" ? "border-b-2 border-black text-black" : "text-gray-500"}`}
          onClick={() => setActiveTab("networking")}
        >
          Networking
        </button>
      </div>

      {activeTab === "sugestoes" && renderLista(sugestoesFiltradas)}
      {activeTab === "networking" && renderLista(networkingUsers)}

      <div ref={loaderRef} className="h-6 flex justify-center items-center mt-3">
        {carregando && <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>}
      </div>
    </div>
  );
}
