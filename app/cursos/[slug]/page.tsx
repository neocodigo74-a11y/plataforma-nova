import { supabase } from "@/lib/supabase";
import DetalheCurso from "../../components/DetalheCurso";
import { notFound } from "next/navigation";

interface CursoQuery {
  id: string | number;
  grupo?: string;
  imagem?: string;
  recomendado?: boolean;
  fornecedor_id?: string | number;
  titulo: string;
  descricao: string;
  avaliacao?: number | null;
  avaliacoes_texto?: string | null;
  detalhes?: string | null;
  texto_recomendado?: string | null;
  tags?: string | null;
  slug: string;
}

interface Curso {
  id: string | number;
  group?: string;
  image?: string;
  recommended?: boolean;
  supplierId?: string;
  title: string;
  description: string;
  rating?: number;
  reviewsText?: string;
  details?: string;
  recommendedText?: string;
  tags?: string[];
  slug: string;
}

export default async function CursoPage({ params, searchParams }: any) {
  const resolvedParams = await params;       // ✅ await para params
  const resolvedSearch = await searchParams; // ✅ await para searchParams

  const { slug } = resolvedParams;
  const referrerId = resolvedSearch?.ref;

  const { data: cursoData, error } = await supabase
    .from("cursos_academia")
    .select(`
      id,
      grupo,
      imagem,
      recomendado,
      fornecedor_id,
      titulo,
      descricao,
      avaliacao,
      avaliacoes_texto,
      detalhes,
      texto_recomendado,
      tags,
      slug
    `)
    .eq("slug", slug)
    .single<CursoQuery>();

  if (error || !cursoData) return notFound();
  
if (referrerId) {
  await supabase.from("referrals").insert({
    referrer_id: referrerId,
    curso_slug: slug,
  });
}

 const cursoMapeado: Curso = {
  id: cursoData.id,
  group: cursoData.grupo,
  image: cursoData.imagem,
  recommended: cursoData.recomendado,
  supplierId: cursoData.fornecedor_id
    ? String(cursoData.fornecedor_id)
    : undefined,
  title: cursoData.titulo,
  description: cursoData.descricao,
  rating: cursoData.avaliacao ?? undefined,
  reviewsText: cursoData.avaliacoes_texto ?? undefined,
  details: cursoData.detalhes ?? undefined,
  recommendedText: cursoData.texto_recomendado ?? undefined,

  tags: Array.isArray(cursoData.tags)
    ? cursoData.tags
    : typeof cursoData.tags === "string"
      ? cursoData.tags.split(",").map((t) => t.trim())
      : [],

  slug: cursoData.slug,
};


  return <DetalheCurso curso={cursoMapeado} />;
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from("cursos_academia")
    .select("slug");

  return data?.map((curso) => ({
    slug: curso.slug,
  })) ?? [];
}
