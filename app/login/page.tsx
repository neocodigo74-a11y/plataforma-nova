"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // 🔹 VERIFICA SE JÁ ESTÁ LOGADO
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Já está logado → manda direto para AppContent
        router.replace("/academia"); // ou "/app" dependendo da rota do AppContent
        return;
      }

      setCheckingAuth(false); // não logado → exibe login
    };

    checkUser();
  }, [router]);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Login bem-sucedido → redireciona para AppContent
    router.replace("/academia"); // substitui a rota
  }

  // 🔹 enquanto checa auth, não renderiza login
  if (checkingAuth) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-sm bg-slate-900 p-6 rounded-xl">
        <h1 className="text-xl font-bold mb-4 text-white">Entrar no NOVA</h1>

        <input
          type="email"
          className="w-full mb-3 p-2 rounded bg-slate-800 text-white placeholder-gray-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-slate-800 text-white placeholder-gray-400"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded font-semibold text-white transition ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
