"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Calendar,
  Cake,
  Globe,
  Lightbulb,
  Users,
  Home,
  BookOpen,
  Layers,
  Info,
  Menu,
  X,
  Cpu,
} from "lucide-react";

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

export default function SobreNOVA() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/jovens.jpg"
          alt="Startup NOVA"
          fill
          priority
          className="object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      {/* ================= NAVBAR ================= */}
      <header className="relative z-20">
        <nav className="mx-auto max-w-7xl px-4 sm:px-8 py-6 flex items-center justify-between">
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
            <NavItem icon={<Home size={16} />} href="/" label="Início" />
         
        
            <NavItem icon={<Users size={16} />} href="/fundador" label="Fundador do NOVA" />
            <NavItem icon={<Info size={16} />} href="/Sobre" label="Sobre" />
          </ul>

          {/* Auth Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-300 hover:text-white flex items-center gap-1"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
            >
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
                <Link href="/login" className="text-sm text-zinc-300 hover:text-white">
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 font-semibold text-black"
                >
                  Criar Conta
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <main className="relative z-10 px-4 sm:px-8 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-zinc-300 mb-4">
              <Rocket size={14} />
              Lançamento Oficial do NOVA
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
              O nascimento de uma nova era<br /> para inovação digital
            </h1>

            <p className="max-w-3xl mx-auto text-zinc-400 text-lg">
              No aniversário do seu fundador, a <strong>Startup NOVA</strong> lança
              oficialmente o seu primeiro <strong>MVP Web</strong>, abrindo as
              portas ao público e integrando o revolucionário <strong>Sistema ZERO</strong>.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-14">
            <Section
              icon={<Calendar />}
              title="Fundação"
              text="A Startup NOVA foi criada no dia 15 de Abril de 2025, com foco em inovação, tecnologia e conexões reais."
            />
            <Section
              icon={<Cake />}
              title="Fundador"
              text="Idealizado por Osvânio Silva, o NOVA nasce como visão de futuro para o ecossistema tecnológico."
            />
            <Section
              icon={<Rocket />}
              title="MVP Web"
              text="O primeiro MVP representa o início da plataforma, aberta ao público e preparada para evoluir."
            />
            <Section
              icon={<Globe />}
              title="Eventos"
              text="Presença confirmada no ANGOTIC 2025 e na Feira da ELISAL, reforçando o posicionamento da startup."
            />
            <Section
              icon={<Lightbulb />}
              title="Visão"
              text="Criar impacto real através da tecnologia, conectando ideias, pessoas e oportunidades."
            />
            <Section
              icon={<Cpu />}
              title="Sistema ZERO"
              text="O NOVA é construído sobre o Sistema ZERO — uma abordagem inteligente que elimina fricções, simplifica processos e conecta pessoas, ideias e oportunidades de forma direta, proporcionando experiência fluida e resultados reais."
            />

            {/* Animação do Sistema ZERO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center gap-6 p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur"
            >
              <Cpu size={40} className="text-white animate-bounce" />
              <p className="text-center text-zinc-300 max-w-xl">
                Sistema ZERO: uma experiência contínua e sem fricções que conecta ideias, oportunidades e talentos de forma inteligente e intuitiva.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= SECTION ================= */
function Section({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row gap-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-zinc-400 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}
