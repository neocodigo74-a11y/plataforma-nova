"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Eye } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // 🔹 Verifica se já está logado
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/academia");
        return;
      }

      setCheckingAuth(false);
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

    router.replace("/academia");
  }

  async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/academia`,
    },
  });

  if (error) {
    alert(error.message);
  }
}


  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/nova.svg" // ajusta o caminho do logo
            alt="VestiLink"
            width={120}
            height={40}
          />
        </div>

        {/* TÍTULO */}
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Entrar na sua conta
        </h1>
        <p className="text-center text-gray-500 mt-1">
          Digite suas credenciais para acessar
        </p>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 font-medium hover:bg-gray-50 transition"
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Entrar com Google
        </button>

        {/* DIVIDER */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400">
            OU CONTINUE COM EMAIL
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* EMAIL */}
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="seu@email.com"
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* SENHA */}
        <div className="relative mb-2">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="Senha"
            className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Eye className="absolute right-3 top-3.5 text-gray-400" size={18} />
        </div>

        {/* ESQUECEU SENHA */}
        <div className="text-right mb-6">
        <button
  onClick={() => router.push("/forgot-password")}
  className="text-sm text-blue-600 hover:underline"
>
  Esqueceu a senha?
</button>

        </div>

        {/* BOTÃO ENTRAR */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold bg-black transition"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* CRIAR CONTA */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{" "}
          <a href="/register" className="text-blue-600 font-medium hover:underline">
            Criar conta
          </a>
        </p>

        {/* VOLTAR */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-400 hover:underline">
            ← Voltar para início
          </a>
        </div>
      </div>
    </div>
  );
}
