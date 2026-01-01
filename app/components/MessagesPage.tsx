"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/pt-br';
import { LucideUser, LucideUsers, LucideSearch } from "lucide-react";
import ChatPage from "./ChatPage"; // ✅ Importa o ChatPage

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface ChatItem {
  tipo: 'privado' | 'grupo';
  contatoId?: string;
  id?: string;
  nome: string;
  foto?: string | null;
  ultimaMensagem: string;
  dataUltimaMensagem: string;
  naoLidas: number;
}

const useChatData = (userId: string | null) => {
  const [itensChat, setItensChat] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversasEGrupos = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: mensagensPrivadas } = await supabase
        .from('mensagens_privadas')
        .select('remetente_id, destinatario_id, conteudo, img_url, created_at, visualizado')
        .or(`remetente_id.eq.${userId},destinatario_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      const contatosMap = new Map<string, ChatItem>();
      mensagensPrivadas?.forEach(msg => {
        const contatoId = msg.remetente_id === userId ? msg.destinatario_id : msg.remetente_id;
        if (!contatosMap.has(contatoId)) {
          contatosMap.set(contatoId, {
            tipo: 'privado',
            contatoId,
            nome: '',
            foto: null,
            ultimaMensagem: msg.conteudo || (msg.img_url ? '📷 Imagem' : ''),
            dataUltimaMensagem: msg.created_at,
            naoLidas: 0,
          });
        }
        if (msg.destinatario_id === userId && !msg.visualizado) {
          contatosMap.get(contatoId)!.naoLidas += 1;
        }
      });

      const { data: perfis } = await supabase
        .from('usuarios')
        .select('id, nome, foto_perfil')
        .in('id', Array.from(contatosMap.keys()));

      const conversas = perfis?.map(p => ({
        ...contatosMap.get(p.id)!,
        nome: p.nome,
        foto: p.foto_perfil
      })) || [];

      setItensChat(conversas.sort(
        (a, b) => new Date(b.dataUltimaMensagem).getTime() - new Date(a.dataUltimaMensagem).getTime()
      ));
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchConversasEGrupos();
  }, [userId]);

  return { itensChat, loading, fetchConversasEGrupos };
};

const MessagesPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatAbertoId, setChatAbertoId] = useState<string | null>(null); // ✅ id da conversa selecionada
  const { itensChat, loading } = useChatData(userId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  const filtrarItensChat = useMemo(() => {
    if (!searchQuery) return itensChat;
    const q = searchQuery.toLowerCase();
    return itensChat.filter(i => 
      i.nome.toLowerCase().includes(q) || i.ultimaMensagem.toLowerCase().includes(q)
    );
  }, [itensChat, searchQuery]);

  const formatarTempo = (data: string) => {
    if (!data || data === new Date(0).toISOString()) return '';
    return dayjs(data).fromNow(true);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Carregando...</div>;

  // ✅ Se uma conversa estiver aberta, renderiza o ChatPage
  if (chatAbertoId) {
    return <ChatPage userId={userId} contatoId={chatAbertoId} onBack={() => setChatAbertoId(null)} />;
  }

  return (
    <div className="p-4 py-9 max-w-2xl mx-auto">
      <div className="flex items-center bg-gray-100 rounded-full p-2 mb-4">
        <LucideSearch className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          className="flex-1 bg-transparent outline-none"
          placeholder="Buscar conversa ou grupo"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <ul className="divide-y divide-gray-200">
        {filtrarItensChat.map(item => (
          <li
            key={item.tipo === 'grupo' ? `grupo-${item.id}` : `privado-${item.contatoId}`}
            className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => setChatAbertoId(item.contatoId!)} // abre ChatPage
          >
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              {item.tipo === 'grupo' ? <LucideUsers /> : item.foto ? <img src={item.foto} className="w-12 h-12 rounded-full object-cover" /> : <LucideUser />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{item.nome}</p>
              <p className={`text-sm text-gray-500 truncate ${item.naoLidas > 0 ? 'font-bold text-gray-700' : ''}`}>{item.ultimaMensagem}</p>
            </div>
            <div className="text-xs text-gray-400 ml-2">
              {formatarTempo(item.dataUltimaMensagem)}
              {item.naoLidas > 0 && item.tipo === 'privado' && (
                <span className="ml-2 bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.naoLidas}</span>
              )}
            </div>
          </li>
        ))}
        {filtrarItensChat.length === 0 && (
          <li className="text-center text-gray-400 py-4">Nenhuma conversa encontrada.</li>
        )}
      </ul>
    </div>
  );
};

export default MessagesPage;
