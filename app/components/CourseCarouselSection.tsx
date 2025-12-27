// src/components/CourseCarouselSection.jsx
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react'; 
import CourseCard from './CourseCard'; // Importa o Card

export default function CourseCarouselSection({ title, courses, tags, activeTag,  onCourseSelect, }) {
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0); 
    
    const activeTabIndex = tags.indexOf(activeTag);

    // Configurações do Carrossel (ajustar esta largura se mudar o w-[330px] no card)
    const cardWidthWithGap = 330 + 24; 
    const cardsPerView = 3; 
   const totalDots = courses.length; // Uma bolinha para cada curso é o padrão mais intuitivo para o usuário

    const checkScrollPosition = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            
            // 1. Atualiza o Active Index (Bolinhas)
            const newIndex = Math.round(scrollLeft / cardWidthWithGap);
            setActiveIndex(newIndex);

            // 2. Atualiza Setas
            setCanScrollLeft(scrollLeft > 50); 
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 50);
        }
    };
    
    const scroll = (direction) => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -cardWidthWithGap : cardWidthWithGap,
                behavior: 'smooth',
            });
            setTimeout(checkScrollPosition, 350); 
        }
    };

    useEffect(() => {
        checkScrollPosition();
        window.addEventListener('resize', checkScrollPosition);
        return () => window.removeEventListener('resize', checkScrollPosition);
    }, [courses]);


    return (
        <div className="bg-white pt-8 pb-10"> 
            {/* Título da Seção */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                    {title}
                </h1>
                <a href="#" className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap">
                    Editar meta
                </a>
            </div>

            {/* 📋 Barra de Habilidades (Tags) */}
            <div className="flex space-x-2 overflow-x-auto pb-4 mb-8 hide-scrollbar border-b border-gray-100">
                {tags.map((tag, index) => (
                    <button
                        key={tag}
                        className={`
                            flex-shrink-0 px-4 py-1.5 text-sm transition-colors duration-200 rounded-full
                            ${index === activeTabIndex
                                ? 'bg-gray-800 text-white font-bold'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-200 font-medium'
                            }
                        `}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* 🖼️ Layout de Cards: Carrossel Responsivo */}
            <div className="relative">

                {/* Setas (Apenas Desktop) */}
                <button
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft}
                    aria-label="Anterior"
                    className={`
                        hidden lg:flex absolute top-1/2 -left-6 transform -translate-y-1/2 p-2 
                        bg-white rounded-full shadow-lg z-10 border border-gray-200 
                        hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                {/* Container de Rolagem (Carrossel) */}
              {/* Container de Rolagem (Carrossel) */}
<div 
    ref={carouselRef}
    onScroll={checkScrollPosition} 
    className="flex space-x-6 overflow-x-scroll pb-2 scroll-smooth hide-scrollbar snap-x px-2"
>
    {courses
      .filter(course => activeTag === "Todos" || course.tags.includes(activeTag))
      .map((course) => (
        <div key={course.id} className="flex-shrink-0 w-[300px] sm:w-[330px] snap-start">
            <CourseCard
                course={course}
                onClick={() => onCourseSelect(course)}
            />
        </div>
    ))}
</div>

                <button
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight}
                    aria-label="Próximo"
                    className={`
                        hidden lg:flex absolute top-1/2 -right-6 transform -translate-y-1/2 p-2 
                        bg-white rounded-full shadow-lg z-10 border border-gray-200 
                        hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            {/* Indicadores de Slide (bolinhas) - Visível em todas as telas */}
            <div className="flex justify-center space-x-1 mt-4">
                {Array.from({ length: totalDots }).map((_, i) => ( 
                    <div 
                        key={i} 
                        onClick={() => {
                            if (carouselRef.current) {
                                carouselRef.current.scrollTo({
                                    left: i * cardWidthWithGap,
                                    behavior: 'smooth',
                                });
                                setTimeout(checkScrollPosition, 350); 
                            }
                        }}
                        className={`
                            w-2 h-2 rounded-full cursor-pointer transition-colors duration-300
                            ${i === activeIndex ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'}
                        `}
                    />
                ))}
            </div>
        </div>
    );
}

// Lembre-se de adicionar este estilo em seu CSS global:
/*
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
*/