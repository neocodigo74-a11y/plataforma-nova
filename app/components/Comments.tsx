"use client";

import { useState } from "react";
import { useComments } from "@/app/hooks/useComments";

export default function Comments({ postId }: any) {
  const { comments, addComment } = useComments(postId);
  const [text, setText] = useState("");

  return (
    <div className="space-y-3 mt-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreve um comentário..."
        className="w-full border rounded px-3 py-2 text-sm"
      />

      <button
        onClick={() => {
          addComment(text);
          setText("");
        }}
        className="text-sm font-medium"
      >
        Publicar
      </button>

      {comments.map((c) => (
        <div key={c.id} className="flex gap-2 text-sm">
          <img
            src={c.usuarios?.foto_perfil || "/avatar-default.png"}
            className="w-7 h-7 rounded-full"
          />
          <div>
            <p className="font-medium">{c.usuarios?.nome}</p>
            <p className="text-zinc-600">{c.conteudo}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
