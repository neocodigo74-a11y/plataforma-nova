"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useComments(postId: string) {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comentarios")
      .select("*, usuarios(nome, foto_perfil)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const addComment = async (text: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !text) return;

    await supabase.from("comentarios").insert({
      post_id: postId,
      user_id: user.id,
      conteudo: text,
    });

    fetchComments();
  };

  return { comments, addComment };
}
