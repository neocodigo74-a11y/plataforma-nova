"use client";

import Image from "next/image";
import {
  Layers,
  Clock,
  Check,
  ChevronRight,
  X,
  Loader2,
  PlayCircle,
  FileText,
  Download,
  Smartphone,
  Infinity,
  Award,
  Share2,
  Clipboard,
  MessageCircle,
  Facebook,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

/* =========================
   TIPAGEM DAS PROPS
========================= */
interface Curso {
  id: string | number;
  title: string;
  description: string;
  slug?: string;
  image?: string;
  type?: "curso" | "micro"; // ✅ distingue cursos e microaprendizado
  durationMin?: number;      // para micro
  questionsCount?: number;   // para micro
  rating?: number;
  reviewsText?: string;
  details?: string;
  tags?: string[];
}

interface Aula {
  id: string | number;
  curso_id: string | number;
  tipo_conteudo: string; // "video", "artigo", etc.
  url_video?: string;
  thumbnail_url?: string;
  titulo?: string;
  modulo_titulo?: string;
  ordem?: number;
}

interface DetalheCursoProps {
  curso: Curso;
  onBack?: () => void;
}

/* =========================
   COMPONENTES DE SUPORTE
========================= */
function StickyHeader({ curso, onBack, handleShareClick }: { curso: Curso, onBack?: () => void, handleShareClick: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-lg transition-all duration-300 transform translate-y-0">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800 transition" title="Voltar">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-base font-semibold truncate max-w-[calc(100%-140px)]">{curso.title}</h2>
        <button onClick={handleShareClick} className="p-2 rounded-full hover:bg-gray-800 transition" title="Compartilhar curso">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

function StickyCtaBar({ checkingEnrollment, isEnrolled, setIsModalOpen }: { checkingEnrollment: boolean, isEnrolled: boolean, setIsModalOpen: (open: boolean) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-4 lg:hidden">
      {checkingEnrollment ? (
        <div className="w-full h-[52px] bg-gray-200 animate-pulse rounded-md" />
      ) : isEnrolled ? (
        <button className="w-full bg-green-600 hover:bg-green-700 text-white text-[16px] font-semibold py-3 rounded-md transition flex items-center justify-center gap-2">
          <Check className="w-5 h-5" /> Ir para o curso
        </button>
      ) : (
        <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#0056d2] hover:bg-[#00419e] text-white text-[16px] font-semibold py-3 rounded-md transition duration-200 shadow-lg">
          {checkingEnrollment ? "Carregando..." : "Inscreva-se gratuitamente"}
        </button>
      )}
    </div>
  );
}

interface MetricProps { icon?: React.ReactNode; title: string; subtitle: string; }
function Metric({ icon, title, subtitle }: MetricProps) {
  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-[15px] font-bold text-[#1f1f1f]">{title}</p>
      <p className="text-[12px] text-[#5b5f62] leading-tight">{subtitle}</p>
    </div>
  );
}

interface TabProps { label: string; active?: boolean; }
function Tab({ label, active = false }: TabProps) {
  return (
    <button className={`pb-4 text-[15px] font-medium transition-all whitespace-nowrap ${active ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
      {label}
    </button>
  );
}

interface LearnItemProps { text: string; }
function LearnItem({ text }: LearnItemProps) {
  return (
    <div className="flex gap-3 items-start">
      <div className="bg-blue-100 p-1 rounded-full mt-1">
        <Check className="w-3 h-3 text-blue-600" />
      </div>
      <p className="text-[15px] text-gray-700">{text}</p>
    </div>
  );
}

function VideoIntro({ video }: { video: Aula }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md">
      <video controls className="w-full h-full object-cover" src={video.url_video} poster={video.thumbnail_url} />
    </div>
  );
}

function InstructorAvatars() {
  return (
    <div className="flex -space-x-2 items-center">
      <div className="w-7 h-7 border-2 border-white rounded-full bg-blue-500 shadow-sm" />
      <div className="w-7 h-7 border-2 border-white rounded-full bg-indigo-400 shadow-sm" />
    </div>
  );
}

function CursoIncluiCard({ curso }: { curso: Curso }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-[16px] font-semibold text-gray-900 mb-4">
        {curso.type === "micro" ? "Este microaprendizado inclui:" : "Este curso inclui:"}
      </h3>
      <ul className="space-y-3 text-[14px] text-gray-700">
        {curso.type === "curso" ? (
          <>
            <li className="flex items-center gap-3"><PlayCircle className="w-5 h-5 text-gray-600" />14,5 horas de vídeo</li>
            <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-600" />2 artigos</li>
            <li className="flex items-center gap-3"><Download className="w-5 h-5 text-gray-600" />4 recursos para download</li>
          </>
        ) : (
          <>
            {curso.durationMin && <li>⏱ Duração: {curso.durationMin} min</li>}
            {curso.questionsCount && <li>❓ Perguntas: {curso.questionsCount}</li>}
          </>
        )}
        <li className="flex items-center gap-3"><Smartphone className="w-5 h-5 text-gray-600" />Acesso no dispositivo móvel e TV</li>
        <li className="flex items-center gap-3"><Infinity className="w-5 h-5 text-gray-600" />Acesso vitalício</li>
        <li className="flex items-center gap-3"><Award className="w-5 h-5 text-blue-600" />Certificado de conclusão</li>
      </ul>
    </div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function DetalheCurso({ curso, onBack }: DetalheCursoProps) {
  const [dataAtual, setDataAtual] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [objetivo, setObjetivo] = useState("Aprimoramento Profissional");
  const [userId, setUserId] = useState<string | null>(null);
  const [totalInscritos, setTotalInscritos] = useState<number | null>(null);
  const [videoIntro, setVideoIntro] = useState<Aula | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isCtaSticky, setIsCtaSticky] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const courseUrl = typeof window !== "undefined" && curso.slug
    ? `${window.location.origin}/cursos/${curso.slug}${userId ? `?ref=${userId}` : ""}`
    : "";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const data = new Date();
    setDataAtual(data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }));

    checkExistingEnrollment();
    fetchTotalEnrollments();
    fetchAulas();
  }, [curso.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setIsHeaderSticky(rect.top <= 0);
      }
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        setIsCtaSticky(rect.top < 64);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchTotalEnrollments = async () => {
    try {
      const { count, error } = await supabase
        .from('inscricoes_cursos')
        .select('*', { count: 'exact', head: true })
        .eq('curso_id', String(curso.id));
      if (error) throw error;
      setTotalInscritos(count);
    } catch (error) { console.error(error); }
  };

  const fetchAulas = async () => {
    try {
      const { data, error } = await supabase
        .from("aulas_academia")
        .select("*")
        .eq("curso_id", curso.id)
        .order("ordem", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        const primeiroVideo = data.find(aula => aula.tipo_conteudo === "video");
        if (primeiroVideo) setVideoIntro(primeiroVideo);
      }
    } catch (error) { console.error(error); }
  };

  const checkExistingEnrollment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('inscricoes_cursos')
          .select('id')
          .eq('usuario_id', session.user.id)
          .eq('curso_id', String(curso.id))
          .single();
        if (data) setIsEnrolled(true);
      }
    } catch (error) { console.error(error); }
    finally { setCheckingEnrollment(false); }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) { alert("Por favor, faça login!"); setLoading(false); return; }
    try {
      const { error } = await supabase.from('inscricoes_cursos').insert([{ usuario_id: user.id, curso_id: String(curso.id), curso_titulo: curso.title, objetivo }]);
      if (error) { if (error.code === '23505') setIsEnrolled(true); else throw error; }
      else { setIsEnrolled(true); setIsModalOpen(false); fetchTotalEnrollments(); alert("Inscrição realizada!"); }
    } catch (error) { console.error(error); alert("Falha na inscrição."); }
    finally { setLoading(false); }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(courseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!courseUrl) return;
    const text = encodeURIComponent(`Confira este curso na NOVA:\n${courseUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareFacebook = () => {
    if (!courseUrl) return;
    const url = encodeURIComponent(courseUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: curso.title, text: "Confira este curso na NOVA 🚀", url: courseUrl }); return; }
      catch (err) { console.log("Compartilhamento cancelado"); }
    }
    setIsShareModalOpen(true);
  };

  return (
    <section className="relative bg-[#ffff] w-full">
  {isHeaderSticky && <StickyHeader curso={curso} onBack={onBack} handleShareClick={handleShareClick} />}
 <div className="max-w-screen-2xl mx-auto px-6 pt-10 pb-20 relative z-10 lg:pt-14">
    <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2 mt-4" ref={headerRef}>
              <h1 className="text-[28px] leading-tight font-bold text-[#1f1f1f] max-w-[640px] mb-2 lg:text-[36px] lg:leading-[44px]">{curso.title}</h1>
              <button onClick={handleShareClick} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition" title="Compartilhar curso">
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-[#373a3c] max-w-[620px] lg:text-[16px] lg:leading-[24px]">{curso.description}</p>
            {videoIntro && <div className="lg:hidden mt-6"><VideoIntro video={videoIntro} /></div>}
            <div className="lg:hidden mt-6"><CursoIncluiCard curso={curso} /></div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-[#5b5f62]">
              <InstructorAvatars />
              <span>Instrutores:</span>
              <span className="text-[#0056d2] font-medium">John Rofrano</span>
              <span>+ Mais 6</span>
              <span className="bg-[#eef3ff] text-[#0056d2] text-[12px] px-2 py-1 rounded-full">Instrutor principal</span>
            </div>

            <div className="mt-6 flex flex-col gap-3" ref={ctaRef}>
              {checkingEnrollment ? (
                <div className="w-full sm:w-[260px] h-[52px] bg-gray-200 animate-pulse rounded-md" />
              ) : isEnrolled ? (
                <button className="w-full sm:w-[260px] bg-green-600 hover:bg-green-700 text-white text-[14px] font-semibold px-5 py-3 rounded-md transition flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Ir para o curso
                </button>
              ) : (
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-[260px] bg-[#0056d2] hover:bg-[#00419e] text-white text-[14px] font-semibold px-5 py-4 rounded-md transition duration-200 shadow-lg shadow-blue-900/10">
                  {curso.type === "micro" ? "Começar Microaprendizado" : "Inscreva-se gratuitamente"}
                  <span className="block text-[12px] font-normal mt-1 opacity-90">Inicia em {dataAtual || "..."}</span>
                </button>
              )}
              <p className="text-[14px] text-[#5b5f62] lg:text-[13px]">Experimente gratuitamente: teste de acesso total por 7 dias</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-[#5b5f62]">
              <strong className="text-[15px] text-[#1f1f1f]">{totalInscritos !== null ? totalInscritos.toLocaleString('pt-BR') : "..."}</strong>
              <span>já se inscreveram</span>
            </div>
          </div>

           {/* TABS & CONTEÚDO */}
      <div className="max-w-[1180px] mx-auto px-6 mt-12 pb-20">
        <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
          <Tab label="Sobre" active />
          <Tab label="Conteúdo" />
          <Tab label="Avaliações" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">O que você vai aprender</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <LearnItem text="Domine as ferramentas práticas mais atualizadas do mercado de TI." />
          <LearnItem text="Aprenda conceitos Agile, Scrum e melhoria contínua." />
          <LearnItem text="Gerencie projetos complexos e situações reais com clientes." />
          <LearnItem text="Aplique habilidades em laboratórios práticos e projetos reais." />
        </div>
      </div>

          {videoIntro && <div className="hidden lg:block sticky top-24"><VideoIntro video={videoIntro} /></div>}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24"><CursoIncluiCard curso={curso} /></div>
        </div>
      </div>

      {isCtaSticky && <StickyCtaBar checkingEnrollment={checkingEnrollment} isEnrolled={isEnrolled} setIsModalOpen={setIsModalOpen} />}

      {/* ========================
          MODAL DE INSCRIÇÃO
      ========================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Confirme sua inscrição</h2>
            <form onSubmit={handleEnroll} className="flex flex-col gap-4">
              <label className="text-[14px] font-medium">Objetivo:</label>
              <select value={objetivo} onChange={e => setObjetivo(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
                <option>Aprimoramento Profissional</option>
                <option>Desenvolvimento Pessoal</option>
                <option>Preparação para Carreira</option>
              </select>
              <button type="submit" className="w-full bg-[#0056d2] hover:bg-[#00419e] text-white py-3 rounded-md font-semibold flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirmar inscrição
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================
          MODAL DE COMPARTILHAR
      ========================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Compartilhar curso</h2>
            <div className="flex flex-col gap-3">
              <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-100 transition">
                <MessageCircle className="w-5 h-5 text-green-500" /> WhatsApp
              </button>
              <button onClick={handleShareFacebook} className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-100 transition">
                <Facebook className="w-5 h-5 text-blue-600" /> Facebook
              </button>
              <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-100 transition">
                <Clipboard className="w-5 h-5" /> {copied ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
