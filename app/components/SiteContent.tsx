"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  Layers,
  Info,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";

export default function SiteContent() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/jovens.jpg"
          alt="Academia NOVA"
          fill
          className="object-cover opacity-50 grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      {/* Navbar */}
      <header className="relative z-20">
        <nav className="flex items-center justify-between px-4 sm:px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
              <GraduationCap size={18} />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm tracking-wide">NOVA</p>
              <span className="text-xs text-zinc-400">
                Academia & Certificações
              </span>
            </div>
          </div>

          {/* Menu Desktop */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
            <NavItem icon={<Home size={16} />} href="#" label="Início" />
            <NavItem icon={<BookOpen size={16} />} href="/Cursos" label="Cursos" />
            <NavItem icon={<Layers size={16} />} href="/Certificacoes" label="Certificações" />
            <NavItem icon={<Users size={16} />} href="#" label="Comunidade" />
            <NavItem icon={<Info size={16} />} href="/Sobre" label="Sobre" />
          </ul>

          {/* Auth Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white">
              <LogIn size={16} /> Entrar
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              <UserPlus size={16} />
              Criar Conta
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden rounded-md border border-white/20 p-2"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-black p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-zinc-300">
                <MobileItem icon={<Home />} label="Início" />
                <MobileItem icon={<BookOpen />} label="Cursos" href="/Cursos" />
                <MobileItem icon={<Layers />} label="Certificações" href="/Certificacoes" />
                <MobileItem icon={<Users />} label="Comunidade" />
                <MobileItem icon={<Info />} label="Sobre" href="/Sobre" />

                <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn size={18} /> Entrar
                  </Link>

                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-semibold text-black"
                  >
                    <UserPlus size={18} />
                    Criar Conta
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <main className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-zinc-300">
          <GraduationCap size={14} />
          Academia de Certificação Tecnológica
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
          NOVA
        </h1>

        <h2 className="text-lg sm:text-xl md:text-2xl text-zinc-300 mb-6">
          Aprenda. Certifique-se. Evolua.
        </h2>

        <p className="max-w-xl text-zinc-400 mb-10">
          Plataforma moderna de aprendizagem e certificações focada em tecnologia,
          inovação e carreira profissional.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="flex justify-center gap-2 rounded-md bg-white px-8 py-3 font-semibold text-black"
          >
            <UserPlus size={18} />
            Começar Agora
          </Link>

          <Link
            href="/courses"
            className="flex justify-center gap-2 rounded-md border border-white/20 px-8 py-3 font-semibold"
          >
            <BookOpen size={18} />
            Ver Cursos
          </Link>
        </div>
      </main>
    </div>
  );
}

/* Helpers */
function NavItem({ icon, label, href }: any) {
  return (
    <li className="flex items-center gap-1 hover:text-white transition">
      {icon}
      <Link href={href}>{label}</Link>
    </li>
  );
}

function MobileItem({ icon, label, href = "#" }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 text-lg">
      {icon}
      {label}
    </Link>
  );
}
