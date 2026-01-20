"use client";

import { Mail, Phone, MapPin, Target, Award, ShieldCheck } from "lucide-react";

interface CurriculoRendererProps {
  perfil: any;
}

export default function CurriculoRenderer({ perfil }: CurriculoRendererProps) {
  return (
    <div className="flex flex-row w-full bg-white min-h-[1100px] shadow-2xl overflow-hidden">
      
      {/* --- COLUNA ESQUERDA (SIDEBAR) --- */}
      <div className="w-[35%] bg-[#2c3e50] text-white p-4 md:p-8 flex flex-col items-center gap-6">
        
        {/* Foto de Perfil */}
        <div className="w-20 h-20 md:w-40 md:h-40 rounded-full border-2 md:border-4 border-white/20 overflow-hidden bg-gray-300 shrink-0">
          <img
            src={perfil.foto_perfil || "/avatar.png"}
            alt={perfil.nome}
            className="w-full h-full object-cover"
          />
        </div>

        {/* CONTATO */}
        <div className="w-full space-y-4">
          <h2 className="text-[10px] md:text-lg font-bold tracking-widest uppercase border-b border-white/20 pb-1 md:pb-2 text-left">Contato</h2>
          <div className="space-y-2 md:space-y-3 text-[9px] md:text-sm font-light text-left">
            {perfil.contacto && (
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-gray-300 shrink-0" /> 
                <span className="break-all">{perfil.contacto}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-gray-300 shrink-0" /> 
              <span className="break-all">{perfil.email || "email@exemplo.com"}</span>
            </div>
            {perfil.localizacao && (
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-gray-300 shrink-0" /> 
                <span className="leading-tight">{perfil.localizacao}</span>
              </div>
            )}
          </div>
        </div>

        {/* SKILLS */}
        {perfil.habilidades?.length > 0 && (
          <div className="w-full space-y-4">
            <h2 className="text-[10px] md:text-lg font-bold tracking-widest uppercase border-b border-white/20 pb-1 md:pb-2 text-left">Skills</h2>
            <ul className="space-y-1 md:space-y-2 text-[9px] md:text-sm font-light text-left">
              {perfil.habilidades.map((hab: any, i: number) => (
                <li key={hab.id || i} className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-400">▶</span> {hab.nome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* IDIOMAS */}
        {perfil.idiomas?.length > 0 && (
          <div className="w-full space-y-4">
            <h2 className="text-[10px] md:text-lg font-bold tracking-widest uppercase border-b border-white/20 pb-1 md:pb-2 text-left">Idiomas</h2>
            <div className="space-y-1 md:space-y-2 text-[9px] md:text-sm font-light text-left">
              {perfil.idiomas.map((idioma: any, i: number) => (
                <p key={idioma.id || i}>
                  <span className="font-semibold">{idioma.nome}</span>: {idioma.nivel}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* INTERESSES */}
        {perfil.interessesHobbies?.length > 0 && (
          <div className="w-full space-y-4">
            <h2 className="text-[10px] md:text-lg font-bold tracking-widest uppercase border-b border-white/20 pb-1 md:pb-2 text-left">Interesses</h2>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {perfil.interessesHobbies.map((item: string, i: number) => (
                <span key={i} className="text-[8px] md:text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/5 italic">
                  #{item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- COLUNA DIREITA (CONTEÚDO) --- */}
      <div className="w-[65%] bg-white flex flex-col">
        
        {/* Conteúdo Principal Padded */}
        <div className="p-5 md:p-10 flex-1 flex flex-col gap-6 md:gap-10">
          
          <div className="border-b-2 border-gray-100 pb-4 md:pb-6 text-left">
            <h1 className="text-xl md:text-4xl font-extrabold text-[#2c3e50] uppercase leading-tight">
              {perfil.nome?.split(' ')[0]} <span className="font-light">{perfil.nome?.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-xs md:text-xl text-gray-400 font-medium mt-1 uppercase tracking-[0.2em]">
              {perfil.ocupacao || "Profissional"}
            </p>
          </div>

          {/* SOBRE MIM */}
          <section className="text-left">
            <h2 className="text-[10px] md:text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-2 md:mb-4 border-b border-gray-100 w-fit pr-4 flex items-center gap-2">
              <Target size={16} /> Sobre Mim
            </h2>
            <p className="text-gray-600 leading-relaxed text-[9px] md:text-sm text-justify">
              {perfil.bio || perfil.objetivo || "Nenhum resumo profissional cadastrado."}
            </p>
          </section>

          {/* EXPERIÊNCIA & CURSOS */}
          <section className="flex-1 text-left">
            <h2 className="text-[10px] md:text-lg font-bold text-[#2c3e50] uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-100 w-fit pr-4 flex items-center gap-2">
              <Award size={16} /> Experiência & Cursos
            </h2>
            
            <div className="space-y-4 md:space-y-8 relative before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100 pl-4 md:pl-6">
              {perfil.cursosConcluidos?.length > 0 ? (
                perfil.cursosConcluidos.map((curso: any) => (
                  <div key={curso.id} className="relative">
                    <div className="absolute -left-[21px] md:-left-[27px] top-1 w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#2c3e50] border-2 border-white" />
                    <div className="flex justify-between items-start mb-1 text-left">
                      <h3 className="font-bold text-gray-800 uppercase text-[9px] md:text-sm">{curso.titulo}</h3>
                      <span className="text-[8px] md:text-xs font-bold text-gray-400 shrink-0">
                        {new Date(curso.data).getFullYear()}
                      </span>
                    </div>
                    <p className="text-[8px] md:text-xs font-semibold text-[#2c3e50] mb-1 italic">NOVA Academy</p>
                    <p className="text-[8px] md:text-xs text-gray-500 leading-tight">
                      Certificado de conclusão emitido pela plataforma de ensino NOVA.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[9px] md:text-sm text-gray-400 italic">Nenhum curso ou experiência registrada.</p>
              )}
            </div>
          </section>
        </div>

        {/* --- RODAPÉ INSTITUCIONAL (DENTRO DA COLUNA BRANCA) --- */}
        <div className="px-5 md:px-10 py-6 border-t border-gray-50 flex flex-row justify-between items-center bg-white">
          <div className="flex items-center gap-2 text-[#2c3e50] opacity-60">
            <ShieldCheck size={14} />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
              Emitido via NOVA
            </span>
          </div>
          <div className="text-[8px] md:text-[10px] text-gray-400 font-medium italic">
            Validado em {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

      </div>
    </div>
  );
}