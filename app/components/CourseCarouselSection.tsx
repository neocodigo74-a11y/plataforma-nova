import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { Course } from './AllSkillsSections'; // interface do curso

interface CourseCarouselSectionProps {
  title: string;
  courses: Course[];
  tags: string[];
  activeTag: string;
  onCourseSelect: (course: Course) => void;
}

export default function CourseCarouselSection({
  title,
  courses,
  tags,
  activeTag,
  onCourseSelect,
}: CourseCarouselSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTabIndex = tags.indexOf(activeTag);

  const cardWidthWithGap = 330 + 24; // Largura do card + gap
  const totalDots = courses.length;

  const checkScrollPosition = () => {
    if (!carouselRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const newIndex = Math.round(scrollLeft / cardWidthWithGap);
    setActiveIndex(newIndex);

    setCanScrollLeft(scrollLeft > 50);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 50);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    carouselRef.current.scrollBy({
      left: direction === 'left' ? -cardWidthWithGap : cardWidthWithGap,
      behavior: 'smooth',
    });
    setTimeout(checkScrollPosition, 350);
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [courses]);

  return (
    <div className="bg-white pt-8 pb-10">
      {/* Título */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <a
          href="#"
          className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap"
        >
          Editar meta
        </a>
      </div>

      {/* Tags */}
      <div className="flex space-x-2 overflow-x-auto pb-4 mb-8 hide-scrollbar border-b border-gray-100">
        {tags.map((tag, index) => (
          <button
            key={tag}
            className={`flex-shrink-0 px-4 py-1.5 text-sm transition-colors duration-200 rounded-full ${
              index === activeTabIndex
                ? 'bg-gray-800 text-white font-bold'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-200 font-medium'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Carrossel */}
      <div className="relative">
        {/* Setas */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Anterior"
          className="hidden lg:flex absolute top-1/2 -left-6 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-lg z-10 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Container de cards */}
        <div
          ref={carouselRef}
          onScroll={checkScrollPosition}
          className="flex space-x-6 overflow-x-scroll pb-2 scroll-smooth hide-scrollbar snap-x px-2"
        >
          {courses
            .filter(course => activeTag === 'Todos' || course.tags.includes(activeTag))
            .map((course: Course) => (
              <div key={course.id} className="flex-shrink-0 w-[300px] sm:w-[330px] snap-start">
                {/* Converte rating para string */}
                <CourseCard
                  course={{ ...course, rating: String(course.rating) }}
                  onClick={() => onCourseSelect(course)}
                />
              </div>
            ))}
        </div>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Próximo"
          className="hidden lg:flex absolute top-1/2 -right-6 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-lg z-10 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Indicadores de slide */}
      <div className="flex justify-center space-x-1 mt-4">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div
            key={i}
            onClick={() => {
              if (!carouselRef.current) return;
              carouselRef.current.scrollTo({
                left: i * cardWidthWithGap,
                behavior: 'smooth',
              });
              setTimeout(checkScrollPosition, 350);
            }}
            className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 ${
              i === activeIndex ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
