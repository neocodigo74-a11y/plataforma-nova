"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brain, Rocket, Users, Briefcase, GraduationCap, Clock, Tag, Handshake } from "lucide-react";

export default function DashboardClone() {
  const [userName, setUserName] = useState("");
  const [objetivo, setObjetivo] = useState(""); // Objetivo do onboarding
  const [funcoesInteresse, setFuncoesInteresse] = useState<string[]>([]);
  const [greeting, setGreeting] = useState("");

  // 🔹 Pegar hora e definir saudação
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bom dia");
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  // 🔹 Buscar dados do Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Nome do usuário
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", user.id)
        .single();
      if (usuario?.nome) setUserName(usuario.nome);

      // Objetivo do onboarding
      const { data: onboarding } = await supabase
        .from("usuarios_onboarding")
        .select("objetivo, funcoes_interesse")
        .eq("id", user.id)
        .single();

      if (onboarding?.objetivo) setObjetivo(onboarding.objetivo);
      if (onboarding?.funcoes_interesse) setFuncoesInteresse(onboarding.funcoes_interesse);
    };

    fetchUserData();
  }, []);

  // 🔹 Texto baseado no objetivo
  const objetivoTextoMap: Record<string, string> = {
    iniciar_carreira: "iniciar minha carreira",
    mudar_carreira: "mudar função para",
    crescer_funcao: "crescer na função atual como",
    explorar_topicos: "explorar tópicos como",
    estagio_emprego: "buscar estágio ou emprego em",
    freelancer: "fazer projetos freelancer em",
    consultoria: "atuar em consultoria em",
    oportunidades_projeto: "participar de oportunidades de projeto em",
  };

  return (
    <section className="w-full bg-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#0F2A44] text-white flex items-center justify-center font-semibold shrink-0">
            {userName ? userName[0].toUpperCase() : "U"}
          </div>

          <div>
            <h1 className="text-[18px] font-semibold text-[#111827]">
              {greeting}, {userName || "Usuário"}
            </h1>

            {funcoesInteresse.length > 0 && objetivo && (
              <p className="text-[14px] text-[#4B5563] md:max-w-3xl">
                Seu objetivo de carreira é {objetivoTextoMap[objetivo]}{" "}
                {funcoesInteresse.map((f, idx) => (
                  <span key={f} className="underline text-[#111827]">
                    {f}{idx < funcoesInteresse.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        <button className="text-[14px] text-[#2563EB] hover:underline self-start md:self-auto">
          Editar meta
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr_360px] gap-8 items-start">
        {/* ÁREA CENTRAL */}
        <div className="order-1 md:order-2 flex flex-col items-center text-center">
          <div className="flex gap-2 mb-6">
            <span className="px-4 py-1 rounded-full bg-[#1F2937] text-white text-[12px]">Em andamento</span>
            <span className="px-4 py-1 rounded-full border border-[#D1D5DB] text-[#4B5563] text-[12px]">Concluído</span>
          </div>

          <div className="w-20 h-20 bg-[#E0ECFF] rounded-full flex items-center justify-center mb-4">
            <Brain size={36} className="text-[#2563EB]" />
          </div>

          <p className="text-[14px] text-[#4B5563] max-w-xs">
            Você encontra aqui os cursos em andamento.
          </p>
        </div>

        {/* PLANO */}
        <div className="order-2 md:order-1 border border-[#E5E7EB] rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Plano de aprendizado</h3>

          <div className="flex gap-2 mb-3">
            {["2", "3", "4", "5", "6", "s", "d"].map((item) => (
              <span key={item} className="w-7 h-7 rounded-full border border-[#D1D5DB] flex items-center justify-center text-[12px]">{item}</span>
            ))}
          </div>

          <button className="text-[14px] text-[#2563EB] hover:underline">Defina seu plano de aprendizado</button>
        </div>
      </div>
    </section>
  );
}
