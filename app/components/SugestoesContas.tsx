"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { RefreshCw, UserPlus, Check, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

type Usuario = {
  id: string;
  nome: string;
  tipo: string;
  foto_perfil?: string;
  verificado?: boolean;
  premium?: boolean;
  bio?: string;
};

export default function SugestoesContas() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [conexoes, setConexoes] = useState<Record<string, any>>({});
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  // 🔹 Buscar usuário autenticado
  useEffect(() => {
    const carregarUsuario = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Erro ao obter sessão:", error);
      const userId = data?.session?.user?.id || null;
      setUsuarioId(userId);
    };
    carregarUsuario();
  }, []);

  // 🔹 Buscar conexões
  const fetchConexoes = async (id: string) => {
    if (!id) return {};
    const { data } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${id},receptor.eq.${id}`);
    const mapa: Record<string, any> = {};
    data?.forEach((c: any) => {
      const outroId = c.solicitante === id ? c.receptor : c.solicitante;
      mapa[outroId] = { status: c.status, solicitante: c.solicitante, receptor: c.receptor };
    });
    setConexoes(mapa);
    return mapa;
  };

  // 🔹 Carregar usuários
  const carregarUsuarios = async () => {
    if (!usuarioId) {
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      const conexoesMap = await fetchConexoes(usuarioId);
      const tipos = ["Empresa", "Startup", "Universidade", "Estudante"];
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, tipo, foto_perfil, verificado, premium, bio")
        .in("tipo", tipos)
        .neq("id", usuarioId);

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        return;
      }

      if (data && data.length > 0) {
        const filtrados = data.filter(
          (u: any) => conexoesMap[u.id]?.status !== "pendente" && conexoesMap[u.id]?.status !== "aprovado"
        );
        const aleatorios = filtrados.sort(() => 0.5 - Math.random()).slice(0, 3);
        setUsuarios(aleatorios);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (usuarioId) carregarUsuarios();
  }, [usuarioId]);

  // 🔹 Atualizar manualmente
  const handleAtualizar = () => {
    setRefreshing(true);
    carregarUsuarios();
  };

  // 🔹 Ações de conexão
  const iniciarConexao = async (receptorId: string) => {
    if (!usuarioId) return router.push("/login");

    const { error } = await supabase.from("conexoes").insert({
      solicitante: usuarioId,
      receptor: receptorId,
      status: "pendente",
    });

    if (error) {
      console.error("Erro ao iniciar conexão:", error);
      return;
    }

    setConexoes(prev => ({
      ...prev,
      [receptorId]: { status: "pendente", solicitante: usuarioId, receptor: receptorId },
    }));

    setUsuarios(prev => prev.filter(u => u.id !== receptorId));
  };

  const renderBotaoConexao = (itemId: string) => {
    const conexao = conexoes[itemId];

    if (!usuarioId)
      return (
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-1 px-3 py-1 bg-gray-300 rounded-full text-sm font-bold"
        >
          Login p/ conectar
        </button>
      );

    if (conexao?.status === "aprovado")
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-gray-500 rounded-full text-sm font-bold text-white">
          <FileCheck /> Networking
        </div>
      );

    if (conexao?.status === "pendente")
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-gray-400 rounded-full text-sm font-bold text-white">
          Pendente
        </div>
      );

    return (
      <button
        onClick={() => iniciarConexao(itemId)}
        className="flex items-center gap-1 px-3 py-1 bg-black rounded-full text-white text-sm font-bold"
      >
        <UserPlus /> Conectar
      </button>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 border rounded-md shadow-md bg-white max-w-full sm:max-w-2xl md:max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg sm:text-xl md:text-2xl">Sugestões de Contas</h2>
        <motion.button
          animate={{ rotate: refreshing ? 360 : 0 }}
          transition={{ duration: 0.6 }}
          onClick={handleAtualizar}
          className="p-2 sm:p-3 md:p-4 rounded-full bg-gray-200"
        >
          <RefreshCw size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </motion.button>
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <div className="flex justify-center items-center py-10">Carregando...</div>
      ) : usuarios.length === 0 ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          Nenhuma sugestão disponível no momento
        </div>
      ) : (
        <ul className="space-y-4">
          {usuarios.map(item => (
            <li
              key={item.id}
              className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 md:gap-8"
            >
              {/* Avatar */}
              <div className="relative">
                {item.foto_perfil ? (
                  <img
                    src={item.foto_perfil}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
                    {item.nome?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                {(item.verificado || item.premium) && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                    <Check color={item.premium ? "#DAA520" : "#000"} size={14} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">
                  <button
                    onClick={() => router.push(`/PerfilDetalhe/${item.id}`)}
                    className="text-left text-sm sm:text-base md:text-lg"
                  >
                    {item.nome}{" "}
                    <span className="font-normal text-gray-500">• {item.tipo}</span>
                  </button>
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base truncate">
                  {item.bio || `Conta ${item.tipo.toLowerCase()} para networking`}
                </p>
              </div>

              {/* Botão */}
              <div className="mt-2 sm:mt-0">{renderBotaoConexao(item.id)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
