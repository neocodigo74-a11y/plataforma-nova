"use client";

import { useState } from "react";
import { useReactions } from "@/app/hooks/useReactions";
import ReactionModal from "./ReactionModal";
import Comments from "./Comments";

export default function Publication({ post }: any) {
  const user = post.usuarios;
  const { counts, userReaction, react } = useReactions(post.id);
  const [open, setOpen] = useState(false);

  return (
    <article className="bg-white border-b px-4 py-5 space-y-3 relative">
      {/* HEADER */}
      <div className="flex gap-3">
        <img
          src={user?.foto_perfil || "/avatar-default.png"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">{user?.nome}</p>
          <p className="text-xs text-zinc-500">há alguns minutos</p>
        </div>
      </div>

      {/* CONTENT */}
      <h3 className="font-semibold">{post.title}</h3>
      <p className="text-sm text-zinc-700">{post.abstract}</p>

      {/* ACTIONS */}
      <div className="flex gap-4 text-sm">
        <button onClick={() => setOpen(!open)}>
          👍 {(counts.like || 0)}
        </button>
        <span>💬</span>
      </div>

      {open && <ReactionModal onSelect={(t: any) => react(t)} />}

      {/* COMMENTS */}
      <Comments postId={post.id} />
    </article>
  );
}
