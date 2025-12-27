"use client";

import Image from "next/image";
import { FileText, Book } from "lucide-react";

export default function PublishBox({ userPhoto, userName }: any) {
  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center gap-3">
        {userPhoto ? (
        <img
  src={userPhoto}
  alt="Avatar"
  className="w-10 h-10 rounded-full object-cover"
/>

        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
            {userName[0]}
          </div>
        )}

        <input
          placeholder="Compartilhe seu trabalho..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-6 mt-3 text-sm text-zinc-500">
        <button className="flex items-center gap-2 hover:text-black">
          <FileText size={14} /> Artigo
        </button>
        <button className="flex items-center gap-2 hover:text-black">
          <Book size={14} /> Ebook
        </button>
      </div>
    </div>
  );
}
