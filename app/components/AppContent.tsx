"use client";

import { useState, useEffect, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Sidebar from "./Sidebar";
import Home from "./Home";
import MobileHeader from "./CustomHeader";
import CustomTabBar from "./CustomTabBar";
import { motion, AnimatePresence } from "framer-motion";
import DesktopHeader from "./DesktopHeader";

import BotaoFlutuante from "./BotaoFlutuante";
import CareerDashboard from "./CareerDashboard";
import AdvancedMicrolearning from "./Microlearning";
import AcademicLibrary from "./AcademicLibrary";
import AreaMembros from "./AreaMembros";
import PerfilPage from "./PerfilPage";
import PwaInstallAndroid from "./pwa/PwaInstallBanner";
import PwaInstallIOS from "./pwa/PwaInstallBannerIOS";

import Notificacoes from "../Notificacoes/page";
import DetalhesUsuario from "../components/DetalhesUsuario";
import MessagesPage from "./MessagesPage";
import Footer from "./Footer";
import PostManagerList from "../post/page";
import AuthorDashboardView from "./AuthorDashboardView";
import NetworkingPage from "../components/Networking";



interface Props {
  children?: ReactNode;
}
interface DetalhesUsuarioProps {
  usuarioId: string;
  usuarioLogadoId: string; // ❗ NÃO aceita null
  onBack?: () => void;
}


const APP_BG = "bg-white";

export default function AppContent({ children }: Props) {
  const [activeContent, setActiveContent] = useState<string>("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMemberCourse, setSelectedMemberCourse] = useState<any>(null);
const [usuarioDetalhesId, setUsuarioDetalhesId] = useState<string | null>(null);
const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | null>(null);


  const router = useRouter();

  // Navegação ao selecionar um curso
  const handleCourseSelect = (course: any) => {
    router.push(`/cursos/${course.slug}`);
  };

  // Troca de aba do CustomTabBar
  const handleTabChange = (componentKey: string) => {
    setActiveContent(componentKey);
  };






  // Conteúdo principal
  const contentMap: { [key: string]: ReactNode } = {
    Home: <Home onCourseSelect={handleCourseSelect} />,
    Aprendizados: (
      <CareerDashboard
        onCourseSelect={(c) => {
          setSelectedMemberCourse(c);
          setActiveContent("Membros");
        }}
      />
    ),
    Perfil: <PerfilPage />,
    Artigos: <AcademicLibrary />,
    Micro: <AdvancedMicrolearning />,
    Membros: (
      <AreaMembros
        curso={selectedMemberCourse}
        onBack={() => setActiveContent("Aprendizados")}
      />
    ),
    Networking: <NetworkingPage
  onSelectUser={(id) => {
    setUsuarioDetalhesId(id);
    setActiveContent("DetalhesUsuario");
  }}
/>,
    Notificacoes: <Notificacoes />,
 DetalhesUsuario:
  usuarioDetalhesId && usuarioLogadoId ? (
    <DetalhesUsuario
      usuarioId={usuarioDetalhesId}
      usuarioLogadoId={usuarioLogadoId} // ✅ agora é string garantida
      onBack={() => {
        setUsuarioDetalhesId(null);
        setActiveContent("Networking");
      }}
    />
  ) : null,
Mensagens: <MessagesPage />,
Comunidade: <PostManagerList />,
Arquivos: usuarioLogadoId ? (
  <AuthorDashboardView currentUserId={usuarioLogadoId} />
) : (
  <div className="flex items-center justify-center h-full">
    <p className="text-zinc-400">Carregando painel...</p>
  </div>
)


  };

  // Check de autenticação e onboard
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }
 setUsuarioLogadoId(user.id);
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

  // Navegação lateral
  const handleNavigate = (componentKey: string) => {
    setActiveContent(componentKey);
    setSidebarOpen(false);
  };

  // Scroll reset ao mudar de página
  const scrollContainerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0);
  }, [activeContent]);

  const conteudoPrincipal = contentMap[activeContent] || children || (
    <Home onCourseSelect={handleCourseSelect} />
  );
  const contentPaddingClass = activeContent !== "Community" ? "p-4" : "";

  if (loading) return null;

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${APP_BG} relative`}>

<MobileHeader
  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
  sidebarOpen={sidebarOpen}
  onSelectContent={(key: string) => setActiveContent(key)}
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
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
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

      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto pt-[3px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeContent}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={`md:ml-64 ${contentPaddingClass} min-h-full`}
          >
            {conteudoPrincipal}
          </motion.div>
        </AnimatePresence>
          <Footer />
      </main>

     

      <BotaoFlutuante />

      {/* PWA Install Banners */}
      <PwaInstallAndroid />
      <PwaInstallIOS />
    </div>
  );
}
