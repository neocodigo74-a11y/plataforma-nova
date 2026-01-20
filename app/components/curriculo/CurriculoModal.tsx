"use client";

import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CurriculoRenderer from "./CurriculoRenderer";

export default function CurriculoModal({ perfil, onClose }: any) {
  
  const handleDownload = () => {
    // Pergunta ao usuário antes de iniciar
    const confirmar = window.confirm("Deseja gerar o arquivo PDF do seu currículo?");
    
    if (confirmar) {
      // Pequeno delay para garantir que o clique do botão não interfira no foco da janela
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:bg-white print:p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full h-full md:w-[95vw] md:h-[95vh] md:max-w-5xl bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:h-auto print:rounded-none"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Header Fixo - Oculto na Impressão */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-white z-10 print:hidden">
            <div>
              <h2 className="text-sm md:text-lg font-bold text-gray-900 uppercase text-left">Currículo Profissional</h2>
              <p className="hidden md:block text-[10px] text-gray-500 text-left">Visualização dinâmica NOVA</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 text-[10px] md:text-sm rounded-lg bg-[#2c3e50] text-white hover:bg-[#34495e] transition-colors font-bold shadow-sm"
                onClick={handleDownload} 
              >
                <Download size={16} /> DOWNLOAD PDF
              </button>

              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Conteúdo com Scroll */}
          <div className="flex-1 overflow-y-auto bg-gray-200 p-2 md:p-8 print:bg-white print:p-0 print:overflow-visible">
            {/* O ID 'curriculo-print' é importante para o CSS de impressão */}
            <div className="max-w-[800px] mx-auto shadow-2xl print:shadow-none print:max-w-none" id="curriculo-print">
              <CurriculoRenderer perfil={perfil} />
            </div>
          </div>

          {/* Footer Fixo - Oculto na Impressão */}
          <div className="px-6 py-2 border-t text-[10px] text-gray-400 text-center bg-white uppercase tracking-widest font-medium print:hidden text-left">
           Visualização gerada automaticamente pelo NOVA
          </div>
        </motion.div>

        {/* CSS Global de Impressão injetado aqui */}
        <style jsx global>{`
          @media print {
            /* Esconde TUDO da página */
            body * {
              visibility: hidden;
            }
            /* Mostra apenas a div do currículo */
            #curriculo-print, #curriculo-print * {
              visibility: visible;
            }
            #curriculo-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            /* Remove margens extras da impressora */
            @page {
              margin: 0;
              size: auto;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}