"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdatePassword() {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Senha alterada com sucesso!");
    router.replace("/auth");
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center">
          Nova senha
        </h1>
        <p className="text-center text-gray-500 mt-2">
          Digite sua nova senha
        </p>

        <div className="relative mt-6">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-purple-500"
        >
          {loading ? "Salvando..." : "Alterar senha"}
        </button>
      </div>
    </div>
  );
}
