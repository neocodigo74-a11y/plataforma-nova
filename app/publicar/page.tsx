"use client";

import { useState } from "react";
import { CheckCircle, Image as ImageIcon, X, Loader2, PartyPopper } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

/* =====================================================
    SCHEMA
===================================================== */
const formSchema = z.object({
  conteudo: z.string().min(1, "Escreva algo para publicar"),
  arquivos: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreatePost() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Estado do Modal

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("arquivos", [file]);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      let publicUrl = "";

      if (data.arquivos && data.arquivos.length > 0) {
        const file = data.arquivos[0];
        const path = `${userData.user.id}/${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from("posts").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
        publicUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("posts").insert({
        usuario_id: userData.user.id,
        conteudo: data.conteudo,
        imagem: publicUrl,
      });

      if (insertError) throw insertError;

      // SUCESSO: Abrir Modal e Resetar Form
      reset();
      setPreviewUrl(null);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error(error);
      // Aqui você poderia criar um modal de erro similar
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 relative">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
      >
        <div className="p-4 space-y-4">
<textarea
    {...register("conteudo")}
    placeholder="O que você quer compartilhar?"
    className="w-full px-4 py-3 text-zinc-800 placeholder-zinc-400 border border-black/[0.08]  bg-transparent rounded-xl resize-none h-24 text-base transition-all"
  />
          
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
              <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-contain" />
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setValue("arquivos", []); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
          <label className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 cursor-pointer transition">
            <ImageIcon size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>

      {/* MODAL DE SUCESSO OVERLAY */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <PartyPopper size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Publicado com sucesso!</h3>
            <p className="text-zinc-500 mt-2 text-sm">
              Sua nova publicação já está disponível noa NOVA.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}