import { useState, useEffect, useRef } from 'react';
import { Send, Search, Circle, Loader2, Paperclip, PlayCircle, X } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface User {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface Message {
  _id: string;
  sender: User;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: {
    sender: string;
    content?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: string;
  };
  messages: Message[];
  updatedAt: string;
}

const AdminChat = () => {
  const { user: admin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Init socket
  useEffect(() => {
    socketRef.current = io(BACKEND);
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedId && socketRef.current) {
      socketRef.current.emit('join_room', selectedId);
      
      const handleNewMessage = (msg: Message) => {
        setDetail(prev => {
          if (!prev) return prev;
          const exists = prev.messages.some(m => m._id === msg._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
        // Update unread in list
        setConversations(prev => prev.map(c => {
          if (c._id === selectedId) {
            const exists = c.messages.some(m => m._id === msg._id);
            return { 
              ...c, 
              messages: exists ? c.messages : [...c.messages, msg],
              lastMessage: { ...msg, sender: typeof msg.sender === 'string' ? msg.sender : msg.sender._id } 
            };
          }
          return c;
        }));
      };

      socketRef.current.on('new_message', handleNewMessage);
      return () => {
        socketRef.current.off('new_message', handleNewMessage);
      };
    }
  }, [selectedId]);

  useEffect(() => {
    if (socketRef.current) {
      const handleAdminNewMessage = ({ conversationId, message }: any) => {
        setConversations(prev => {
          const conv = prev.find(c => c._id === conversationId);
          if (!conv) return prev; // If not in list, maybe it's new (handled by new_conversation)
          
          // Move to top and update last message
          const otherConvs = prev.filter(c => c._id !== conversationId);
          const updatedConv = { 
            ...conv, 
            lastMessage: message,
            messages: conv.messages.some(m => m._id === message._id) ? conv.messages : [...conv.messages, message]
          };
          return [updatedConv, ...otherConvs];
        });
        
        if (conversationId !== selectedId) {
          toast.info(`Tin nhắn mới từ ${message.sender?.name || 'Khách hàng'}`);
        }
      };

      const handleNewConversation = (conv: any) => {
        setConversations(prev => {
          if (prev.some(c => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        toast.success(`Hội thoại mới bắt đầu!`);
      };

      socketRef.current.on('admin_new_message', handleAdminNewMessage);
      socketRef.current.on('new_conversation', handleNewConversation);
      
      return () => {
        socketRef.current.off('admin_new_message', handleAdminNewMessage);
        socketRef.current.off('new_conversation', handleNewConversation);
      };
    }
  }, [selectedId]); // Re-bind when selectedId changes for the toast logic

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMedia(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/admin/all');
      setConversations(data);
    } catch (err) {
      toast.error('Lỗi tải danh sách hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: string) => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      setDetail(data);
      // Locally update unread status in list
      setConversations(prev => prev.map(c => c._id === id ? { ...c, messages: data.messages } : c));
    } catch (err) {
      toast.error('Lỗi tải chi tiết tin nhắn');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [detail?.messages]);

  const handleSend = async () => {
    if ((!input.trim() && !media) || !selectedId || sending) return;
    setSending(true);
    try {
      await api.post(`/chat/${selectedId}/send`, { 
        content: input,
        mediaUrl: media?.url,
        mediaType: media?.type
      });
      setInput('');
      setMedia(null);
    } catch (err) {
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(c => {
    const other = c.participants.find(p => p._id !== admin?._id);
    return other?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 h-[calc(100vh-56px)] flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tin nhắn</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý chat trực tuyến với khách hàng</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex min-h-0">
        {/* Conversation list */}
        <div className="w-80 border-r border-gray-100 flex flex-col shrink-0 bg-gray-50/20">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Tìm khách hàng..." 
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">Chưa có hội thoại nào</div>
            ) : filtered.map(c => {
              const other = c.participants.find(p => p._id !== admin?.id);
              const unreadCount = c.messages.filter(m => {
                const sId = m.sender?._id || m.sender;
                return sId !== admin?.id && !m.isRead;
              }).length;
              return (
                <button
                  key={c._id}
                  onClick={() => setSelectedId(c._id)}
                  className={`w-full flex items-center gap-4 p-4 text-left hover:bg-white transition-all border-l-4 ${selectedId === c._id ? 'bg-white border-primary-500 shadow-sm' : 'border-transparent'}`}
                >
                  <div className="relative shrink-0">
                    {other?.avatar ? (
                      <img src={`${BACKEND}${other.avatar}`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-sm uppercase">
                        {other?.name.slice(0, 2)}
                      </div>
                    )}
                    <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-green-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-900 text-sm truncate">{c.participants.find(p => p._id !== admin?.id)?.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                      {c.lastMessage?.content || 'Bắt đầu trò chuyện...'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-primary-100">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {detail ? (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {detail.participants.find(p => p._id !== admin?.id)?.avatar ? (
                      <img src={`${BACKEND}${detail.participants.find(p => p._id !== admin?.id)?.avatar}`} className="w-10 h-10 rounded-2xl object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-xs uppercase">
                        {detail.participants.find(p => p._id !== admin?.id)?.name.slice(0, 2)}
                      </div>
                    )}
                    <Circle className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-green-500 fill-green-500 border-2 border-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900">{detail.participants.find(p => p._id !== admin?.id)?.name}</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Đang trực tuyến</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 custom-scrollbar">
                {detail.messages.map((m, i) => {
                  const senderId = m.sender?._id || m.sender;
                  const isMe = senderId === admin?.id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-sm shadow-primary-50' : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'}`}>
                        {m.mediaUrl && (
                          <div className="mb-2 max-w-xs overflow-hidden rounded-lg cursor-pointer">
                            {m.mediaType === 'video' ? (
                              <video src={`${BACKEND}${m.mediaUrl}`} controls className="w-full max-h-60" />
                            ) : (
                              <img src={`${BACKEND}${m.mediaUrl}`} alt="Attachment" className="w-full object-cover max-h-60" onClick={() => window.open(`${BACKEND}${m.mediaUrl}`, '_blank')} />
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
                        <p className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <span className="ml-1 opacity-60">✓✓</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-5 border-t border-gray-100 bg-white">
                {/* Media Preview */}
                {media && (
                  <div className="mb-3 flex items-center gap-3 p-2 bg-gray-50 rounded-xl relative group w-fit">
                    {media.type === 'video' ? (
                      <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center text-white"><PlayCircle /></div>
                    ) : (
                      <img src={`${BACKEND}${media.url}`} className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <button onClick={() => setMedia(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-2xl border border-transparent focus-within:border-primary-100 focus-within:bg-white transition-all">
                  <label className="p-2 text-gray-400 hover:text-primary-600 cursor-pointer transition-colors shrink-0">
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  </label>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Nhập tin nhắn tại đây..."
                    className="flex-1 bg-transparent border-none rounded-xl px-4 py-2 text-sm focus:ring-0 outline-none font-medium"
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={(!input.trim() && !media) || sending || uploading}
                    className="w-11 h-11 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shrink-0 shadow-lg shadow-primary-200 active:scale-95"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-200 bg-gray-50/10">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-6">
                <Send className="w-10 h-10 text-gray-300 -rotate-12" />
              </div>
              <h3 className="text-gray-900 font-black text-xl">Chào mừng trở lại!</h3>
              <p className="text-gray-400 text-sm mt-1 font-medium">Chọn một cuộc trò chuyện để bắt đầu trả lời khách hàng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
