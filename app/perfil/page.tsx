// app/perfil/page.tsx

// Não precisa de "use client", pois o PerfilClone já o possui.
import PerfilClone from "@/app/components/perfil/PerfilClone"; 

/**
 * Rota: /perfil
 * Objetivo: Exibir o perfil do usuário logado (Auth User).
 */
export default function MyProfilePage() {
  // Omissão de targetUserId: 
  // O componente PerfilClone carregará automaticamente o perfil do usuário logado (currentUser.id).
  // isOwner será TRUE.
  return <PerfilClone />; 
}