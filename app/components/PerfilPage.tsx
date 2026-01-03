"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import { supabase } from "@/lib/supabase";
import { 
  User, Calendar, Star, Book, Briefcase, MapPin, MoreHorizontal, MoreVertical ,Languages, ThumbsUp 
} from "lucide-react";

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

// --- INTERFACES DE TIPAGEM PARA O SUPABASE ---

interface Perfil {
    id: string;
    nome: string;
    foto_perfil: string | null;
    foto_capa: string | null;
    verificado: boolean;
    objetivo: string | null;
    funcao_interesse: string | null;
    seguindo: number | null;
    seguidores: number | null;
    networking: number | null;
    created_at: string;
    habilidades: any[]; // Manter 'any' ou tipar se souber a estrutura
}

interface Post {
    id: string;
    pinned: boolean;
    authorAvatar: string;
    date: string;
    mood: string;
    text: string;
    image: string | null;
    variationLabel: string;
    variationValue: string;
}

interface Bibliografia {
    id: string;
    usuario_id: string;
    titulo: string;
    conteudo: string;
    tipo: 'Académico' | 'Profissional' | 'Eventos'; // Assumindo estes tipos baseados no filtro
    criado_em: string;
}
interface Idioma {
  nome: string;
  nivel: string;
}

interface Recomendacao {
  id: string;
  autor: string;
  texto: string;
}


// ---------------------------------------------


export default function PerfilPage() {
  // Aplicando a tipagem explícita aqui
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bibliografias, setBibliografias] = useState<Bibliografia[]>([]);
  const [mainTab, setMainTab] = useState("Conteúdo");
  const [subTab, setSubTab] = useState("Todas");
  const [filtroPort, setFiltroPort] = useState("Todas");
  const [showFixedHeader, setShowFixedHeader] = useState(false);
const [idiomas] = useState<Idioma[]>([
  { nome: "Inglês", nivel: "Fluente" },
  { nome: "Mandarim", nivel: "Nível Intermediário" },
]);

