"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AddIdiomaModalProps {
  onClose: () => void;
  onSave: (idiomaSalvo: {
    id: string;
    nome: string;
    nivel: string;
  }) => void;
}

export default function AddIdiomaModal({ onClose, onSave }: AddIdiomaModalProps) {
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nome || !nivel) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    // 1️⃣ Usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert("Usuário não autenticado");
      setLoading(false);
      return;
    }

    // 2️⃣ Inserir no Supabase
    const { data, error } = await supabase
      .from("idiomas")
      .insert({
        usuario_id: user.id,
        nome,
        nivel,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erro ao salvar idioma");
      return;
    }

    // 3️⃣ Retorna o idioma salvo
    onSave(data);

    // 4️⃣ Limpa e fecha
    setNome("");
    setNivel("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Adicionar Idioma</h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Idioma (ex: Inglês)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Nível (ex: Básico, Intermediário, Fluente)"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            disabled={loading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
