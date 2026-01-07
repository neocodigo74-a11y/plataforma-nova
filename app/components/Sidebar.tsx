"use client";

import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import {
  Bell,
  Search,
  Clock,
  Users,
  FileText,
  Folder,
  LayoutDashboard,
  Trash2,
  Star,
  ChevronDown,
  Plus,
  Settings,
  GraduationCap,
  LogOut,
 
  User2,
  Briefcase,
  Cog,
  Form,
} from "lucide-react";

type UserInfo = {
  nome: string;
  foto_perfil: string | null;
};

type Startup = {
  id: number;
  nome: string;
  imagem: string | null;
  status: "Free" | "Pro" | "Trial";
};

const INITIAL_COLORS = [
  "bg-red-600",
  "bg-blue-600",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-yellow-600",
];

const getInitialColor = (id: number) =>
  INITIAL_COLORS[id % INITIAL_COLORS.length];

function StartupItem({ startup }: { startup: Startup }) {
  const statusClasses =
    startup.status === "Pro"
      ? "bg-blue-100 text-blue-800"
      : startup.status === "Trial"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-700";

  return (
    <div className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-100 transition cursor-pointer">
      <div className="flex items-center gap-2">
        {startup.imagem ? (
          <img
            src={startup.imagem}
            alt={startup.nome}
            className="h-4 w-4 rounded object-cover"
          />
        ) : (
          <div
            className={`h-4 w-4 rounded ${getInitialColor(
              startup.id
            )} text-white flex items-center justify-center text-[10px] font-bold`}
          >
            {startup.nome.charAt(0).toUpperCase()}
          </div>
        )}

        <span className="text-zinc-900 text-[13px] font-medium">
          {startup.nome}
        </span>

        <span
          className={`ml-1 text-[9px] font-medium px-1 py-0.5 rounded ${statusClasses}`}
        >
          {startup.status}
        </span>
      </div>

      <Settings
        size={12}
        className="text-zinc-500 opacity-0 group-hover:opacity-100 transition"
      />
    </div>
  );
}

