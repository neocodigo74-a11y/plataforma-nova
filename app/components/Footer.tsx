"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();

  return (
<footer className="w-full border-t border-zinc-200 bg-zinc-50 mt-8 overflow-hidden">

      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-4">

        {/* Loop de valores NOVA */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="whitespace-nowrap text-xs font-semibold tracking-wide text-zinc-300"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 18,
              ease: "linear",
            }}
          >
            {"Aprendizado • Certificar • Conectar • Evoluir • Oportunidade • ".repeat(
              12
            )}
          </motion.div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-zinc-600">
            <strong>Plataforma NOVA</strong>
            <div className="text-zinc-500">
              Educação • Inovação • Tecnologia • Networking
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
            <a href="/privacidade" className="hover:text-zinc-900">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="/termos" className="hover:text-zinc-900">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="/suporte" className="hover:text-zinc-900">
              Suporte
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-zinc-500">
          © {startYear}
          {currentYear > startYear && ` – ${currentYear}`} NOVA. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
