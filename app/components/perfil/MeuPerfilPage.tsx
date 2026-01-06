"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProfileLayout from "./ProfileLayout";

export default function MeuPerfilPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [cursos, setCursos] = useState({ inscritos: [], concluidos: [], loading: true });

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 1. Buscar Perfil (Lógica do seu carregarPerfil original)
      const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
      
      // 2. Buscar Cursos (Lógica do seu carregarCursos original)
      // ... (Inserir aqui sua lógica de fetch da view dashboard_cursos_progresso)
      
      setPerfil(usuario);
      setCursos({ inscritos: [], concluidos: [], loading: false }); // Preencher com resultados
    }
    carregar();
  }, []);

  if (!perfil) return <div className="p-6 text-center">Carregando seu perfil...</div>;

  return (
    <ProfileLayout 
      perfil={perfil}
      cursosInscritos={cursos.inscritos}
      cursosConcluidos={cursos.concluidos}
      loadingCursos={cursos.loading}
      isOwner={true}
      onUpdatePerfil={(updated) => setPerfil(updated)}
    />
  );
}