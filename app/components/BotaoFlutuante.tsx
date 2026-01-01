"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Calendar, Grid, Bell, Edit3, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BotaoFlutuante() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  const alternarMenu = () => setAberto(!aberto);

  const menuItems = [
    {
      label: "Perfil",
      icon: <User className="w-5 h-5 text-white" />,
      color: "bg-black",
      onClick: () => {
        alternarMenu();
        router.push("/meuPortfolio");
      },
    },
    {
      label: "Central de Tarefas",
      icon: <Calendar className="w-5 h-5 text-black" />,
      color: "bg-gray-200",
      onClick: () => {
        alternarMenu();
        router.push("/CentroDeTarefas");
      },
    },
    {
      label: "Desafios iniciados",
      icon: <Grid className="w-5 h-5 text-black" />,
      color: "bg-gray-200",
      onClick: () => {
        alternarMenu();
        router.push("/MeusPreenchimentos");
      },
    },
    {
      label: "Notificação",
      icon: <Bell className="w-5 h-5 text-black" />,
      color: "bg-gray-200",
      onClick: () => {
        alternarMenu();
        router.push("/notificacoes");
      },
    },
    {
      label: "Publicar",
      icon: <Edit3 className="w-5 h-5 text-white" />,
      color: "bg-black",
      onClick: () => {
        alternarMenu();
        router.push("/publicar");
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-end justify-end pointer-events-none">

      {/* Fundo Blur */}
      <AnimatePresence>
        {aberto && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={alternarMenu}
            className="absolute inset-0 backdrop-blur-sm bg-white/30 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Menu flutuante */}
      <div className="flex flex-col items-end pointer-events-auto mb-2 space-y-2 sm:space-y-3 z-50">
        <AnimatePresence>
          {aberto &&
            menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                onClick={item.onClick}
                className="flex flex-row-reverse items-center space-x-2 space-x-reverse rounded-lg p-2 sm:p-3 hover:scale-105 transition-transform bg-transparent"
              >
                {/* Ícone à direita */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex justify-center items-center rounded-lg ${item.color}`}
                >
                  {item.icon}
                </div>
                {/* Texto à esquerda */}
                <span className="font-bold text-black text-sm sm:text-base">
                  {item.label}
                </span>
              </motion.button>
            ))}
        </AnimatePresence>
      </div>

      {/* Botão principal */}
   <motion.button
  onClick={alternarMenu}
  animate={{ rotate: aberto ? 45 : 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="pointer-events-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-black flex justify-center items-center text-white shadow-lg hover:scale-105 transition-transform mb-20 sm:mb-24 md:mb-8 mr-5 sm:mr-6 md:mr-8 z-50"
>
  <Plus className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
</motion.button>

    </div>
  );
}
