"use client";

import {
  Search,
  MapPin,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= DADOS ================= */

const jobs = [
  {
    title: "Atendente/Caixa de Dispensário",
    location: "Luanda, Angola",
    company: "Green Flower",
    salary: "AOA 180.000 (Mensal)",
  },
  {
    title: "Supervisor de Loja",
    location: "Luanda, Angola",
    company: "Mercado Whole",
    salary: "AOA 250.000 a 420.000",
    badge: "TEMPO TOTAL",
  },
  {
    title: "Gerente de Farmácia",
    location: "Chattanooga, EUA",
    company: "ADC Solutions USA",
    salary: "US$ 112 mil a US$ 197 mil (Anual)",
    badge: "TEMPO TOTAL",
  },

  /* 🔹 +20 VAGAS */
  {
    title: "Desenvolvedor Frontend",
    location: "Remoto",
    company: "Cloud UI",
    salary: "AOA 600.000",
  },
  {
    title: "Desenvolvedor Backend",
    location: "Luanda, Angola",
    company: "TechNova",
    salary: "AOA 750.000",
    badge: "TEMPO TOTAL",
  },
  {
    title: "Engenheiro de Software",
    location: "Califórnia, EUA",
    company: "MetaSoft",
    salary: "US$ 120 mil (Anual)",
  },
  {
    title: "Designer UX/UI",
    location: "Remoto",
    company: "DesignPro",
    salary: "AOA 500.000",
  },
  {
    title: "Analista de Sistemas",
    location: "Luanda, Angola",
    company: "Unitel",
    salary: "AOA 680.000",
  },
  {
    title: "Analista de Dados",
    location: "Remoto",
    company: "DataMind",
    salary: "US$ 110 mil (Anual)",
  },
  {
    title: "Cientista de Dados",
    location: "EUA",
    company: "AI Labs",
    salary: "US$ 140 mil (Anual)",
  },
  {
    title: "Técnico de Suporte TI",
    location: "Luanda, Angola",
    company: "HelpDesk+",
    salary: "AOA 220.000",
  },
  {
    title: "Administrador de Redes",
    location: "Benguela, Angola",
    company: "NetSecure",
    salary: "AOA 400.000",
  },
  {
    title: "Especialista em Marketing Digital",
    location: "Remoto",
    company: "MarketNow",
    salary: "AOA 350.000",
  },
  {
    title: "Gestor de Conteúdo",
    location: "Luanda, Angola",
    company: "MediaHub",
    salary: "AOA 300.000",
  },
  {
    title: "Consultor Financeiro",
    location: "Luanda, Angola",
    company: "FinTrust",
    salary: "AOA 900.000",
    badge: "TEMPO TOTAL",
  },
  {
    title: "Auditor Interno",
    location: "Luanda, Angola",
    company: "AuditPro",
    salary: "AOA 850.000",
  },
  {
    title: "Product Manager",
    location: "Remoto",
    company: "SaaS Corp",
    salary: "US$ 135 mil (Anual)",
  },
  {
    title: "QA Engineer",
    location: "Remoto",
    company: "Testify",
    salary: "AOA 700.000",
  },
  {
    title: "DevOps Engineer",
    location: "Seattle, EUA",
    company: "CloudOps",
    salary: "US$ 130 mil (Anual)",
  },
  {
    title: "Administrador de Banco de Dados",
    location: "Luanda, Angola",
    company: "DB Masters",
    salary: "AOA 780.000",
  },
  {
    title: "Analista de Segurança",
    location: "Remoto",
    company: "CyberSafe",
    salary: "US$ 115 mil (Anual)",
  },
];

/* ================= COMPONENT ================= */

export default function JobList() {
  return (
    <div className="w-full  bg-white  p-4 md:p-6 space-y-5">
      {/* 🔍 Search */}
      <div className="relative py-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Pesquisar por cargos e habilidades"
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* 💼 LISTA RESPONSIVA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job, index) => (
          <JobCard key={index} {...job} />
        ))}
      </div>

      {/* 📄 Pagination */}
      <div className="flex flex-wrap gap-2 items-center justify-between pt-3">
        <button className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm text-gray-600 hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex gap-1 items-center">
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`w-8 h-8 rounded-md text-sm font-medium ${
                page === 1
                  ? "bg-green-700 text-white"
                  : "border text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-gray-400">…</span>
          <span className="text-sm text-green-700 font-semibold">157.010</span>
        </div>

        <button className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm text-gray-600 hover:bg-gray-100">
          Próximo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ================= CARD ================= */

function JobCard({
  title,
  location,
  company,
  salary,
  badge,
}: {
  title: string;
  location: string;
  company: string;
  salary: string;
  badge?: string;
}) {
  return (
   <div className="flex gap-3 border border-gray-300/60 rounded-lg p-3 hover:shadow-sm transition">

      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100">
        <Building2 className="w-5 h-5 text-gray-500" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {title}
          </h3>

          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {company}
          </span>
        </div>

        <p className="text-xs text-gray-700">
          <span className="font-medium">Salário:</span> {salary}
        </p>
      </div>
    </div>
  );
}
