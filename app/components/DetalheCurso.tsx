"use client";

import Image from "next/image";
import {
  Star,
  Layers,
  Clock,
  Calendar,
  Check,
  ChevronRight, // Adicionado para simular o Coursera Plus "Saiba mais"
  Users, // Ícone mais adequado para "inscrições" em vez de Layers
} from "lucide-react";

/* ====================================================== */
// NOTA: Para rodar perfeitamente, você precisará de:
// 1. Um arquivo /public/ibm-logo.svg (ou substitua por um <img> tag e um src real do logo IBM)
// 2. Imagens de perfil dos instrutores (substituído por placeholders coloridos)
/* ====================================================== */

export default function DetalheCurso({ curso, onBack }) {

  return (
    // Seção principal com o fundo leve e gráfico decorativo
    <section className="relative bg-[#f7f8fa] overflow-hidden">
      
      {/* GRÁFICO DECORATIVO DIREITA - Ajustado para ser fiel à imagem */}
      {/* O gráfico é uma combinação de elementos circulares e um SVG de fundo */}
      <div className="hidden lg:block absolute right-[-100px] top-0 bottom-0 pointer-events-none">
        <svg
          viewBox="0 0 540 540"
          width="540"
          height="540"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
        >
          <path
            d="M540 270c0 149.12-111.96 270-250 270S40 419.12 40 270 151.96 0 290 0s250 120.88 250 270z"
            fill="#eef1f6"
          />
          <path
            d="M540 270c0 149.12-111.96 270-250 270S40 419.12 40 270 151.96 0 290 0s250 120.88 250 270z"
            fill="#eef1f6"
            className="translate-x-[40px] translate-y-[-10px] scale-[0.85]"
          />
          <path
            d="M540 270c0 149.12-111.96 270-250 270S40 419.12 40 270 151.96 0 290 0s250 120.88 250 270z"
            fill="none"
            stroke="#eef1f6"
            strokeWidth="80"
            className="translate-x-[20px] translate-y-[-10px] scale-[0.80]"
          />
        </svg>
      </div>


      {/* CONTAINER HERO */}
      <div className="max-w-[1180px] mx-auto px-6 pt-10 pb-20 relative z-10 lg:pt-14">

        {/* LOGO (Não aparece na imagem, mas um bom toque se fosse o Coursera) */}
        {/* <Image
          src="/ibm-logo.svg"
          alt="IBM"
          width={60}
          height={24}
          className="mb-6"
        /> */}

        {/* GRID */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-10">

          {/* COLUNA PRINCIPAL - TEXTO E CTA */}
          <div>
            {/* Título */}
            <h1 className="text-[28px] leading-tight font-bold text-[#1f1f1f] max-w-[640px] mb-2 lg:text-[36px] lg:leading-[44px]">
              {curso.title}
            </h1>

            {/* Descrição */}
            <p className="mt-4 text-[15px] leading-relaxed text-[#373a3c] max-w-[620px] lg:text-[16px] lg:leading-[24px]">
               {curso.description}{" "}
              <strong>
                Certified Associate in Project Management (CAPM)
              </strong>.
            </p>

            {/* INSTRUTORES */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px] text-[#5b5f62]">
              <InstructorAvatars /> {/* Componente de avatares */}
              <span>Instrutores:</span>
              <span className="text-[#0056d2] font-medium">
                John Rofrano
              </span>
              <span>+ Mais 6</span>
              <span className="bg-[#eef3ff] text-[#0056d2] text-[12px] px-2 py-[2px] rounded-full"> {/* Usando rounded-full para ser mais fiel */}
                Instrutor principal
              </span>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3">
              {/* Botão de Inscrição */}
              <button className="w-full sm:w-[260px] bg-[#0056d2] hover:bg-[#00419e] text-white text-[14px] font-semibold px-5 py-3 rounded-md transition duration-200"> {/* Arredondamento e transição adicionados */}
                Inscreva-se gratuitamente
                <span className="block text-[12px] font-normal mt-1">
                  Inicia em 25 de dez
                </span>
              </button>

              {/* Texto do Teste Gratuito */}
              <p className="text-[14px] text-[#5b5f62] lg:text-[13px]">
                Experimente gratuitamente: inscreva-se para iniciar seu teste gratuito de acesso total por 7 dias
              </p>
            </div>

            {/* CONTADOR E NOVA PLUS */}
            <div className="mt-4 text-[13px] text-[#5b5f62] flex flex-wrap items-center gap-2">
              <strong className="text-[15px] text-[#1f1f1f]">45.620</strong>
              <span className="text-[#5b5f62]">já se inscreveram</span>
              <span className="hidden sm:inline">|</span> {/* Divisor visual */}
              <span className="text-[#5b5f62] flex items-center gap-1">
                Incluído com o
                <span className="text-[#0056d2] font-semibold flex items-center gap-1">
                  NOVA <span className="bg-[#0056d2] text-white"> Plus </span>
                  <ChevronRight className="w-3 h-3 text-[#0056d2]" />
                </span>
              </span>
            </div>
          </div>
          
          {/* COLUNA LATERAL - Geralmente contém vídeo ou mais info, mas neste design é só gráfico */}
          <div className="hidden lg:block">{/* Deixa a coluna vazia para o gráfico de fundo aparecer */}</div>
        </div>
      </div>

      {/* MÉTRICAS (MUITO IMPORTANTE: Estilização do card) */}
      <div className="relative z-20 -mt-10 lg:-mt-16">
        <div className="max-w-[1180px] mx-auto px-6">
          {/* O Card das métricas - Usando o bg-white, bordas suaves e sombra correta */}
          <div className="bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <Metric icon={<Layers className="w-6 h-6 text-[#1f1f1f]" />} title="11 séries de cursos" subtitle="Obtenha uma qualificação profissional que demonstre seus conhecimentos" />
 
      
      {/* AQUI ESTÁ A MUDANÇA: */}
      <Metric 
        icon={null} 
        title={`${curso.rating} ★`} 
        subtitle={`(${curso.reviews})`} details
      />
            <Metric icon={null} title="Nível " subtitle={`${curso.details} `} />
            <Metric icon={null} title="4 meses para completar" subtitle="em 10 horas por semana" />
            <Metric icon={null} title="Cronograma flexível" subtitle="Aprenda no seu ritmo" />
          </div>
        </div>
      </div>

      {/* TABS (Guia de Navegação) */}
      <div className="max-w-[1180px] mx-auto px-6 mt-10">
        <div className="flex gap-8 border-b border-[#e9ecef] text-[15px] lg:gap-10">
          <Tab label="Sobre" active />
          <Tab label="Resultados" />
          <Tab label="Cursos" />
          <Tab label="Depoimentos" />
        </div>
      </div>

      {/* CONTEÚDO SOBRE (Segunda Imagem) */}
      <div className="max-w-[1180px] mx-auto px-6 mt-8 pb-24">

        {/* Título: O que você vai aprender */}
        <h2 className="text-[20px] font-semibold text-[#1f1f1f] mb-6">
          O que você vai aprender
        </h2>

        {/* Lista de Aprendizado */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-[15px] text-[#373a3c] leading-relaxed">
          <LearnItem text="Domine as habilidades e ferramentas práticas mais atualizadas que os gerentes de projetos de TI usam em suas funções diárias" />
          <LearnItem text="Aprender os conceitos Agile de planejamento adaptativo, desenvolvimento iterativo e melhoria contínua que levam a entregas antecipadas e alto valor para o cliente" />
          <LearnItem text="Acompanhar e gerenciar projetos, incluindo a abordagem de situações difíceis com clientes e como as atividades mudam ao longo do ciclo de vida do gerenciamento de projetos" />
          <LearnItem text="Aplique suas novas habilidades em projetos do mundo real e laboratórios práticos" />
        </div>

        {/* Título: Habilidades que você terá */}
        <h2 className="text-[20px] font-semibold text-[#1f1f1f] mt-12 mb-4">
          Habilidades que você terá
        </h2>

        {/* Tags de Habilidades */}
        <div className="flex flex-wrap gap-2.5">
          <SkillTag label="Gestão de projetos" />
          <SkillTag label="Engajamento das partes interessadas" />
          <SkillTag label="Comunicação" />
          <SkillTag label="Princípios de Kanban" />
          <SkillTag label="Desenvolvimento ágil de software" />
          <SkillTag label="Liderança" />
          <SkillTag label="Gerenciamento de riscos do projeto" />

          <button className="text-[13px] text-[#0056d2] font-medium hover:underline px-1 py-1">
            Visualizar todas as habilidades
          </button>
        </div>
      </div>
    </section>
  );
}

/* ====================================================== */
/* COMPONENTES AUXILIARES (REFATORADOS PARA FIDELIDADE) */
/* ====================================================== */

/**
 * Componente para mostrar as métricas em bloco.
 */
function Metric({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode | null;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 px-2">
      {/* Se o ícone for fornecido, renderiza. Na imagem, ele só aparece no primeiro item. */}
      {icon && <div className="text-[#1f1f1f]">{icon}</div>} 
      <p className="text-[14px] font-semibold text-[#1f1f1f] leading-tight">{title}</p>
      {/* Reduzindo o tamanho da fonte para a fidelidade da imagem */}
      <p className="text-[12px] text-[#5b5f62] leading-snug">{subtitle}</p>
    </div>
  );
}

/**
 * Componente para as abas de navegação (Sobre, Resultados, etc.).
 */
function Tab({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`pb-3 transition duration-150 ease-in-out whitespace-nowrap 
      ${
        active
          ? "border-b-2 border-[#0056d2] text-[#0056d2] font-semibold"
          : "border-b-2 border-transparent text-[#5b5f62] hover:text-[#0056d2]"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Componente para o item de lista de aprendizado.
 */
function LearnItem({ text }: { text: string }) {
  return (
    // Ajustado para um espaçamento mais apertado, como na imagem
    <div className="flex gap-2.5 items-start">
      {/* Ícone de Check Azul (ajustado para mt-[2px] para alinhamento fino) */}
      <Check className="w-[18px] h-[18px] text-[#0056d2] mt-[2px] flex-shrink-0" />
      <p>{text}</p>
    </div>
  );
}

/**
 * Componente para a tag de habilidade.
 */
function SkillTag({ label }: { label: string }) {
  return (
    // Estilização fiel: fundo azul claro/cinza, texto escuro, arredondado
    <span className="bg-[#f3f6fb] text-[#1f1f1f] text-[13px] px-3 py-1 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

/**
 * Componente para simular os avatares dos instrutores.
 */
function InstructorAvatars() {
    return (
        <div className="flex -space-x-2.5 rtl:space-x-reverse items-center">
            {/* Avatares Placeholder - Simulação de imagem de perfil */}
            <div className="w-7 h-7 border-2 border-white rounded-full bg-blue-500 overflow-hidden">
                {/* <Image src="/avatar1.jpg" alt="John Rofrano" fill className="object-cover" /> */}
            </div>
            <div className="w-7 h-7 border-2 border-white rounded-full bg-red-400 overflow-hidden">
                 {/* <Image src="/avatar2.jpg" alt="Instrutor 2" fill className="object-cover" /> */}
            </div>
        </div>
    );
}