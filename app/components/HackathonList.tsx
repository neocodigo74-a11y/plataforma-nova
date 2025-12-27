// components/HackathonListUnified.js
import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Zap, 
  Code, 
  Search, 
  DollarSign, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

// 1. DADOS MOCKADOS (Com informações adicionais)
const mockHackathons = [
  {
    id: 1,
    name: "AI Innovators Summit",
    date: "10-12 Mar, 2026",
    location: "Online",
    theme: "Machine Learning & Ethics",
    participants: 1200,
    prize: "US$ 10.000 em dinheiro + Créditos Cloud",
    status: "Faltam 6 dias",
    level: "Avançado",
  },
  {
    id: 2,
    name: "Web3 Frontier Challenge",
    date: "25-27 Abr, 2026",
    location: "São Paulo, BR",
    theme: "Decentralized Applications",
    participants: 450,
    prize: "R$ 5.000 em Créditos Cloud e Mentoria",
    status: "Inscrições Abertas",
    level: "Intermediário",
  },
  {
    id: 3,
    name: "Eco-Tech Solutions Jam",
    date: "05-07 Mai, 2026",
    location: "New York, US",
    theme: "Sustainable Technology",
    participants: 800,
    prize: "Mentoria Exclusiva de VCs",
    status: "Vagas Limitadas",
    level: "Básico",
  },
  {
    id: 4,
    name: "Mobile Dev Madness",
    date: "15-17 Jun, 2026",
    location: "Lisboa, PT",
    theme: "React Native & Flutter",
    participants: 300,
    prize: "Viagem paga para Conferência Tech Europeia",
    status: "Esgotado",
    level: "Intermediário",
  },
];

// 2. O Componente de Card (Função Auxiliar)
const HackathonCard = ({ hackathon }) => {
  
  // Lógica para cor do status
  const statusColor = hackathon.status === "Faltam 6 dias" || hackathon.status === "Inscrições Abertas" 
    ? "text-green-700 bg-green-100" 
    : hackathon.status === "Esgotado" 
    ? "text-red-700 bg-red-100" 
    : "text-yellow-700 bg-yellow-100";

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100">
      <div className="p-5 sm:p-6">
        
        {/* Título e Tema */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={hackathon.name}>
          {hackathon.name}
        </h3>
        {/* Status */}
        <p className={`text-sm font-semibold ${statusColor} px-3 py-1 rounded-full w-fit mb-3`}>
          <Clock className="inline w-3 h-3 mr-1 align-sub" />
          {hackathon.status}
        </p>
        <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-4">
          <Zap className="inline w-3 h-3 mr-1 align-sub" />
          {hackathon.theme}
        </p>

        {/* Detalhes (Grid de 2 Colunas) */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-gray-600 text-sm">
          
          {/* Data */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-semibold hidden sm:inline">Data:</span>
            <span>{hackathon.date}</span>
          </div>

          {/* Local */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-semibold hidden sm:inline">Local:</span>
            <span className="truncate">{hackathon.location}</span>
          </div>
          
          {/* PRÊMIOS: Ocupa a linha completa (col-span-2) */}
          <div className="flex items-center space-x-2 col-span-2">
            <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-semibold">Prêmio:</span>
            {/* Usamos truncate para garantir que o texto não quebre em telas pequenas, embora o col-span-2 ajude muito */}
            <span className="font-medium text-green-700 truncate">{hackathon.prize}</span>
          </div>

          {/* Nível */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-semibold hidden sm:inline">Nível:</span>
            <span>{hackathon.level}</span>
          </div>

          {/* Participantes */}
          <div className="flex items-center space-x-2 col-span-2">
            <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-semibold">Participantes:</span>
            <span>{hackathon.participants.toLocaleString()}</span>
          </div>

        </div>

      </div>

      {/* Rodapé com Botão */}
      <div className="p-5 sm:p-6 pt-0">
        <button
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ver Detalhes e Inscrever-se
        </button>
      </div>
    </div>
  );
};

// 3. O Componente Principal (Lista e Layout)
const HackathonListUnified = () => {
  const [hackathons, setHackathons] = React.useState(mockHackathons);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <header className="text-center mb-10">
          <Code className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Calendário de Hackathons
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Encontre o seu próximo desafio de codificação.
          </p>
        </header>

        {/* Barra de Pesquisa/Filtro */}
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por tema, localização ou tecnologia..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Lista de Cards - Layout Responsivo */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map(hackathon => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
        
        {hackathons.length === 0 && (
            <div className="text-center mt-10 p-6 bg-white rounded-lg shadow">
                <p className="text-xl text-gray-600">Nenhum hackathon encontrado.</p>
                <p className="text-sm text-gray-400 mt-2">Tente outra busca ou volte mais tarde.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default HackathonListUnified;