export default function Sidebar({
  onNavigate,
}: {
  onNavigate: (component: string) => void;
}) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [startupsList, setStartupsList] = useState<Startup[]>([]);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateUnreadNotifications = async (user: User) => {
    const { count } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact" })
      .eq("recebido_por", user.id)
      .eq("lido", false);

    setUnreadNotifications(count || 0);
  };

  const fetchStartups = async (userId: string) => {
    const { data } = await supabase
      .from("startups")
      .select("id, nome, imagem, status")
      .or(`criado_por.eq.${userId},membro_id.eq.${userId}`);

    setStartupsList(
      (data || []).map((s) => ({
        ...s,
        status: s.status || "Free",
      }))
    );
  };

 useEffect(() => {
  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Primeiro, busca sempre os dados na tabela 'usuarios'
    const { data, error } = await supabase
      .from("usuarios")
      .select("nome, foto_perfil")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar usuário na tabela:", error);
    }

    // Prioriza dados da tabela, cai no Google Auth se não tiver
    const nome = data?.nome || user.user_metadata?.full_name || user.user_metadata?.name || "";
    const foto = data?.foto_perfil || user.user_metadata?.avatar_url || null;

    setUserInfo({ nome, foto_perfil: foto });
    updateUnreadNotifications(user);
    fetchStartups(user.id);
  };

  init();

  const close = () => setOpenProfileMenu(false);
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);



  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white">
      {/* TOP PROFILE */}
      <div className="px-3 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 relative">
       {userInfo?.foto_perfil ? (
  <img
    src={userInfo.foto_perfil}
    alt={userInfo.nome}
    className="h-6 w-6 rounded-full object-cover"
  />
) : (
  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-white">
    {userInfo?.nome?.[0].toUpperCase() || "U"}
  </div>
)}


          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenProfileMenu((p) => !p);
            }}
            className="flex items-center gap-1 text-zinc-600 text-[12px] font-medium"
          >
            {userInfo?.nome || "Carregando..."}
            <ChevronDown size={11} />
          </button>

          {openProfileMenu && (
            <div className="absolute top-7 left-6 w-36 bg-white border border-zinc-200 rounded-md shadow-lg z-50">
              <button
                
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-zinc-700 "
              >
                <User2 size={14} />
                Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <Bell size={14} className="text-zinc-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1.5 h-3 w-3 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </div>
      </div>

      {/* SEARCH */}
      <div className="px-3">
        <div className="flex items-center gap-2 bg-zinc-100 rounded-md px-2 py-1 text-[11px] text-zinc-600">
          <Search size={11} />
          Search
        </div>
      </div>

      {/* MENU */}
      <div className="mt-2 px-2 flex flex-col gap-0.5">
        <SidebarItem icon={<LayoutDashboard size={13} />} label="Inicio" active  onClick={() => onNavigate("Home")} />
     <SidebarItem
  icon={<Users size={13} />}
  label="Comunidade"
  onClick={() => onNavigate("Comunidade")}
/>
     <SidebarItem
  icon={<Form size={13} />}
  label="Formularios"
  onClick={() => onNavigate("Desafio")}
/>
<div className="relative">
  <SidebarItem
    icon={<Briefcase size={13} />}
    label="Explorar vagas"
    onClick={() => onNavigate("Empregos")}
  />
  <span className="absolute right-2 top-1 text-[9px] bg-green-100 text-zinc-600 px-1 py-0.5 rounded">
    Novo
  </span>
</div>


            
      </div>

      <hr className="my-3 mx-3 border-zinc-200" />
 {/* 1. SEÇÃO DE WORKSPACE ORIGINAL (Mantida) */}
      <div className="px-3 text-[10px] font-semibold text-zinc-500 uppercase">
        Academia NOVA
      </div>

      <div className="px-2 mt-1 flex flex-col gap-0.5 text-[12px]">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded bg-green-700 text-white flex items-center justify-center text-[9px] font-bold">
              {userInfo?.nome?.charAt(0).toUpperCase() || "N"}
            </div>
            <span className="text-zinc-900">NOVA Workspace</span> 
            <span className="ml-1 text-[9px] bg-green-100 text-zinc-600 px-1 py-0.5 rounded">
              Free
            </span>
          </div>
          <Plus size={11} />
        </div>
        <SidebarItem icon={<GraduationCap size={13} />} label="Meus Aprendizados"     onClick={() => onNavigate("Aprendizados")}/>
        <SidebarItem icon={<LayoutDashboard size={13} />} label="Desafios iniciados" />
        <SidebarItem icon={<Folder size={13} />} label="Meus Arquivos" onClick={() => onNavigate("Arquivos")}   />
 
        <SidebarItem icon={<Cog size={16} />} label="Configuração do sistema" />
      </div>

      <hr className="my-3 mx-3 border-t border-zinc-200" /> 

      {/* 2. SEÇÃO DE STARTUPS (AGORA DINÂMICA) */}
      <div className="px-3 text-[8px] font-semibold text-zinc-500 uppercase">
         Startups que fazes parte serão listadas aqui
      </div>

      <div className="px-2 mt-1 flex flex-col gap-0.5 text-[12px]">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-100 transition cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-600">
             <Plus size={12} className="text-zinc-500" />
             <span className="text-zinc-600 text-[13px]">Nova Startup/Workspace</span>
          </div>
        </div>
        
        {/* Renderização Dinâmica das Startups */}
        {startupsList.length > 0 ? (
            startupsList.map(startup => (
                <StartupItem key={startup.id} startup={startup} />
            ))
        ) : (
            <p className="text-zinc-400 text-xs px-2 py-1">Nenhuma startup encontrada.</p>
        )}
      </div>

      <hr className="my-3 mx-3 border-t border-zinc-200" /> 

      {/* Starred (Mantido) */}
      <div className="px-3 text-[10px] font-semibold text-zinc-500 uppercase">
        Starred
      </div>

      <div className="px-2 mt-1">
        <SidebarItem icon={<Star size={12} />} label="NOVA Projeto" />
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition ${
        active
          ? "bg-blue-600 text-white font-medium"
          : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {icon}
      <span className="text-[13px]">{label}</span>
    </div>
  );
}
