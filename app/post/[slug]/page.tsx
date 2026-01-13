import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface PostQuery {
  id: number;
  usuario_id: string;
  conteudo: string;
  imagem?: string;
  created_at: string;
  slug: string;
  usuarios?: { nome: string; foto_perfil?: string };
}

export default async function PostPage({ params }: any) {
  const { slug } = await params; // ✅ resolver params

  const { data: postData, error } = await supabase
    .from("posts")
    .select(`
      id,
      usuario_id,
      conteudo,
      imagem,
      created_at,
      slug,
      usuarios!posts_usuario_id_fkey(nome, foto_perfil)
    `)
    .eq("slug", slug)
    .single<PostQuery>();

  if (error || !postData) return notFound(); // retorna 404 se não encontrou

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-lg font-bold">{postData.usuarios?.nome}</h1>
      <p>{postData.conteudo}</p>
      {postData.imagem && <img src={postData.imagem} alt="Post" />}
      <p className="text-sm text-gray-500">{new Date(postData.created_at).toLocaleString()}</p>
    </div>
  );
}

export async function generateStaticParams() {
  const { data } = await supabase.from("posts").select("slug");

  return data?.map((post) => ({
    slug: post.slug,
  })) ?? [];
}
