// components/FeedPostList.jsx (VERSÃO OTIMIZADA PARA DESKTOP)

import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

// ... (mockFeedPosts permanece o mesmo) ...
const mockFeedPosts = [
  {
    id: 1,
    author: 'Dev Júnior',
    handle: '@dev_junior',
    avatarUrl: '/avatars/junior.jpg',
    content: 'Acabei de finalizar meu primeiro componente de listagem de posts com Next.js e Tailwind! A responsividade ficou impecável. 🚀 #NextJS #TailwindCSS',
    time: '2 horas atrás',
    likes: 125,
    comments: 18,
    reposts: 42,
  },
  {
    id: 2,
    author: 'Tech Guru',
    handle: '@tech_guru',
    avatarUrl: '/avatars/guru.jpg',
    content: 'O novo recurso de Server Components do Next.js está mudando o jogo para a performance. Menos JavaScript no cliente = melhor UX. Você já testou?',
    time: '5 horas atrás',
    likes: 890,
    comments: 110,
    reposts: 250,
  },
  {
    id: 3,
    author: 'CSS Expert',
    handle: '@css_expert',
    avatarUrl: '/avatars/expert.jpg',
    content: 'Lucide React é uma benção! Leve, configurável e com ícones que se ajustam perfeitamente ao meu design. ✨',
    time: '1 dia atrás',
    likes: 45,
    comments: 5,
    reposts: 10,
  },
  {
    id: 4,
    author: 'Fullstack Dev',
    handle: '@fullstack_dev',
    avatarUrl: '/avatars/fullstack.jpg',
    content: 'Hoje aprendi sobre Tailwind Grid e como fazer layouts responsivos facilmente. Muito intuitivo! 💡',
    time: '3 dias atrás',
    likes: 200,
    comments: 30,
    reposts: 50,
  },
  {
    id: 5,
    author: 'React Ninja',
    handle: '@react_ninja',
    avatarUrl: '/avatars/react.jpg',
    content: 'Hooks são incríveis, mas useEffect ainda me confunde às vezes. Alguém mais passa por isso? 😅',
    time: '4 dias atrás',
    likes: 150,
    comments: 25,
    reposts: 35,
  },
  {
    id: 6,
    author: 'Node Master',
    handle: '@node_master',
    avatarUrl: '/avatars/node.jpg',
    content: 'Implementando API RESTful com Node.js e Express. Backend nunca foi tão divertido! 🚀',
    time: '5 dias atrás',
    likes: 300,
    comments: 45,
    reposts: 60,
  },
  {
    id: 7,
    author: 'Frontend Wizard',
    handle: '@frontend_wizard',
    avatarUrl: '/avatars/frontend.jpg',
    content: 'CSS Grid + Flexbox = layouts mágicos! Aprendi truques novos hoje. 🪄',
    time: '6 dias atrás',
    likes: 120,
    comments: 15,
    reposts: 20,
  },
  {
    id: 8,
    author: 'UX Designer',
    handle: '@ux_designer',
    avatarUrl: '/avatars/ux.jpg',
    content: 'Design responsivo não é só para telas pequenas, é para todos os dispositivos. Pense mobile-first! 📱',
    time: '1 semana atrás',
    likes: 95,
    comments: 12,
    reposts: 8,
  },
  {
    id: 9,
    author: 'AI Enthusiast',
    handle: '@ai_enthusiast',
    avatarUrl: '/avatars/ai.jpg',
    content: 'Explorando OpenAI e como GPT pode melhorar a produtividade no desenvolvimento. Inteligência artificial é o futuro! 🤖',
    time: '1 semana atrás',
    likes: 400,
    comments: 50,
    reposts: 80,
  },
  {
    id: 10,
    author: 'Data Geek',
    handle: '@data_geek',
    avatarUrl: '/avatars/data.jpg',
    content: 'Visualizando dados com D3.js nunca foi tão divertido! Gráficos interativos são incríveis. 📊',
    time: '2 semanas atrás',
    likes: 220,
    comments: 20,
    reposts: 40,
  },
];



const FeedPost = ({ post }) => {
  const InteractionButton = ({ Icon, count, color = 'text-gray-500' }) => (
    <button className={`flex items-center text-sm ${color} hover:text-indigo-600 transition duration-150`}>
      <Icon className="w-4 h-4 mr-1" />
      <span>{count > 0 ? count : ''}</span>
    </button>
  );

  return (
    // Aumentamos o padding horizontal em desktop (lg:px-6) para dar mais "respiro"
    <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200 bg-white hover:bg-gray-50 transition duration-200">
      <div className="flex justify-between items-start">
        <div className="flex">
          {/* Avatar: Mantemos o tamanho, mas podemos adicionar um pouco mais de margem em desktop */}
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex-shrink-0 mr-3 lg:mr-4">
             {/* Placeholder para Avatar */}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              {/* O tamanho da fonte do nome do autor pode ser ligeiramente maior em desktop */}
              <Link href={`/user/${post.handle}`} className="font-bold text-gray-900 hover:underline truncate lg:text-lg">
                {post.author}
              </Link>
              <span className="text-gray-500 text-sm ml-1 truncate">
                {post.handle} · {post.time}
              </span>
            </div>

            {/* Conteúdo: Garante que o texto fique bem legível */}
            <p className="text-gray-800 mb-3 text-base lg:text-[17px] whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 ml-2">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Barra de Interações: Alinhamento ajustado para desktop */}
      <div className="flex justify-between items-center pl-10 lg:pl-14 mt-1">
        <InteractionButton Icon={MessageCircle} count={post.comments} />
        <InteractionButton Icon={Repeat2} count={post.reposts} color="text-green-600" />
        <InteractionButton Icon={Heart} count={post.likes} color="text-red-600" />
        <InteractionButton Icon={Share2} count={0} />
      </div>
    </div>
  );
};


export default function FeedPostList({ posts = mockFeedPosts }) {
  return (
    <section className="bg-gray-100 sm:pt-6 w-full">

      {/* Cabeçalho do Feed */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <h2 className="text-xl font-bold text-gray-900">
          Feed Principal
        </h2>
      </div>

      {/* MOBILE = lista | DESKTOP = grid */}
      <div
        className="
          w-full
          flex flex-col
          lg:grid lg:grid-cols-3
          lg:gap-4
          lg:p-4
        "
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="
              border-b border-gray-200
              lg:border lg:rounded-lg lg:shadow-sm
              lg:hover:shadow-md lg:transition
            "
          >
            <FeedPost post={post} />
          </div>
        ))}
      </div>

      {/* Fim da lista */}
      <div className="p-4 text-center text-gray-500 border-t border-gray-200 w-full">
        <p>Fim da Linha (ou Carregando mais posts...)</p>
      </div>

    </section>
  );
}

