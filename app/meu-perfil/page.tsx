"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProfileLayout from "@/app/components/perfil/ProfileLayout"; // Ajuste o caminho se necessário

export default function MeuPerfilPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [idiomas, setIdiomas] = useState<any[]>([]);
const [interessesHobbies, setInteressesHobbies] = useState<string[]>([]);
const [habilidades, setHabilidades] = useState<any[]>([]);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = "/login"; // Redireciona se não estiver logado
      return;
    }

    // 1. Carregar Perfil (Sua lógica original)
    let { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2. Carregar Cursos da View (Sua lógica original)
    const { data: dataCursos } = await supabase
      .from("dashboard_cursos_progresso")
      .select("*")
      .eq("usuario_id", user.id);

    // 3. Carregar Conexões para os Stats
    const { data: conexoes } = await supabase
      .from("conexoes")
      .select("*")
      .or(`solicitante.eq.${user.id},receptor.eq.${user.id}`);

    let seguindo = 0, seguidores = 0, networking = 0;
    conexoes?.forEach((c) => {
      if (c.solicitante === user.id) seguindo++;
      if (c.receptor === user.id) seguidores++;
      if (c.status === "aprovado") networking++;
    });

        // 4. Carregar Idiomas do usuário
const { data: idiomas } = await supabase
  .from("idiomas")
  .select("*")
  .eq("usuario_id", user.id);
 setIdiomas(idiomas || []);
  // 5. Interesses & Hobbies
const { data: interesses } = await supabase
  .from("usuarios_interesses")
  .select("interesse")  // se a coluna se chama "interesse"
  .eq("usuario_id", user.id);

setInteressesHobbies(interesses?.map(i => i.interesse) || []);

 
// 6. Carregar Habilidades
const { data: habilidades } = await supabase
  .from("habilidades")
  .select("*")
  .eq("usuario_id", user.id);

setHabilidades(habilidades || []);



    setPerfil({
      ...usuario,
      seguindo,
      seguidores,
      networking,
    });
    
    // Formatar cursos para o layout
    const cursosFormatados = dataCursos?.map((c: any) => ({
      id: c.inscricao_id || c.id,
      titulo: c.curso_titulo || "Sem título",
      data: c.data_inscricao,
      imagem: c.curso_imagem || "/capa.png",
      concluido: (c.total_aulas > 0 && c.aulas_concluidas >= c.total_aulas),
    })) || [];

    setCursos(cursosFormatados);
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center">Carregando seu perfil...</div>;

  return (
    <ProfileLayout 
      perfil={perfil}
      cursosInscritos={cursos}
      cursosConcluidos={cursos.filter(c => c.concluido)}
      loadingCursos={loading}
       idiomas={idiomas}
    interessesHobbies={interessesHobbies}
    habilidades={habilidades} 
      isOwner={true} // Aqui é TRUE porque esta é a "Minha Página"
      onUpdatePerfil={(updated) => setPerfil(updated)}
    />
  );
}