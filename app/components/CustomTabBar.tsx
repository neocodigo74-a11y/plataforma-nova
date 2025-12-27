"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, School, Trophy, Book } from "lucide-react";

interface CustomTabBarProps {
  onToggleSidebar: () => void;
  onTabChange: (tabKey: string) => void;
}

export default function CustomTabBar({ onToggleSidebar, onTabChange }: CustomTabBarProps) {
  const [activeTab, setActiveTab] = useState("Home");

  const tabs = [
    { 
      name: "Home", 
      label: "Início", 
      // Em vez de <Image />, usamos uma div que recebe a cor do texto do pai
      icon: (
        <div 
          className="w-[20px] h-[28px] bg-current" 
          style={{
            maskImage: "url('/logozero.svg')",
            maskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskImage: "url('/logozero.svg')",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
          }}
        />
      ) 
    },
    { name: "Descobrir", label: "Desafios", icon: <Trophy size={19} /> },
    { name: "Artigos", label: "Biblioteca", icon: <Book size={17} /> },
    { name: "Micro", label: "Micro", icon: <School size={19} /> },
    { name: "Hack", label: "Hack", icon: <Code size={19} /> },
  ];

  const handleClick = (tabName: string) => {
    setActiveTab(tabName);
    onTabChange(tabName);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden flex justify-around items-center h-16 pb-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <div
            key={tab.name}
            onClick={() => handleClick(tab.name)}
            className="flex flex-col items-center justify-center cursor-pointer relative min-w-[64px]"
          >
            <motion.div
              animate={{ 
                y: isActive ? -4 : 0,
                scale: isActive ? 1.1 : 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              // A classe bg-current no ícone Home vai herdar estas cores aqui:
              className={`${isActive ? "text-red-600" : "text-gray-500"}`}
            >
              {tab.icon}
            </motion.div>
            
            <span className={`text-[10px] mt-1 transition-colors duration-200 ${
              isActive ? "text-red-600 font-bold" : "text-gray-400 font-medium"
            }`}>
              {tab.label}
            </span>

            {isActive && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}