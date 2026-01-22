"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Star, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const categorias = ["Bug", "Sugestão", "Nova Feature"];

export default function FeedbackBannerInteligente() {
  const [showBanner, setShowBanner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);
  const [categoria, setCategoria] = useState(categorias[0]);
  const [rating, setRating] = useState(0);
  const [sugestao, setSugestao] = useState("");
  const [melhorias, setMelhorias] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  // Buscar feedbacks e info do usuário
  const fetchFeedback = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Pegando nome do usuário
    const { data: profile } = await supabase
      .from("usuarios")
      .select("nome")
      .eq("id", user.id)
      .single();

    if (profile?.nome) setUserName(profile.nome);

    const { data } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      setShowBanner(true); // mostra banner se não houver feedback
    }

    setHistorico(data || []);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const enviarFeedback = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!sugestao.trim()) return;

    await supabase.from("feedbacks").insert({
      user_id: user.id,
      categoria,
      rating,
      sugestao,
      melhorias
    });

    setFeedbackEnviado(true);
    setShowBanner(false);
    fetchFeedback();
  };

  if (!showBanner && !modalOpen && !feedbackEnviado) return null;

  return (
    <>
      {/* Banner */}
      {!feedbackEnviado && showBanner && (
        <div className="sticky top-[40px] z-10 w-full md:ml-64 bg-gradient-to-r from-[#0077A3] to-[#0099C6] text-white px-6 py-2">
          <button
            className="absolute right-4 top-2 opacity-80 hover:opacity-100"
            onClick={() => setShowBanner(false)}
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center gap-1">
            <p className="font-bold text-xs tracking-wide uppercase">
              {userName ? `${userName}, sua opinião importa! 💬` : "Sua opinião importa! 💬"}
            </p>

            <p className="text-xs">
              Ajude-nos a melhorar o NOVA com <span className="font-semibold">seu feedback</span>.
            </p>

            <div className="flex items-center gap-1 text-xs font-medium">
              <MessageCircle size={14} />
              <span>Leva apenas 1 minuto para enviar!</span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="mt-1 bg-white text-[#0077A3] font-semibold text-xs px-4 py-1.5 rounded-md"
            >
              Enviar Feedback
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && !feedbackEnviado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 md:pl-64"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg max-h-[90vh] overflow-y-auto"
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>

              <h2 className="font-bold text-lg mb-4">
                {userName ? `${userName}, envie seu feedback` : "Envie seu feedback"}
              </h2>

              {/* Categoria */}
              <label className="block text-sm mb-1">Categoria</label>
              <select
                className="w-full border border-gray-300 rounded p-2 mb-3"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Rating */}
              <label className="block text-sm mb-1">Avaliação</label>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map((i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`cursor-pointer ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>

              {/* Sugestão */}
              <label className="block text-sm mb-1">Comentário</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-3"
                rows={2}
                value={sugestao}
                onChange={(e) => setSugestao(e.target.value)}
              />

              {/* Melhorias */}
              <label className="block text-sm mb-1">Sugestões de melhoria</label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-3"
                rows={2}
                value={melhorias}
                onChange={(e) => setMelhorias(e.target.value)}
              />

              <button
                onClick={enviarFeedback}
                className="mt-2 w-full bg-[#0077A3] text-white font-semibold py-2 rounded hover:bg-[#005f82]"
              >
                Enviar
              </button>

              {/* Histórico */}
              {historico.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="font-semibold mb-2">Seu histórico de feedback</h3>
                  <ul className="text-xs space-y-1">
                    {historico.map((f) => (
                      <li key={f.id} className="border p-2 rounded">
                        <p><strong>{f.categoria}</strong> - {f.rating} ⭐</p>
                        <p>{f.sugestao}</p>
                        {f.melhorias && <p className="text-gray-500">Melhorias: {f.melhorias}</p>}
                        <p className="text-gray-400 text-[10px]">{new Date(f.created_at).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Modal de confirmação */}
        {feedbackEnviado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 md:pl-64"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg w-full max-w-sm p-6 relative shadow-lg text-center"
            >
              <CheckCircle size={36} className="mx-auto text-green-500 mb-2" />
              <h3 className="font-bold text-lg mb-2">
                {userName ? `Obrigado pelo seu feedback, ${userName}!` : "Obrigado pelo seu feedback!"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">Sua opinião nos ajuda a melhorar o NOVA.</p>
              <button
                className="mt-2 w-full bg-[#0077A3] text-white font-semibold py-2 rounded hover:bg-[#005f82]"
                onClick={() => setFeedbackEnviado(false)}
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
