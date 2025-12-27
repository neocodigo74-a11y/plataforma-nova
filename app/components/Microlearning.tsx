"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Star, Filter, Search, Award, BarChart3 } from 'lucide-react';

// Dados fictícios para a listagem
const COURSES = [
  {
    id: 1,
    title: "Product Design Avançado",
    category: "Design",
    duration: "4h 20min",
    rating: 4.9,
    progress: 65,
    lessons: 12,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=400&h=250&fit=crop",
    level: "Avançado",
    xp: 450
  },
  {
    id: 2,
    title: "Desenvolvimento Next.js 14",
    category: "Dev",
    duration: "6h 45min",
    rating: 5.0,
    progress: 10,
    lessons: 24,
    image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=250&fit=crop",
    level: "Especialista",
    xp: 800
  },
  {
    id: 3,
    title: "Estratégia de Growth",
    category: "Business",
    duration: "3h 15min",
    rating: 4.7,
    progress: 100,
    lessons: 8,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    level: "Intermediário",
    xp: 300
  }
];

const CATEGORIES = ["Todos", "Dev", "Design", "Business", "Marketing"];

export default function MicrolearningList() {
  const [filter, setFilter] = useState("Todos");

  return (
    <div className="space-y-8 pb-20">
      {/* Search & Filter Header */}
      <section className="sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 border-b border-zinc-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="O que você quer aprender hoje?" 
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filter === cat ? "bg-black text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section (O que continuar assistindo) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-red-600" />
            Continuar de onde parou
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.filter(c => c.progress > 0 && c.progress < 100).map((course) => (
            <CourseCard key={course.id} course={course} layout="compact" />
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-black tracking-tight">Trilhas de Conhecimento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} layout="full" />
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course, layout }: { course: typeof COURSES[0], layout: 'full' | 'compact' }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <Play fill="currentColor" size={20} />
          </div>
        </div>
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-black uppercase tracking-widest text-zinc-800">
          {course.level}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{course.category}</span>
          <div className="flex items-center gap-1 text-xs font-bold">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            {course.rating}
          </div>
        </div>

        <h3 className="font-bold text-zinc-900 leading-tight group-hover:text-red-600 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-medium">
          <span className="flex items-center gap-1"><Clock size={12}/> {course.duration}</span>
          <span className="flex items-center gap-1"><Award size={12}/> {course.xp} XP</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase">
            <span>Progresso</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-red-600'}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}