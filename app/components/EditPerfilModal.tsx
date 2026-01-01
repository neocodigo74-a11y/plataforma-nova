"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface EditModalProps {
  perfil: any;
  onClose: () => void;
  onUpdate: (updatedPerfil: any) => void;
}

export default function EditPerfilModal({ perfil, onClose, onUpdate }: EditModalProps) {
  const [nome, setNome] = useState(perfil.nome || "");
  const [ocupacao, setOcupacao] = useState(perfil.ocupacao || "");
  const [localizacao, setLocalizacao] = useState(perfil.localizacao || "");
  const [contacto, setContacto] = useState(perfil.contacto || "");
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoCapa, setFotoCapa] = useState<File | null>(null);
  const [previewPerfil, setPreviewPerfil] = useState(perfil.foto_perfil || "/avatar.png");
  const [previewCapa, setPreviewCapa] = useState(perfil.foto_capa || "/capa.png");
  const [loading, setLoading] = useState(false);

  // Preview da foto de perfil
  useEffect(() => {
    if (fotoPerfil) {
      const url = URL.createObjectURL(fotoPerfil);
      setPreviewPerfil(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fotoPerfil]);

  // Preview da foto de capa
  useEffect(() => {
    if (fotoCapa) {
      const url = URL.createObjectURL(fotoCapa);
      setPreviewCapa(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fotoCapa]);

  // Upload de arquivo para o Supabase Storage
  async function uploadFile(file: File, storageName: string) {
    const fileName = `${perfil.id}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(storageName)
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: publicData } = supabase.storage.from(storageName).getPublicUrl(fileName);
    return publicData.publicUrl;
  }

  // Salvar alterações
  async function handleSave() {
    setLoading(true);
    try {
      let fotoPerfilUrl = perfil.foto_perfil;
      let fotoCapaUrl = perfil.foto_capa;

      if (fotoPerfil) fotoPerfilUrl = await uploadFile(fotoPerfil, "perfil");
      if (fotoCapa) fotoCapaUrl = await uploadFile(fotoCapa, "capa");

      const { data, error } = await supabase
        .from("usuarios")
        .update({
          nome,
          ocupacao,
          localizacao,
          contacto,
          foto_perfil: fotoPerfilUrl,
          foto_capa: fotoCapaUrl,
        })
        .eq("id", perfil.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Editar Perfil</h2>

        <div className="space-y-3">
          {/* Previews das fotos */}
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-sm mb-1">Foto de Capa</label>
              <img
                src={previewCapa}
                alt="Capa"
                className="w-full h-24 object-cover rounded-md mb-1"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoCapa(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Foto de Perfil</label>
              <img
                src={previewPerfil}
                alt="Perfil"
                className="w-20 h-20 object-cover rounded-full mb-1 border"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoPerfil(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Inputs */}
          <input
            type="text"
            placeholder="Nome"
            className="w-full border rounded-md p-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ocupação"
            className="w-full border rounded-md p-2"
            value={ocupacao}
            onChange={(e) => setOcupacao(e.target.value)}
          />
          <input
            type="text"
            placeholder="Localização"
            className="w-full border rounded-md p-2"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
          />
          <input
            type="text"
            placeholder="Contacto"
            className="w-full border rounded-md p-2"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