const [recomendacoes] = useState<Recomendacao[]>([]);

  // Scroll listener para fixed header
  useEffect(() => {
    const handleScroll = () => setShowFixedHeader(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carregar perfil, posts e bibliografia
  useEffect(() => {
    async function init() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setLoading(false);

      const [perfilRes, biblioRes] = await Promise.all([
        supabase.from("usuarios").select("*").eq("id", user.id).single(),
        supabase.from("bibliografia").select("*").eq("usuario_id", user.id).order("criado_em", { ascending: false })
      ]);

      if (perfilRes.data) {
        // Tipando usuarioData como Perfil ao receber do Supabase.
        const usuarioData: Perfil = perfilRes.data as Perfil;
        if (typeof usuarioData.habilidades === "string") {
          try { usuarioData.habilidades = JSON.parse(usuarioData.habilidades); } 
          catch { usuarioData.habilidades = []; }
        }
        setPerfil(usuarioData);

        // Posts de exemplo (agora está tipado corretamente)
        const newPosts: Post[] = [
            {
                id: "p1",
                pinned: true,
                authorAvatar: usuarioData.foto_perfil || "/default-avatar.png",
                date: "19 Jun",
                mood: "Bullish",
                text: "⚡ Exemplo de publicação do usuário autenticado no feed.",
                image: "https://upload.wikimedia.org/wikipedia/commons/5/55/Changpeng_Zhao_2021.jpg",
                variationLabel: "BNB",
                variationValue: "-6.35%",
            },
        ];
        setPosts(newPosts);
      }

      // setBibliografias agora aceita Bibliografia[]
      setBibliografias(biblioRes.data as Bibliografia[] || []);


      setLoading(false);
    }

    init();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <span>Carregando...</span>
    </div>
  );

  // Com a tipagem Perfil | null, o TS sabe que perfil existe aqui.
  if (!perfil) return (
    <div className="flex items-center justify-center h-screen">
      <span>Nenhum perfil encontrado.</span>
    </div>
  );
  // O restante do código funciona perfeitamente agora porque o TS sabe que 'perfil' tem as propriedades (nome, foto_perfil, etc.)
  // O componente Image do Next.js precisa de ajustes para usar a tag Image em vez de img nativo para evitar warnings/erros (conforme a correção anterior).
  // Eu corrigi o problema de Image nativo também.

  return (
    <div className="min-h-screen bg-white w-full"> 
      {/* Fixed Header - Desktop */}
      <div className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 hidden md:flex items-center justify-between p-4 transition-transform ${showFixedHeader ? 'translate-y-0' : '-translate-y-16'}`}>
        <div className="flex items-center gap-4">
          <Image
            src={perfil.foto_perfil || "/default-avatar.png"}
            width={40} height={40} alt="Avatar"
            className="rounded-full"
          />
          <span className="font-bold">{perfil.nome}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-black text-white rounded-full text-sm">Editar Perfil</button>
          <MoreHorizontal size={20} className="text-gray-600" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-16 md:pt-24 px-4 md:px-16 w-full"> 
        {/* Cover */}
        <div className="relative w-full h-36 md:h-60">
  <Image
  src={perfil.foto_capa || "/default-avatar.png"}
  alt="Capa do Perfil"
  className="w-full h-36 md:h-60 object-cover rounded-md"
    layout="fill"
    objectFit="cover"
/>

        </div>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between -mt-12 md:-mt-20">
          <div className="flex items-center gap-4">
           <Image
  src={perfil.foto_perfil || "/default-avatar.png"}
  alt="Avatar"
  className="w-[90px] h-[90px] rounded-full border-4 border-white object-cover"
    width={90}
    height={90}
/>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{perfil.nome}</span>
                {perfil.verificado && <Star size={20} className="text-yellow-500"/>}
              </div>
              <div className="text-gray-600 mt-1 text-sm">
                {perfil.objetivo || perfil.funcao_interesse || 'Objetivo não definido'}
              </div>
              <div className="flex flex-wrap text-gray-500 text-xs gap-2 mt-1">
                <Calendar size={12}/> Membro {dayjs(perfil.created_at).fromNow()}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-sm">
              <User size={16}/> Editar Perfil
            </button>
            <button className="bg-gray-100 p-2 rounded-lg">
              <MoreVertical size={20} className="text-gray-600"/>
            </button>
          </div>
        </div>
{/* ANEXOS */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

  {/* PROFICIÊNCIA EM IDIOMAS */}
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <Languages size={20} className="text-gray-700" />
      <h3 className="font-semibold text-gray-900">
        Proficiência em idiomas
      </h3>
    </div>

    <div className="space-y-2">
      {idiomas.map((idioma, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-sm"
        >
          <span className="font-medium text-gray-800">
            {idioma.nome}
          </span>
          <span className="text-gray-600">
            {idioma.nivel}
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* RECOMENDAÇÕES RECEBIDAS */}
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <ThumbsUp size={20} className="text-gray-700" />
      <h3 className="font-semibold text-gray-900">
        Recomendações recebidas
      </h3>
    </div>

    {recomendacoes.length === 0 ? (
      <div className="text-sm text-gray-500">
        Nenhuma recomendação
      </div>
    ) : (
      <div className="space-y-3">
        {recomendacoes.map(rec => (
          <div
            key={rec.id}
            className="border border-gray-100 rounded-lg p-3"
          >
            <p className="text-sm text-gray-800">
              {rec.texto}
            </p>
            <span className="text-xs text-gray-500 mt-1 block">
              — {rec.autor}
            </span>
          </div>
        ))}
      </div>
    )}

    <button className="mt-4 text-sm text-blue-600 hover:underline">
      + Recomendar {perfil.nome.split(" ")[0]}
    </button>
  </div>

</div>

        {/* Stats */}
        <div className="flex justify-around mt-6 border-t border-b border-gray-200 py-3 text-center text-sm text-gray-600">
          <div>
            <div className="font-bold text-gray-900">{perfil.seguindo || 0}</div>
            Seguindo
          </div>
          <div>
            <div className="font-bold text-gray-900">{perfil.seguidores || 0}</div>
            Seguidores
          </div>
          <div>
            <div className="font-bold text-gray-900">{perfil.networking || 0}</div>
            Networking
          </div>
        </div>

        {/* Tabs and Content (rest of the component) */}
        {/* ... */}

        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200">
          {["Conteúdo", "Portfólio"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`pb-2 ${mainTab===tab ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SubTabs */}
        {mainTab==="Conteúdo" && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {["Todas","Post","Livros","Prêmios"].map(s => (
              <button
                key={s}
                onClick={()=>setSubTab(s)}
                className={`px-3 py-1 rounded-full text-sm ${subTab===s?'bg-gray-100 font-semibold':'text-gray-500'}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {mainTab==="Conteúdo" && posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
            {post.pinned && <div className="flex items-center text-orange-500 font-bold mb-2"><MapPin size={14}/> PINNED</div>}
            <div className="flex items-center gap-3 mb-2">
              <Image 
                src={post.authorAvatar} width={36} height={36} className="rounded-full" alt="Avatar"
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">{perfil.nome}</span>
                <span className="text-xs text-gray-500">{post.date} - {post.mood}</span>
            </div>
            </div>
            <p className="text-gray-800 mb-2">{post.text}</p>
            {post.image && (
                <Image 
                    src={post.image} 
                    width={600} 
                    height={260} 
                    className="rounded-lg w-full object-cover" 
                    alt="Post"
                />
            )}
          </div>
        ))}

        {/* Portfólio */}
        {mainTab==="Portfólio" && (
          <>
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {["Todas","Académico","Profissional","Eventos"].map(tipo => (
                <button
                  key={tipo}
                  onClick={()=>setFiltroPort(tipo)}
                  className={`px-3 py-1 rounded-full text-sm ${filtroPort===tipo?'bg-gray-100 font-semibold':'text-gray-500'}`}
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Bibliografia */}
            <div className="mt-4 space-y-4">
              {bibliografias.length===0 ? (
                <div className="flex flex-col items-center text-gray-500 py-8">
                  <Briefcase size={32}/>
                  <span className="mt-2">Nenhuma bibliografia adicionada.</span>
                </div>
              ) : (
                bibliografias
                  .filter(b => filtroPort === 'Todas' ? true : b.tipo === filtroPort)
                  .map(b => (
                    <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900">{b.titulo}</h3>
                      <p className="text-gray-700">{b.conteudo}</p>
                    </div>
                  ))
              )}
            </div>
          </> // <--- Fragmento JSX fechado corretamente
        )}
      </div>
    </div>
  );
}