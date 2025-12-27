"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TYPES = ["like", "love", "rocket", "clap"] as const;
type ReactionType = typeof TYPES[number];

export function useReactions(postId: string) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from("reacoes")
      .select("tipo");

    const grouped: Record<string, number> = {};
    data?.forEach((r) => {
      grouped[r.tipo] = (grouped[r.tipo] || 0) + 1;
    });

    setCounts(grouped);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("reacoes")
        .select("tipo")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      setUserReaction(data?.tipo || null);
    }
  };

  const react = async (tipo: ReactionType) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("reacoes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    await supabase.from("reacoes").insert({
      post_id: postId,
      user_id: user.id,
      tipo,
    });

    setUserReaction(tipo);
    fetchReactions();
  };

  return { counts, userReaction, react };
}
