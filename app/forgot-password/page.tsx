"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center">Recuperar senha</h1>
        <p className="text-center text-gray-500 mt-2">
          Enviaremos um link para redefinir sua senha
        </p>

        {success ? (
          <p className="text-green-600 text-center mt-6">
            ✅ Email enviado! Verifique sua caixa de entrada.
          </p>
        ) : (
          <>
            <div className="relative mt-6">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl text-white font-semibold bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
