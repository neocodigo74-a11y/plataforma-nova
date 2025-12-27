"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import CourseCarouselSection from "./CourseCarouselSection";
import DetalheCurso from "./DetalheCurso";

/* =========================
   Tipagem do Curso
========================= */
interface Course {
  id: number;
  image: string;
  isRecommended: boolean;
  provider: string;
  title: string;
  description: string;
  rating: number;
  reviews: string;
  grup:string;
  details: string;
  recommendedText: string;
  tags: string[];
}

export default function AllSkillsSections({ onCourseSelect }) {
  const [coursesByGroup, setCoursesByGroup] = useState<Record<string, Course[]>>({});
  const [loading, setLoading] = useState(true);
  const [userOnboarding, setUserOnboarding] = useState<{
    objetivo: string;
    funcoes_interesse: string[];
  } | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  /* =========================
     Selecionar Curso
  ========================= */
  const handleCourseSelect = useCallback((course: Course) => {
    setSelectedCourse(course);
  }, []);

  /* =========================
     Buscar usuário + cursos
  ========================= */
  const fetchUserAndCourses = useCallback(async () => {
    setLoading(true);

    try {
      // 1️⃣ Usuário logado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        return;
      }

      // 2️⃣ Onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from("usuarios_onboarding")
        .select("objetivo, funcoes_interesse")
        .eq("id", user.id)
        .single();

      if (onboardingError || !onboardingData) {
        setLoading(false);
        return;
      }

      setUserOnboarding(onboardingData);

      // 3️⃣ Cursos
      const { data: cursosData, error: cursosError } = await supabase
        .from("cursos_academia")
        .select(`
          id, grupo, imagem, recomendado, titulo, descricao,
          avaliacao, avaliacoes_texto, detalhes, texto_recomendado, tags,
          fornecedores (nome)
        `);

      if (cursosError || !cursosData) {
        setLoading(false);
        return;
      }

      /* =========================
         4️⃣ FILTRO NORMALIZADO
      ========================= */
      const grouped: Record<string, Course[]> = {};

      // Normalizamos os critérios do usuário uma única vez
      const objetivoUser = onboardingData.objetivo?.trim().toLowerCase();
      const interessesUser = onboardingData.funcoes_interesse?.map(f => f.trim().toLowerCase()) || [];

      cursosData.forEach((curso: any) => {
        // Normalizamos as tags do curso
        const tagsCurso = curso.tags?.map((t: string) => t.trim().toLowerCase()) || [];

        // Critério A: Alguma tag do curso está na lista de interesses do usuário?
        const matchInteresse = tagsCurso.some(tag => interessesUser.includes(tag));
        
        // Critério B: Alguma tag do curso é igual ao objetivo principal?
        const matchObjetivo = objetivoUser ? tagsCurso.includes(objetivoUser) : false;

        // Se não bater em nada, ignora este curso
        if (!matchInteresse && !matchObjetivo) return;

        // Se passou no filtro, adiciona ao grupo
        const nomeGrupo = curso.grupo || "Geral";
        if (!grouped[nomeGrupo]) grouped[nomeGrupo] = [];

        grouped[nomeGrupo].push({
          id: curso.id,
          image: curso.imagem,
          grup:curso.grupo,
          isRecommended: curso.recomendado,
          provider: curso.fornecedores?.nome || "Desconhecido",
          title: curso.titulo,
          description: curso.descricao,
          rating: curso.avaliacao,
          reviews: curso.avaliacoes_texto,
          details: curso.detalhes,
          recommendedText: curso.texto_recomendado,
          tags: curso.tags, // Mantemos as tags originais para exibição
        });
      });

      // 5️⃣ Ordenação por recomendados
      Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => Number(b.isRecommended) - Number(a.isRecommended));
      });

      setCoursesByGroup(grouped);
      setLoading(false);

    } catch (err) {
      console.error("Erro inesperado:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndCourses();
  }, [fetchUserAndCourses]);

  /* =========================
     RENDER CONDICIONAL
  ========================= */
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-white">
        <DetalheCurso
          curso={selectedCourse}
          onBack={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  if (loading) return <div className="text-center py-20">Carregando cursos...</div>;
  if (!userOnboarding) return <div className="text-center py-20">Perfil não encontrado.</div>;
  if (Object.keys(coursesByGroup).length === 0)
    return (
      <div className="text-center py-20">
        Nenhum curso disponível para seu objetivo atual.
      </div>
    );

  /* =========================
     LISTA DE CARROSSEL
  ========================= */
 return (
    <div className="bg-white min-h-screen">
      <div className="max-w-ful mx-auto px-4 py-10 space-y-12">
        {Object.entries(coursesByGroup).map(([group, courses]) => (
          <CourseCarouselSection
            key={group}
            title={`Habilidades em demanda para ${group}`}
            courses={courses}
            tags={["Todos", ...new Set(courses.flatMap(c => c.tags || []))]}
            activeTag="Todos"
            onCourseSelect={onCourseSelect} // Agora usa a prop vinda do pai
          />
        ))}
      </div>
    </div>
  );
}