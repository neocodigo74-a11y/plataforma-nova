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
  Rocket,
  Cake,
  Calendar,
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
               <Link href="/" className="flex items-center">
  <img
    src="/novaLogotipoBranco.png"      // caminho da imagem dentro da pasta public
    alt="Logo NOVA"
    width={69}           // largura do logo
    height={69}          // altura do logo
    className="mr-2"     // margem entre logo e texto, se quiser manter texto
  />
 
</Link>

          {/* Menu Desktop */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
           <NavItem icon={<Home size={16} />} href="/" label="Início" onClick={() => setOpen(false)} />
        
            <NavItem icon={<Users size={16} />} href="/fundador" label="Fundador do NOVA" />
     
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
              
                <MobileItem icon={<Users />} label="Fundador" href="/fundador"/>
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
      {/* Hero – Lançamento do NOVA */}
<main className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-zinc-300"
  >
    🎉 Aniversário do Fundador & Lançamento Oficial
  </motion.span>

  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4"
  >
    NOVA
  </motion.h1>

  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="text-lg sm:text-xl md:text-2xl text-zinc-300 mb-6 max-w-3xl"
  >
    A Startup NOVA lança oficialmente o seu primeiro MVP Web ao público,
    celebrando o aniversário do seu fundador <strong>Osvânio Silva</strong>.
  </motion.h2>

  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.4 }}
    className="max-w-2xl text-zinc-400 mb-10 leading-relaxed"
  >
    Criada em <strong>15 de Abril de 2025</strong>, a NOVA nasce com a missão de
    conectar estudantes, startups, universidades, investigadores e empresas,
    promovendo inovação, networking e oportunidades reais no ecossistema
    tecnológico.
  </motion.p>

  {/* Destaques */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full mb-10"
  >
    <Highlight
      icon={<Cake size={18} />}
      text="Fundador: Osvânio Silva"
    />
    <Highlight
      icon={<Calendar size={18} />}
      text="Fundação: 15.Abril.2025"
    />
    <Highlight
      icon={<Rocket size={18} />}
      text="Primeiro MVP Web Público"
    />
    <Highlight
      icon={<Users size={18} />}
      text="ANGOTIC 2025 • ELISAL • Outros eventos"
    />
  </motion.div>

  {/* CTA opcional */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6 }}
    className="flex flex-col sm:flex-row gap-4"
  >
    <Link
      href="/register"
      className="flex items-center justify-center gap-2 rounded-md bg-white px-8 py-3 font-semibold text-black"
    >
      <Rocket size={18} />
      Explorar o NOVA
    </Link>

    <Link
      href="/Sobre"
      className="flex items-center justify-center gap-2 rounded-md border border-white/20 px-8 py-3 font-semibold"
    >
      Saber Mais
    </Link>
  </motion.div>
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
function Highlight({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 backdrop-blur">
      <span className="text-white">{icon}</span>
      {text}
    </div>
  );
}

