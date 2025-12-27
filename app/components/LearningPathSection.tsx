// src/components/LearningPathSection.jsx

import CourseCarouselSection from './CourseCarouselSection'; 
// Importe seu componente de carrossel criado na etapa anterior.

// --- Dados Mockup Baseados nas Imagens ---

// Dados da Seção 1: Habilidades em demanda para cargos em IT Project Manager
const projectManagerCourses = [
    { id: 1, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c7c7?fit=crop&w=600&q=80', isRecommended: true, provider: 'IBM', title: 'Gerente de Projetos de TI da IBM', description: 'Habilidades que você deve possuir: Gerenciamento de Projetos, Ciclo de Vida do Gerenciamento de Projetos, Líder...', rating: 4.7, reviews: '1,2 mil avaliações', details: 'Básico · Certificado profissional (11 cursos) · 4 meses', source: 'Vários educadores', recommendedText: 'Por que isso é recomendado?' },
    { id: 2, image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?fit=crop&w=600&q=80', isRecommended: false, provider: 'IBM', title: 'Gerente de Projetos da IBM', description: 'Habilidades que você deve possuir: Gerenciamento de Projetos, Ciclo de Vida do Gerenciamento de Projetos, ...', rating: 4.8, reviews: '1,8 mil avaliações', details: 'Básico · Certificado profissional (8 cursos) · 3 meses', source: 'Vários educadores', recommendedText: null },
    { id: 3, image: 'https://images.unsplash.com/photo-1543269865-cbf4273295a0?fit=crop&w=600&q=80', isRecommended: false, provider: 'Google', title: 'Gerenciamento de Projetos com Google [corte]', description: 'Habilidades que deve possuir: Gerenciamento de Projetos, Gerenciamento de Equipe, ...', rating: 4.9, reviews: '126 mil avaliações', details: 'Básico · Certificado profissional', source: null, recommendedText: null },
    // Adicionar mais itens para habilitar o scroll do carrossel:
    { id: 4, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?fit=crop&w=600&q=80', isRecommended: false, provider: 'Coursera', title: 'Certificação Profissional em Agile', description: 'Aprenda as ferramentas e técnicas de Scrum e Kanban para otimizar fluxos de trabalho...', rating: 4.6, reviews: '89 mil avaliações', details: 'Intermediário · Certificado · 2 meses', source: 'University', recommendedText: null },
];
const projectManagerTags = ["Todos", "Gerenciamento de projetos", "Metodologia Ágil", "Liderança", "Comunicação", "Resolução de Problemas"];


// Dados da Seção 2: Explorar com uma assinatura Coursera Plus (Grid Estática - Exemplo)
// Nota: Esta seção não usa o carrossel, mas sim um grid simples de 4 colunas como visto na imagem.
const courseraPlusCourses = [
    { id: 5, provider: 'Google', title: 'Planejamento de projetos: Como fazer tudo junto', type: 'Curso', image: 'https://images.unsplash.com/photo-1620392938183-f617b43c6d71?fit=crop&w=600&q=80' },
    { id: 6, provider: 'Microsoft', title: 'Gerenciamento de projetos da Microsoft: Desenvolver habilidades prontas para o trabalho', type: 'Certificado profissional', image: 'https://images.unsplash.com/photo-1616405234509-d75d710f22f7?fit=crop&w=600&q=80' },
    { id: 7, provider: 'Universidade Northeastern', title: 'Gerenciamento de projetos de engenharia - Parte 2', type: 'Curso', image: 'https://images.unsplash.com/photo-1517430816045-cd33da26d400?fit=crop&w=600&q=80' },
    { id: 8, provider: 'IBM', title: 'Gerente de Projetos IBM', type: 'Certificado profissional', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?fit=crop&w=600&q=80' },
];

const GridCourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
        <div className="relative h-28 rounded-md overflow-hidden mb-3">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium text-white bg-black bg-opacity-60 rounded-full">
                Test gratuito
            </span>
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">{course.provider}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
        <p className="text-xs text-blue-600 mt-1">{course.type}</p>
    </div>
);


// --- Componente de Seção Principal ---

export default function LearningPathSection() {
    return (
        <div className="bg-gray-50 min-h-screen py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                
                {/* 1. SEÇÃO DE HABILIDADES EM DEMANDA (CARROSSEL) */}
                <CourseCarouselSection 
                    title="Habilidades em demanda para cargos em IT Project Manager"
                    courses={projectManagerCourses}
                    tags={projectManagerTags}
                    activeTag="Todos"
                />

                {/* 2. SEÇÃO DE ASSINATURA (GRID ESTÁTICO) */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Explore com uma assinatura do Coursera Plus
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

                {/* 3. SEÇÃO DE CARREIRA (SEM DADOS COMPLETOS NAS IMAGENS, APENAS TÍTULO) */}
                 <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Sua carreira em tecnologia: Navegando pelo Aprendizado de Máquina e Gerenciamento de Projetos
                    </h2>
                    {/* Aqui entraria outro componente de carrossel ou grid com a série de cursos inferiores */}
                 </div>
            </div>
        </div>
    );
}