"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Home,
  BookOpen,
  Layers,
  Users,
  Info,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* ================= NAVBAR ================= */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-30 bg-white border-b border-zinc-200"
      >
        <nav className="flex items-center justify-between px-4 sm:px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
              <GraduationCap size={18} />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm tracking-wide">NOVA</p>
              <span className="text-xs text-zinc-500">
                Academia & Certificações
              </span>
            </div>
          </div>

          {/* Menu */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <li className="flex items-center gap-1 hover:text-black transition">
              <Home size={16} />
              <Link href="/Inicio">Início</Link>
            </li>
            <li className="flex items-center gap-1 hover:text-black transition">
              <BookOpen size={16} />
              <Link href="/Cursos">Cursos</Link>
            </li>
            <li className="flex items-center gap-1 hover:text-black transition">
              <Layers size={16} />
              <Link href="/Certificacoes">Certificações</Link>
            </li>
            <li className="flex items-center gap-1 hover:text-black transition">
              <Users size={16} />
              <Link href="#">Comunidade</Link>
            </li>
            <li className="flex items-center gap-1 text-black font-semibold">
              <Info size={16} />
              <Link href="/Sobre">Sobre</Link>
            </li>
          </ul>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-zinc-600 hover:text-black transition"
            >
              <LogIn size={16} />
              Entrar
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition"
            >
              <UserPlus size={16} />
              Criar Conta
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* ================= HERO SOBRE ================= */}
      <section className="px-4 sm:px-6 py-20 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6"
        >
          Sobre a Academia NOVA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-600 text-lg sm:text-xl mb-8"
        >
          A Academia NOVA é uma plataforma moderna de aprendizagem e certificações, 
          voltada para tecnologia, inovação e desenvolvimento profissional. 
          Nosso objetivo é oferecer cursos estruturados, práticas reais e certificações reconhecidas no mercado.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/Cursos"
            className="rounded-md bg-black px-6 py-3 text-white font-semibold hover:bg-zinc-800 transition"
          >
            Ver Cursos
          </Link>
          <Link
            href="/Certificacoes"
            className="rounded-md border border-black px-6 py-3 text-black font-semibold hover:bg-black hover:text-white transition"
          >
            Ver Certificações
          </Link>
        </motion.div>
      </section>

      {/* ================= SEÇÃO DE MISSÃO E VALORES ================= */}
      <section className="px-4 sm:px-6 py-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm"
        >
          <h3 className="font-bold text-lg mb-2">Missão</h3>
          <p className="text-zinc-600">
            Capacitar profissionais com conhecimento prático e certificações de qualidade.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm"
        >
          <h3 className="font-bold text-lg mb-2">Visão</h3>
          <p className="text-zinc-600">
            Ser referência em educação tecnológica, inovação e mercado de trabalho.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm"
        >
          <h3 className="font-bold text-lg mb-2">Valores</h3>
          <p className="text-zinc-600">
            Qualidade, inovação, ética, aprendizado contínuo e excelência profissional.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
