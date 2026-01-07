"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AddInteresseModalProps {
  usuarioId: string;
  onClose: () => void;
  onSave: (novoInteresse: string) => void;
}

export default function AddInteresseModal({
  usuarioId,
  onClose,
  onSave,
}: AddInteresseModalProps) {
  const [interesse, setInteresse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!interesse.trim()) return alert("Digite um interesse válido");

    setLoading(true);
    try {
      // Salvar no Supabase
      const { error } = await supabase.from("usuarios_interesses").insert({
        usuario_id: usuarioId,
        interesse: interesse.trim(),
      });

      if (error) throw error;

      // Atualizar a lista local
      onSave(interesse.trim());
      setInteresse("");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Adicionar Interesse / Hobby</h2>
        <input
          type="text"
          value={interesse}
          onChange={(e) => setInteresse(e.target.value)}
          placeholder="Digite um interesse"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
