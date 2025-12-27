import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronRight, ChevronLeft, Eye } from 'lucide-react';

// =======================================================
// 1. DADOS MOCKUP (Fielmente baseados nas imagens)
// =======================================================


const courseraPlusCourses = [
    { id: 5, provider: 'Google', title: 'Planejamento de projetos: Como fazer tudo junto', type: 'Curso',   image: '/jovens.jpg', hasTrial: true },
    { id: 6, provider: 'Microsoft', title: 'Gerenciamento de projetos da Microsoft: Desenvolver habilidades prontas para o trabalho', type: 'Certificado profissional', image: 'https://images.unsplash.com/photo-1616405234509-d75d710f22f7?fit=crop&w=600&q=80', hasTrial: true, tags: ["habilidades de IA"] },
    { id: 7, provider: 'Universidade Northeastern', title: 'Gerenciamento de projetos de engenharia - Parte 2', type: 'Curso',   image: '/jovens.jpg', isVisualized: true },
    { id: 8, provider: 'IBM', title: 'Gerente de Projetos IBM', type: 'Certificado profissional', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?fit=crop&w=600&q=80', hasTrial: true },
];

const careerCourses = [
    { id: 9, provider: 'Coursera', title: 'Gerenciamento de dados e aprendizado de máquina para gerentes técnicos de...', type: 'Curso',   image: '/jovens.jpg', isVisualized: true },
    { id: 10, provider: 'Duke University', title: 'Gerenciamento de projetos de aprendizado de máquina', type: 'Certificado profissional',   image: '/jovens.jpg', hasTrial: true },
    { id: 11, provider: 'Google Cloud', title: 'Gerenciando projetos de aprendizado de máquina com o Google Cloud', type: 'Certificado profissional',   image: '/jovens.jpg', hasTrial: true },
    { id: 12, provider: 'Universidade de Londres', title: 'Aprendizado de máquina para todos', type: 'Curso',   image: '/jovens.jpg', isVisualized: true },
];



// =======================================================
// 3. GridCourseCard (Para Grids)
// =======================================================

function GridCourseCard({ course }) {
    
    // Tags (Teste gratuito / Visualizar)
    const TagComponent = () => {
        if (course.hasTrial) {
            return (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium text-white bg-black bg-opacity-60 rounded-full">
                    Teste gratuito
                </span>
            );
        }
        if (course.isVisualized) {
            return (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium text-white bg-black bg-opacity-60 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3"/> Visualizar
                </span>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow flex flex-col">
            <div className="relative h-28 rounded-md overflow-hidden mb-3">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${course.image})` }}
                />
                <TagComponent />
                {/* Tag Extra para habilidades de IA, se houver */}
                {course.tags && course.tags.includes("habilidades de IA") && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium text-white bg-black bg-opacity-60 rounded-full">
                        habilidades de IA
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">{course.provider}</p>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-grow">{course.title}</h3>
            <p className="text-xs text-blue-600 mt-1">
                {course.type}
            </p>
        </div>
    );
}

// =======================================================
// 4. CourseCarouselSection (Para Carrossel)
// =======================================================
// Nota: O estilo 'hide-scrollbar' deve ser definido no seu CSS global.

function CourseCarouselSection({ title, courses, tags, activeTag }) {
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0); 
    
    const activeTabIndex = tags.indexOf(activeTag);
    // Ajustado para refletir o número de cards visíveis no desktop/large screen
    const cardWidthWithGap = 330 + 24; 
    const cardsPerView = 3; 
    const totalDots = Math.max(0, courses.length - (cardsPerView - 1));

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
                <div 
                    ref={carouselRef}
                    onScroll={checkScrollPosition} 
                    className="flex space-x-6 overflow-x-scroll pb-2 scroll-smooth hide-scrollbar snap-x"
                >
                    {courses.map((course) => ( 
                        <div key={course.id} className="flex-shrink-0 w-[300px] sm:w-[330px] snap-start"> 
                            <CourseCard course={course} />
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

            {/* Indicadores de Slide (bolinhas) - Fiel à imagem */}
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

// =======================================================
// 5. COMPONENTE PRINCIPAL: CourseSectionsComplete
// =======================================================

export default function CourseSectionsComplete() {
    return (
        <div className="bg-white min-h-screen py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                
                {/* A. SEÇÃO DE HABILIDADES EM DEMANDA (CARROSSEL) */}
        

                {/* B. SEÇÃO DE ASSINATURA (GRID ESTÁTICO) */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                        Explore com uma assinatura do Coursera Plus
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {courseraPlusCourses.map(course => (
                            <GridCourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    <div className="mt-6">
                        <button className="text-sm text-blue-600 font-medium hover:underline">
                            Mostrar mais 8
                        </button>
                    </div>
                </div>

                {/* C. SEÇÃO DE CARREIRA (GRID ESTÁTICO) */}
                 <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Sua carreira em tecnologia: Navegando pelo Aprendizado de Máquina e Gerenciamento de Projetos
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {careerCourses.map(course => (
                            <GridCourseCard key={course.id} course={course} />
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
}