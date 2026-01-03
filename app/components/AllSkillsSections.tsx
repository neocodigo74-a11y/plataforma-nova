"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import CourseCarouselSection from "./CourseCarouselSection";
import DetalheCurso from "./DetalheCurso";

/* =========================
   Tipagem Unificada
========================= */
export interface SkillItem {
  id: number;
  image: string;
  isRecommended: boolean;
  provider: string;
  title: string;
  description: string;
  rating?: number;
  reviews?: number;
  grup: string;
  details?: string;
  recommendedText?: string;
  tags: string[];
  type: "curso" | "micro";
  durationMin?: number;
    questionsCount?: number;
}

interface AllSkillsSectionsProps {
  onCourseSelect: (course: SkillItem) => void;
}

export default function AllSkillsSections({
  onCourseSelect,
}: AllSkillsSectionsProps) {
  const [coursesByGroup, setCoursesByGroup] =
    useState<Record<string, SkillItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [userOnboarding, setUserOnboarding] = useState<{
    objetivo: string;
    funcoes_interesse: string[];
  } | null>(null);

  const [selectedCourse, setSelectedCourse] =
    useState<SkillItem | null>(null);

  /* =========================
     Selecionar Item
  ========================= */
  const handleCourseSelect = useCallback((course: SkillItem) => {
    setSelectedCourse(course);
  }, []);

  /* =========================
     Buscar usuário + cursos + micro
  ========================= */
  const fetchUserAndSkills = useCallback(async () => {
    setLoading(true);

    try {
      /* 1️⃣ Usuário logado */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setLoading(false);
        return;
      }

      /* 2️⃣ Onboarding */
      const { data: onboardingData, error: onboardingError } =
        await supabase
          .from("usuarios_onboarding")
          .select("objetivo, funcoes_interesse")
          .eq("id", user.id)
          .single();

      if (onboardingError || !onboardingData) {
        setLoading(false);
        return;
      }

      setUserOnboarding(onboardingData);

      /* 3️⃣ Cursos */
      const { data: cursosData } = await supabase
        .from("cursos_academia")
        .select(`
          id, grupo, imagem, recomendado, titulo, descricao,
          avaliacao, avaliacoes_texto, detalhes, texto_recomendado, tags,
          fornecedores (nome)
        `);

      /* 4️⃣ Microaprendizados */
      const { data: microData } = await supabase
        .from("microaprendizados")
        .select(`
          id, grupo, imagem, recomendado, titulo, descricao,
          duracao_min, perguntas_count, detalhes, texto_recomendado, tags,
          fornecedores (nome)
        `);

      const grouped: Record<string, SkillItem[]> = {};

      /* =========================
         Normalização do usuário
      ========================= */
      const objetivoUser =
        onboardingData.objetivo?.trim().toLowerCase();

      const interessesUser =
        onboardingData.funcoes_interesse?.map((f: string) =>
          f.trim().toLowerCase()
        ) || [];

      const matchUserCriteria = (tags: string[]) => {
        const tagsNorm = tags.map((t) =>
          t.trim().toLowerCase()
        );

        const matchInteresse = tagsNorm.some((tag) =>
          interessesUser.includes(tag)
        );

        const matchObjetivo = objetivoUser
          ? tagsNorm.includes(objetivoUser)
          : false;

        return matchInteresse || matchObjetivo;
      };

      /* =========================
         Inserir CURSOS
      ========================= */
      cursosData?.forEach((curso: any) => {
  if (!matchUserCriteria(curso.tags || [])) return;

  const grupo = curso.grupo || "Geral";
  const groupKey = `Curso: ${grupo}`; // ⚡ Cada grupo de curso tem prefixo "Curso:"
  if (!grouped[groupKey]) grouped[groupKey] = [];

  grouped[groupKey].push({
    id: Number(curso.id),
    image: curso.imagem,
    grup: grupo,
    isRecommended: Boolean(curso.recomendado),
    provider: curso.fornecedores?.nome || "Desconhecido",
    title: curso.titulo,
    description: curso.descricao,
    rating: Number(curso.avaliacao) || 0,
    reviews: Number(curso.avaliacoes_texto) || 0,
    details: curso.detalhes || "",
    recommendedText: curso.texto_recomendado || "",
    tags: curso.tags || [],
    type: "curso",
  });
});

/* =========================
   Inserir MICROAPRENDIZADOS
========================= */
microData?.forEach((micro: any) => {
  if (!matchUserCriteria(micro.tags || [])) return;

  const grupo = micro.grupo || "Geral";
  const groupKey = `Microaprendizado: ${grupo}`; // ⚡ Cada microaprendizado tem prefixo diferente
  if (!grouped[groupKey]) grouped[groupKey] = [];

  grouped[groupKey].push({
    id: Number(micro.id),
    image: micro.imagem,
    grup: grupo,
    isRecommended: Boolean(micro.recomendado),
    provider: micro.fornecedores?.nome || "Desconhecido",
    title: micro.titulo,
    description: micro.descricao,
    details: micro.detalhes || "",
    recommendedText: micro.texto_recomendado || "",
    tags: micro.tags || [],
    durationMin: micro.duracao_min,
    type: "micro",
   
    questionsCount: micro.perguntas_count,
  });
});

      /* =========================
         Ordenar por recomendados
      ========================= */
      Object.keys(grouped).forEach((group) => {
        grouped[group].sort(
          (a, b) =>
            Number(b.isRecommended) -
            Number(a.isRecommended)
        );
      });

      setCoursesByGroup(grouped);
      setLoading(false);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndSkills();
  }, [fetchUserAndSkills]);

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

  if (loading)
    return (
      <div className="text-center py-20">
        Carregando conteúdos...
      </div>
    );

  if (!userOnboarding)
    return (
      <div className="text-center py-20">
        Perfil não encontrado.
      </div>
    );

  if (Object.keys(coursesByGroup).length === 0)
    return (
      <div className="text-center py-20">
        Nenhum conteúdo disponível para seu objetivo atual.
      </div>
    );

  /* =========================
     LISTA DE CARROSSEL
  ========================= */
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-full mx-auto px-4 py-1 space-y-12">
        {Object.entries(coursesByGroup).map(
          ([group, items]) => (
            <CourseCarouselSection
              key={group}
              title={`Habilidades em demanda para ${group}`}
              courses={items}
              tags={[
                "Todos",
                ...new Set(
                  items.flatMap((c) => c.tags || [])
                ),
              ]}
              activeTag="Todos"
              onCourseSelect={handleCourseSelect}
            />
          )
        )}
      </div>
    </div>
  );
}
