"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Layers,
  Users,
  Info,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";

export default function FounderPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/jovens.jpg"
          alt="Fundo NOVA"
          fill
          priority
          className="object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      {/* Navbar */}
      <header className="relative z-20">
        <nav className="mx-auto max-w-7xl px-4 sm:px-8 py-6 flex items-center justify-between">
          {/* Logo */}
             <Link href="/" className="flex items-center">
  <img
    src="/novaLogotipoBranco.png"      // caminho da imagem dentro da pasta public
    alt="Logo NOVA"
    width={69}           // largura do logo
    height={69}          // altura do logo
    className="mr-2"     // margem entre logo e texto, se quiser manter texto
  />
 
</Link>

          {/* Desktop Menu */}
         <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
                  <NavItem icon={<Home size={16} />} href="/" label="Início" onClick={() => setOpen(false)} />
               
                   <NavItem icon={<Users size={16} />} href="/fundador" label="Fundador do NOVA" />
            
                   <NavItem icon={<Info size={16} />} href="/Sobre" label="Sobre" />
                 </ul>

          {/* Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white"
            >
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
            className="lg:hidden text-zinc-300 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-0 left-0 right-0 bg-black/95 backdrop-blur border-b border-white/10"
            >
              <div className="px-6 py-6 flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button onClick={() => setOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <div className="flex flex-col gap-4 px-6 pb-6 text-sm">
                <NavItem icon={<Home size={16} />} href="/" label="Início" onClick={() => setOpen(false)} />
               
                <NavItem icon={<Users size={16} />} href="/fundador" label="Fundador do NOVA" onClick={() => setOpen(false)} />
                <NavItem icon={<Info size={16} />} href="/Sobre" label="Sobre" onClick={() => setOpen(false)} />

                {/* Auth Mobile */}
                <Link
                  href="/login"
                  className="flex items-center gap-2 pt-4 text-zinc-300 border-t border-white/10"
                  onClick={() => setOpen(false)}
                >
                  <LogIn size={18} /> Entrar
                </Link>

                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-semibold text-black"
                  onClick={() => setOpen(false)}
                >
                  <UserPlus size={18} />
                  Criar Conta
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Conteúdo do fundador */}
      <main className="relative z-10 px-4 sm:px-8 py-24 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">O Fundador</h1>
          <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
            Conheça o idealizador da NOVA, <strong>Osvânio Silva</strong>, um Dev fullstack com mais de 10 anos de experiência, e entenda por que criou a startup.
          </p>
        </motion.div>

        {/* Seção fundador */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          {/* Imagem */}
          <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-2 border-white/20">
            <Image
              src="/osvanio.jpg"
              alt="Osvânio Silva"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Texto */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">Osvânio Silva</h3>
            <p className="text-zinc-300 italic text-sm md:text-base leading-relaxed">
              "A distância entre o sonho e a realidade foi preenchida pela coragem. O que antes era uma visão, agora é minha verdade. A vitória não pertence apenas aos que sonham, mas aos que despertam e constroem o amanhã com as próprias mãos."
            </p>
            <p className="text-zinc-400 text-sm md:text-base mt-2">
              Com mais de 10 anos de experiência como desenvolvedor fullstack, Osvânio percebeu a necessidade de criar o <strong>NOVA</strong> para conectar talentos, startups e oportunidades reais no ecossistema tecnológico. Seu objetivo é transformar ideias em impacto real, fornecendo ferramentas e networking para quem quer inovar.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({
  icon,
  href,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 text-zinc-300 hover:text-white transition"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
