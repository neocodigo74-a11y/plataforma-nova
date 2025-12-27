"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Quote,
  Calendar,
  Layers
} from 'lucide-react';

interface Publication {
  id: string;
  type: 'Artigo' | 'Tese' | 'Monografia' | 'Científico';
  title: string;
  authors: string;
  institution: string;
  date: string;
  abstract: string;
  citations: number;
  tags: string[];
}

const PUBLICATIONS: Publication[] = [
  {
    id: "1",
    type: "Científico",
    title: "Impacto da Inteligência Artificial na Educação Superior em Angola",
    authors: "Dr. Manuel Santos, Eng. Ana Silva",
    institution: "Universidade Agostinho Neto",
    date: "Dez 2024",
    abstract: "Este estudo analisa como ferramentas de IA generativa estão a transformar o processo de aprendizagem...",
    citations: 124,
    tags: ["IA", "Educação", "Tecnologia"]
  },
  {
    id: "2",
    type: "Tese",
    title: "Arquitetura de Micro-serviços em Sistemas Governamentais",
    authors: "Lic. Carlos Benguela",
    institution: "ITEL",
    date: "Out 2024",
    abstract: "Uma investigação profunda sobre a escalabilidade de serviços públicos digitais utilizando Docker e K8s...",
    citations: 45,
    tags: ["Cloud", "DevOps", "Governo"]
  }
];

export default function AcademicLibrary() {
  const [activeType, setActiveType] = useState('Todos');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Acadêmico */}
      <header className="bg-zinc-900 text-white p-10 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs">
          <GraduationCap size={20} />
          Repositório Acadêmico
        </div>
        <h1 className="text-4xl font-black">Pesquisa & Publicações</h1>
        <p className="text-zinc-400 max-w-2xl">
          Explore teses, artigos científicos e monografias desenvolvidos pela comunidade NOVA. 
          Conhecimento técnico validado por especialistas.
        </p>
      </header>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por título, autor ou palavra-chave..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl">
          {['Todos', 'Artigo', 'Tese', 'Científico'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeType === t ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Publicações */}
      <div className="grid grid-cols-1 gap-6">
        {PUBLICATIONS.map((pub) => (
          <PublicationCard key={pub.id} pub={pub} />
        ))}
      </div>
    </div>
  );
}

function PublicationCard({ pub }: { pub: Publication }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-zinc-200 hover:border-red-200 transition-all group relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Lado Esquerdo: Tipo e Ícone */}
        <div className="flex flex-col items-center justify-center bg-zinc-50 rounded-2xl p-6 min-w-[120px] border border-zinc-100">
          <FileText size={32} className="text-zinc-400 mb-2 group-hover:text-red-500 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">{pub.type}</span>
        </div>

        {/* Centro: Conteúdo */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            {pub.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-md">#{tag}</span>
            ))}
          </div>
          
          <h2 className="text-xl font-bold text-zinc-900 group-hover:text-red-600 transition-colors cursor-pointer">
            {pub.title}
          </h2>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-zinc-700">{pub.authors}</span>
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Layers size={12} /> {pub.institution}
            </span>
          </div>

          <p className="text-sm text-zinc-500 line-clamp-2 italic">
            "{pub.abstract}"
          </p>

          <div className="flex items-center gap-6 pt-4 border-t border-zinc-50">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <Calendar size={14} /> {pub.date}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
              <Quote size={14} /> {pub.citations} citações
            </span>
          </div>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex md:flex-col gap-2 justify-end">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">
            <BookOpen size={16} /> Ler Agora
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}