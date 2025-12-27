import { ArrowRight, Zap, Rocket, BookOpen, Eye, Code, Layers } from 'lucide-react';
import Image from 'next/image';

// --- Paleta de Cores Modo Claro (Odoo Padrão) ---
const BACKGROUND_COLOR = 'bg-white';      // Fundo Principal Claro
const SURFACE_COLOR = 'bg-white';        // Cor de Fundo dos Cards
const TEXT_COLOR = 'text-gray-900';      // Cor do Texto Principal (Escuro)
const MUTED_TEXT_COLOR = 'text-gray-600';// Cor do Texto Secundário (Cinza)

// Odoo Blue Mantido 
const ODOO_BLUE = 'bg-blue-600';
const ODOO_HOVER_BLUE = 'hover:bg-blue-700';
const ODOO_TEXT_BLUE = 'text-blue-600'; // Azul primário Odoo
const ODOO_PRIMARY_BUTTON = 'bg-blue-600 text-white font-semibold py-3 px-6 rounded shadow-md transition duration-150';

// Dados do Card (Mantidos)
const apiCards = [
  {
    initial: 'N',
    name: 'NASA Public API (UAT)',
    description: 'Allows testing of our vendor-facing API in a secure and isolated environment',
    author: 'NASA Public API',
    forks: '6',
    views: '8',
    color: 'bg-teal-600', 
    icon: <Code className="w-4 h-4 text-white" />,
  },
  {
    initial: 'W',
    name: 'wolkvox APIs',
    description: 'APIs seguras de wolkvox para integrar sus productos y servicios. Automatiza la gestión, reportes,...',
    author: 'By wolkvox-API',
    forks: '100+',
    views: '112',
    color: ODOO_BLUE, 
    icon: <Layers className="w-4 h-4 text-white" />,
  },
  {
    initial: <Image src="/congress-logo.svg" alt="Congress Logo" width={24} height={24} className="rounded-full" />,
    name: 'Congress.gov API',
    description: 'Acesse dados legislativos do Congresso dos EUA.',
    author: 'By Ryan Parker',
    forks: '40+',
    views: '50',
    color: 'bg-white',
    icon: <Zap className="w-4 h-4 text-white" />,
  },
];

const AstronautImage = ({ className }) => (
  <div className={`relative w-[150px] h-[150px] md:w-[250px] md:h-[250px] ${className}`}>
    <Rocket className="absolute top-0 right-0 w-8 h-8 text-blue-600 rotate-45" /> 
    <Image
      src="/jovens.png" 
      alt="Grupo de jovens sorrindo"
      priority
      layout="fill"
      objectFit="cover"
      className="rounded-xl" 
    />
  </div>
);

// --- Componente do Card de API (Modo Claro) ---
const ApiCard = ({ initial, name, description, author, forks, views, color, icon }) => (
  <div className={`${SURFACE_COLOR} p-6 border border-gray-200 rounded-lg flex flex-col justify-between hover:shadow-lg transition duration-300`}>
    <div>
      <div className="flex items-start mb-4">
        {typeof initial === 'string' ? (
          <div className={`${color} w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md`}>
            {initial}
          </div>
        ) : (
          <div className={`w-10 h-10 mr-4 rounded ${SURFACE_COLOR}`}>{initial}</div>
        )}
        <h3 className={`${TEXT_COLOR} font-semibold text-lg leading-snug`}>{name}</h3> 
      </div>
      
      <p className={`${MUTED_TEXT_COLOR} text-sm mb-4 h-10 overflow-hidden line-clamp-2`}>
        {description}
      </p>
      
      <p className={`text-gray-500 text-xs mb-4 border-t border-gray-200 pt-4`}> 
        {author}
      </p>
    </div>

    <div className={`flex items-center text-gray-500 text-xs space-x-6`}>
      <div className="flex items-center">
        <BookOpen className="w-4 h-4 mr-1 text-blue-400" />
        <span>{forks} Forks</span>
      </div>
      <div className="flex items-center">
        <Eye className="w-4 h-4 mr-1 text-blue-400" />
        <span>{views} Views</span>
      </div>
    </div>
  </div>
);

// --- Componente Principal (Fundo Branco) ---
const CommunityComponent = () => {
  return (
    <div className={`${BACKGROUND_COLOR} min-h-screen`}> 
      {/* ALTERAÇÃO AQUI: Aumentando a largura máxima para 2xl (1536px) */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* 1. Banner de Destaque */}
        <div className="bg-blue-50 rounded-xl p-10 mb-16 flex flex-col md:flex-row items-center justify-between shadow-sm border border-blue-100">
          <div className="max-w-lg">
            <p className={`text-sm font-bold ${ODOO_TEXT_BLUE} uppercase mb-2`}>PUBLISH</p> 
            <h2 className={`text-4xl font-extrabold ${TEXT_COLOR} mb-4 leading-tight`}>
              Launch, Distribute, <br /> and Grow Your API
            </h2>
            <p className={`${MUTED_TEXT_COLOR} text-lg mb-8`}>
              Ship your API to millions of developers, onboard them quickly, with fewer errors, and drive sustained adoption with actionable...
            </p>
            <button className={`${ODOO_PRIMARY_BUTTON} ${ODOO_HOVER_BLUE}`}>
              Learn More
            </button>
          </div>
          <div className="mt-10 md:mt-0">
            <AstronautImage className="md:ml-12" />
            <div className="flex justify-center mt-6 space-x-2">
              <div className={`w-3 h-3 ${ODOO_BLUE} rounded-full`}></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div> 
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 2. Título da Comunidade */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4"> 
          <div>
            <h2 className={`text-3xl font-bold ${TEXT_COLOR}`}>
              Popular on the Postman Community today
            </h2>
            <p className={`${MUTED_TEXT_COLOR} mt-2 text-base`}>
              Discover what's new and popular on the Postman API Network!
            </p>
          </div>
          <a href="#" className={`flex items-center ${ODOO_TEXT_BLUE} font-bold text-base hover:text-blue-800 transition duration-150`}>
            View all 
            <ArrowRight className="w-5 h-5 ml-1" />
          </a>
        </div>

        {/* 3. Cards de API */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {apiCards.map((card, index) => (
            <ApiCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityComponent;