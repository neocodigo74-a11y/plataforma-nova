"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  Layers,
  Info,
  LogIn,
  UserPlus,
  ShieldCheck,
  Cpu,
  Network,
  Code,
} from "lucide-react";

const certifications = [
  {
    title: "Cibersegurança",
    description: "Proteção de sistemas e boas práticas de segurança digital.",
    icon: ShieldCheck,
    level: "Especialista",
  },
  {
    title: "Desenvolvimento de Software",
    description: "Boas práticas, padrões e projetos em linguagens modernas.",
    icon: Code,
    level: "Profissional",
  },
  {
    title: "Infraestrutura & Redes",
    description: "Configuração de redes, servidores e cloud computing.",
    icon: Network,
    level: "Especialista",
  },
  {
    title: "Computação Avançada",
    description: "Técnicas avançadas de otimização e processamento.",
    icon: Cpu,
    level: "Especialista",
  },
];

export default function CertificationsPage() {
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
            <li className="flex items-center gap-1 text-black font-semibold">
              <Layers size={16} />
              <Link href="/Certificacoes">Certificações</Link>
            </li>
            <li className="flex items-center gap-1 hover:text-black transition">
              <Users size={16} />
              <Link href="#">Comunidade</Link>
            </li>
            <li className="flex items-center gap-1 hover:text-black transition">
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

      {/* ================= HERO CERTIFICAÇÕES ================= */}
      <section className="px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Certificações da Academia NOVA
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg">
            Obtenha reconhecimento profissional com certificações de qualidade.
          </p>
        </motion.div>

        {/* ================= GRID DE CERTIFICAÇÕES ================= */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-black text-white">
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-bold mb-2">{cert.title}</h3>

                <p className="text-sm text-zinc-600 mb-4">{cert.description}</p>

                <span className="inline-block rounded-full border border-black px-3 py-1 text-xs font-medium">
                  Nível: {cert.level}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
