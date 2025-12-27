"use client";

import { Star, ChevronRight, Bookmark } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Container da Imagem */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay Gradiente para legibilidade do Badge */}
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
        {/* Fornecedor / Provider */}
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
          {course.provider}
        </span>

        <h3 className="text-md font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Rating e Tags */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center text-yellow-500">
            <Star size={14} fill="currentColor" />
            <span className="ml-1 text-sm font-bold text-gray-700">{course.rating || "4.8"}</span>
          </div>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{course.reviews || "120 avaliações"}</span>
        </div>

        {/* Rodapé / Botão */}
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