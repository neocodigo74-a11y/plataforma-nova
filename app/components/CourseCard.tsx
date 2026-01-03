"use client";

import { Star, ChevronRight, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { SkillItem } from "./AllSkillsSections";

interface CourseCardProps {
  course: SkillItem & {
    slug?: string;
  };
  onClick: () => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const router = useRouter();

  const gerarSlugTemporario = (title?: string) => {
    if (!title) return "curso-sem-titulo";
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleClick = () => {
    const slug = course.slug || gerarSlugTemporario(course.title);
    router.push(`/cursos/${slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Imagem */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={course.image}
          alt={course.title || "Curso"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {course.isRecommended && (
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 bg-blue-600 text-[10px] uppercase tracking-wider font-bold text-white rounded-full shadow-lg">
              Recomendado
            </span>
          </div>
        )}
        <button className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-blue-600 transition-colors shadow-sm">
          <Bookmark size={16} />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Provider */}
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
          {course.provider}
        </span>

        {/* Título */}
        <h3 className="text-md font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {course.title || "Curso sem título"}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {course.description}
        </p>

        {/* Avaliação (somente para cursos) */}
        {course.type === "curso" && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span className="ml-1 text-sm font-bold text-gray-700">
                {course.rating ?? "0"}
              </span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {course.reviews ?? "Sem avaliações"}
            </span>
          </div>
        )}

        {/* Microaprendizado: duração + perguntas */}
        {course.type === "micro" && (
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            {course.durationMin && <span>⏱ {course.durationMin} min</span>}
            {course.questionsCount && <span>❓ {course.questionsCount} perguntas</span>}
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-sm font-bold text-green-600">Gratuito</span>
          <button
            className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Ver detalhes
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
