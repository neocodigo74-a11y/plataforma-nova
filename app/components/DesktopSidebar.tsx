"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Trophy,
  Book,
  School,
  Code,
  Bell,
  MessageCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export default function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { label: "Início", icon: Home, route: "/" },
    { label: "Desafios", icon: Trophy, route: "/descubrir" },
    { label: "Artigos", icon: Book, route: "/racking" },
    { label: "Microlearning", icon: School, route: "/desafios" },
    { label: "Hackathons", icon: Code, route: "/comunidade" },
    { label: "Mensagens", icon: MessageCircle, route: "/mensagens" },
    { label: "Notificações", icon: Bell, route: "/notificacoes" },
    { label: "Amigos", icon: Users, route: "/networking" },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 px-4 py-6">
      <div className="flex flex-col gap-2 w-full">

        {/* Logo */}
        <div className="mb-6 px-2">
          <Image src="/nova.svg" alt="NOVA" width={90} height={28} />
        </div>

        {/* Menu */}
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.route)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md transition",
                isActive
                  ? "bg-gray-100 font-semibold text-black"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
