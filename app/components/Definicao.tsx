"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  KeyRound,
  FileUser,
  Languages,
  ChevronRight,
  BellRing,
  ShieldCheck,
  UserPen,
} from "lucide-react";

const SettingsList = () => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", user.id)
        .single();

      if (data?.nome) {
        setUserName(data.nome);
      }
    };

    getUserData();
  }, []);

  const settingsOptions = [
   
    {
      id: "password",
      title: "Alterar Senha",
      description: "Atualize suas credenciais de acesso.",
      icon: KeyRound,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: "curriculo",
      title: "Currículo / Portfólio",
      description: "Gerencie seus documentos e informações profissionais.",
      icon: FileUser,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      id: "idioma",
      title: "Idioma",
      description: "Escolha o idioma da plataforma NOVA.",
      icon: Languages,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "notificacoes",
      title: "Notificações",
      description: "Controle os alertas e atualizações.",
      icon: BellRing,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      id: "privacidade",
      title: "Privacidade & Segurança",
      description: "Gerencie quem pode ver seu perfil.",
      icon: ShieldCheck,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* Cabeçalho personalizado */}
      <div className="mb-8">
        <h2 className="text-1xl font-bold text-zinc-900 dark:text-white">
          Olá{userName && `, ${userName}`} 👋
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Gerencie aqui as definições da sua conta no <strong>NOVA</strong>.
        </p>
      </div>

      <div className="grid gap-2">
        {settingsOptions.map((item) => (
          <button
            key={item.id}
            className="group w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-200 text-left active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${item.bg} ${item.color} transition-transform group-hover:scale-110`}
              >
                <item.icon size={22} />
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </span>
              </div>
            </div>

            <ChevronRight
              size={20}
              className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500"
            />
          </button>
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <p className="text-xs text-zinc-400">NOVA • Versão 1.0.2</p>
      </div>
    </div>
  );
};

export default SettingsList;
