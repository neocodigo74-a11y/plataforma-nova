"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BarraPesquisa() {
  const router = useRouter();

  return (
    <div className="bg-white px-4 py-2">
      <button
        onClick={() => router.push("/pesquisa")}
        className="
          flex items-center gap-2 w-full
          bg-gray-100 rounded-lg
          px-3 py-2
          text-left
          hover:bg-gray-200 transition
        "
      >
        {/* Ícone */}
        <Search size={16} className="text-gray-400 shrink-0" />

        {/* Tag decorativa */}
        <span className="
          bg-gray-200
          text-gray-700
          text-[11px]
          px-2 py-0.5
          rounded-md
          whitespace-nowrap
        ">
          Meus NOVA
        </span>

        {/* Texto */}
        <span className="
          text-gray-900
          text-[11px] sm:text-xs
          truncate
        ">
          pesquisar oportunidades no NOVA
        </span>
      </button>
    </div>
  );
}
