"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import ProfileLayout from "@/app/components/perfil/ProfileLayout";

export default function PerfilPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idDaURL = resolvedParams.id;

  const [perfil, setPerfil] = useState<any>(null);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | null>(null);
  const [conexao, setConexao] = useState<any>(null);
  
  const [cursos, setCursos] = useState<{
    inscritos: any[];
    concluidos: any[];
    loading: boolean;
  }>({
    inscritos: [],
    concluidos: [],
    loading: true
  });

  useEffect(() => {
    async function carregarTudo() {
      if (!idDaURL) return;

      // 1. Obter usuário logado para lógica de conexão
      const { data: { user } } = await supabase.auth.getUser();
      const meId = user?.id || null;
      setUsuarioLogadoId(meId);

      // 2. Carregar Perfil + Onboarding (Objetivos)
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", idDaURL)
        .single();

      const { data: onboarding } = await supabase
        .from("usuarios_onboarding")
        .select("objetivo, funcoes_interesse")
        .eq("id", idDaURL)
        .single();

      // 3. Carregar Conexões e Calcular Stats
      const { data: conexoes } = await supabase
        .from("conexoes")
        .select("*")
        .or(`solicitante.eq.${idDaURL},receptor.eq.${idDaURL}`);

      let seguindo = 0, seguidores = 0, networking = 0;
      conexoes?.forEach((c: any) => {
        if (c.solicitante === idDaURL) seguindo++;
        if (c.receptor === idDaURL) seguidores++;
        if (c.status === "aprovado") networking++;
      });

      // 4. Verificar se existe conexão entre o logado e este perfil
      if (meId && meId !== idDaURL) {
        const { data: link } = await supabase
          .from("conexoes")
          .select("*")
          .or(`and(solicitante.eq.${meId},receptor.eq.${idDaURL}),and(solicitante.eq.${idDaURL},receptor.eq.${meId})`)
          .single();
        setConexao(link);
      }

      setPerfil({
        ...usuario,
        criador: usuario?.email === "osvaniosilva74@gmail.com",
        objetivo: onboarding?.objetivo,
        funcoes_interesse: onboarding?.funcoes_interesse || [],
        seguindo,
        seguidores,
        networking,
      });

      // 5. Carregar Cursos
      const { data: dataCursos } = await supabase
        .from("dashboard_cursos_progresso")
        .select("*")
        .eq("usuario_id", idDaURL);

      const formatados = dataCursos?.map((c: any) => ({
        id: c.id,
        titulo: c.curso_titulo,
        data: c.data_inscricao,
        imagem: c.curso_imagem || "/capa.png",
        concluido: (c.total_aulas > 0 && c.aulas_concluidas >= c.total_aulas)
      })) || [];

      setCursos({
        inscritos: formatados,
        concluidos: formatados.filter((f: any) => f.concluido),
        loading: false
      });
    }

    carregarTudo();
  }, [idDaURL]);

  // Funções de Ação de Conexão
  async function handleConectar() {
    if (!usuarioLogadoId) return alert("Faça login para conectar");
    const { data } = await supabase.from("conexoes").insert({
      solicitante: usuarioLogadoId,
      receptor: idDaURL,
      status: "pendente",
    }).select().single();
    setConexao(data);
  }

  if (!perfil) return <div className="p-6 text-center">Carregando dados do perfil...</div>;

  return (
    <ProfileLayout 
      perfil={perfil}
      cursosInscritos={cursos.inscritos}
      cursosConcluidos={cursos.concluidos}
      loadingCursos={cursos.loading}
      isOwner={usuarioLogadoId === idDaURL} // Se eu visitar meu próprio link, vira "Owner"
      onUpdatePerfil={(updated) => setPerfil(updated)}
      // Props extras para o sistema de conexão que seu Layout pode usar:
      conexao={conexao}
      onConectar={handleConectar}
    />
  );
}