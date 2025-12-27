"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Descubrir from "./descubrir";
import Sidebar from "./Sidebar";
import Home from "./Home";
import MobileHeader from "./CustomHeader";
import CustomTabBar from "./CustomTabBar";
import { motion, AnimatePresence } from "framer-motion";
import DesktopHeader from "./DesktopHeader";
import Feed from "./Feed";
import BotaoFlutuante from "./BotaoFlutuante";
import CareerDashboard from "./CareerDashboard";
import CourseHeroIBM from "./CourseHeroIBM"; // Note: Verifique se este é o componente de Detalhes
import HackathonListUnified from "./HackathonList";
import PerfilPage from "./PerfilPage";
import DetalheCurso from "./DetalheCurso"; // Importe o componente que criamos
import AdvancedMicrolearning from "./Microlearning";
import AcademicLibrary from "./AcademicLibrary";

interface Props {
  children?: ReactNode;
}

const APP_BG = "bg-white";

export default function AppContent({ children }: Props) {
  const [activeContent, setActiveContent] = useState<string>("Home");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 1. Definição das funções ANTES do contentMap
  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setActiveContent("Detalhes");
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setActiveContent("Home");
  };
// Função para lidar com a troca de abas vinda do CustomTabBar
  const handleTabChange = (componentKey: string) => {
    setSelectedCourse(null); // Limpa o curso selecionado ao mudar de aba
    setActiveContent(componentKey);
  };
  // 2. contentMap movido para DENTRO para ter acesso ao handleCourseSelect e selectedCourse
  const contentMap: { [key: string]: ReactNode } = {
    Home: <Home onCourseSelect={handleCourseSelect} />,
    Community: <Feed />,
    Aprendizados: <CareerDashboard onCourseSelect={handleCourseSelect} />,
    // Usamos o componente DetalheCurso passando o curso do estado
    Detalhes: <DetalheCurso curso={selectedCourse} onBack={handleBack} />,
    Hack: <HackathonListUnified />,
    Perfil: <PerfilPage />,
    Descobrir: <Descubrir />,
    Artigos: <AcademicLibrary />,
    Micro: <AdvancedMicrolearning />
  };

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("usuarios")
        .select("onboarded")
        .eq("id", user.id)
        .single();

      if (!profile) {
        await supabase.from("usuarios").insert({ id: user.id, onboarded: false });
        router.replace("/onboarding");
        return;
      }

      if (!profile.onboarded) {
        router.replace("/onboarding");
        return;
      }

      setLoading(false);
    };

    checkAuthAndProfile();
  }, [router]);

  const handleNavigate = (componentKey: string) => {
    // Ao navegar pela sidebar, limpamos o curso selecionado
    setSelectedCourse(null);
    setActiveContent(componentKey);
    setSidebarOpen(false);
  };

  // 3. Lógica de renderização
  const conteudoPrincipal = contentMap[activeContent] || children || <Home onCourseSelect={handleCourseSelect} />;
  const isDetailView = activeContent === "Detalhes";
  const contentPaddingClass = (activeContent !== "Community" && !isDetailView) ? "p-4" : "";

  if (loading) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${APP_BG} relative`}>
      <MobileHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <DesktopHeader />

      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 bg-white z-10">
        <Sidebar onNavigate={handleNavigate} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-screen w-64 bg-white z-50 border-r overflow-y-auto"
            >
              <div className="flex items-center justify-between p-3 border-b border-zinc-200">
                <span className="font-bold text-sm">NOVA</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <Sidebar onNavigate={handleNavigate} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto pt-[38px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeContent + (selectedCourse?.id || "")}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={`md:ml-64 ${contentPaddingClass} min-h-full`}
          >
            {conteudoPrincipal}
          </motion.div>
        </AnimatePresence>
      </main>

     <CustomTabBar 
  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
  onTabChange={handleTabChange} // <--- ADICIONE ESTA LINHA
/>
      <BotaoFlutuante />
    </div>
  );
}