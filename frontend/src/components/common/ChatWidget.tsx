import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Store, Image, Loader2, Maximize2, Minimize2, Paperclip, PlayCircle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/* ─── Types ─── */
interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
}

interface Conversation {
  _id: string;
  messages: Message[];
}

const AI_RESPONSES: Record<string, string> = {
  default: 'Xin chào! Tôi là trợ lý AI của TechStore. Tôi có thể giúp bạn tư vấn sản phẩm, so sánh cấu hình, hay giải đáp thắc mắc về đơn hàng. Bạn cần hỗ trợ gì ạ?',
  laptop: 'Với nhu cầu của bạn, tôi gợi ý dòng laptop gaming ASUS ROG hoặc MSI. Nếu bạn làm đồ họa, Dell XPS hay MacBook Pro sẽ phù hợp hơn. Bạn muốn tôi so sánh chi tiết không?',
  giá: 'Tôi có thể giúp bạn tìm sản phẩm trong ngưỡng giá mong muốn. Bạn có thể cho tôi biết budget của bạn là bao nhiêu không ạ?',
  ram: 'RAM khuyến nghị cho gaming là 16GB DDR5. Nếu dùng đồ họa nặng, 32GB sẽ tốt hơn. TechStore đang có RAM Corsair 32GB giảm 15%!',
  bảo: 'Tất cả sản phẩm tại TechStore đều có bảo hành chính hãng 12-24 tháng. Laptop thường 24 tháng, phụ kiện 12 tháng.',
  ship: 'TechStore giao hàng nhanh 2 giờ nội thành HCM & Hà Nội. Miễn phí ship đơn từ 300.000₫!',
  đổi: 'Chính sách đổi trả 7 ngày nếu sản phẩm lỗi kỹ thuật. Sản phẩm phải còn nguyên hộp và phụ kiện đầy đủ.',
};

const getAIReply = (text: string): string => {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return AI_RESPONSES.default;
};

/* ─── Chat bubble component ─── */
const Bubble = ({ msg, isMe }: { msg: any; isMe: boolean }) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isMe && (
        msg.sender?.avatar ? (
          <img src={`${BACKEND}${msg.sender.avatar}`} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 shadow-sm border border-white" alt="" />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 ${msg.sender?.role === 'bot' ? 'bg-violet-600 text-white' : 'bg-primary-600 text-white'}`}>
            {msg.sender?.role === 'bot' ? <Bot className="w-4 h-4" /> : 'CS'}
          </div>
        )
      )}
      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
          {msg.mediaUrl && (
            <div className="mb-2 max-w-[200px] overflow-hidden rounded-lg cursor-pointer">
              {msg.mediaType === 'video' ? (
                <video src={`${BACKEND}${msg.mediaUrl}`} controls className="w-full max-h-40" />
              ) : (
                <img src={`${BACKEND}${msg.mediaUrl}`} alt="Attachment" className="w-full object-cover max-h-40" onClick={() => window.open(`${BACKEND}${msg.mediaUrl}`, '_blank')} />
              )}
            </div>
          )}
          {msg.content}
        </div>
        <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-tight">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'shop' | 'ai'>('shop');
  const [conv, setConv] = useState<Conversation | null>(null);
  const [aiMsgs, setAiMsgs] = useState<any[]>([
    { _id: 'a1', sender: { role: 'bot' }, content: AI_RESPONSES.default, createdAt: new Date().toISOString() }
  ]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Init socket only when open and tab is shop
  useEffect(() => {
    if (open && tab === 'shop' && isAuthenticated) {
      socketRef.current = io(BACKEND);
      
      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [open, tab, isAuthenticated]);

  useEffect(() => {
    if (conv && socketRef.current) {
      socketRef.current.emit('join_room', conv._id);
      
      const handleNewMessage = (msg: Message) => {
        setConv(prev => {
          if (!prev) return prev;
          const exists = prev.messages.some(m => m._id === msg._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
      };

      socketRef.current.on('new_message', handleNewMessage);
      return () => {
        socketRef.current.off('new_message', handleNewMessage);
      };
    }
  }, [conv?._id]);

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

  const fetchMyChat = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/chat/my');
      setConv(data);
    } catch (err) {
      console.error('Failed to fetch chat');
    }
  };

  useEffect(() => {
    if (open && tab === 'shop' && isAuthenticated) {
      fetchMyChat();
    }
  }, [open, tab, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages, aiMsgs, typing]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    if (tab === 'ai') {
      const userMsg = { _id: Date.now().toString(), sender: { _id: 'me', role: 'user' }, content: text, createdAt: new Date().toISOString() };
      setAiMsgs(prev => [...prev, userMsg]);
      const replyText = getAIReply(text);
      setText('');
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setAiMsgs(prev => [...prev, { _id: Date.now() + 'bot', sender: { role: 'bot' }, content: replyText, createdAt: new Date().toISOString() }]);
      }, 1000);
      return;
    }

    if (!isAuthenticated) return toast.info('Vui lòng đăng nhập để chat với shop');
    if (!conv) return;

    setSending(true);
    try {
      await api.post(`/chat/${conv._id}/send`, { 
        content: text,
        mediaUrl: media?.url,
        mediaType: media?.type
      });
      setText('');
      setMedia(null);
    } catch (err) {
      toast.error('Gửi tin nhắn thất bại');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
      </button>

      {open && (
        <div className={`fixed right-5 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${expanded ? 'w-96 h-[600px]' : 'w-80 h-[480px]'}`} style={{ bottom: '85px' }}>
          {/* Header */}
          <div className="bg-primary-600 p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Store className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-sm leading-none">TechStore Chat</p>
                  <p className="text-[10px] text-primary-100 mt-1 font-bold uppercase tracking-wider">● Đang hoạt động</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setExpanded(!expanded)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">{expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex bg-black/10 p-1 rounded-xl">
              <button onClick={() => setTab('shop')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold rounded-lg transition-all ${tab === 'shop' ? 'bg-white text-primary-600 shadow-sm' : 'text-primary-100 hover:text-white'}`}><Store className="w-3 h-3" /> CHAT VỚI SHOP</button>
              <button onClick={() => setTab('ai')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold rounded-lg transition-all ${tab === 'ai' ? 'bg-white text-primary-600 shadow-sm' : 'text-primary-100 hover:text-white'}`}><Bot className="w-3 h-3" /> AI TƯ VẤN</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50 custom-scrollbar">
            {!isAuthenticated && tab === 'shop' ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4"><MessageCircle className="w-8 h-8 text-gray-300" /></div>
                <p className="text-sm font-bold text-gray-900">Vui lòng đăng nhập</p>
                <p className="text-xs text-gray-500 mt-1">Bạn cần đăng nhập để trao đổi trực tiếp với nhân viên cửa hàng.</p>
              </div>
            ) : (
              (tab === 'shop' ? conv?.messages : aiMsgs)?.map(msg => {
                const senderId = msg.sender?._id || msg.sender;
                const isMe = senderId === user?.id || senderId === 'me';
                return <Bubble key={msg._id} msg={msg} isMe={isMe} />;
              })
            )}
            {typing && (
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1"><Bot className="w-4 h-4" /></div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            {/* Media Preview */}
            {media && (
              <div className="mb-2 flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl relative group w-fit">
                {media.type === 'video' ? (
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white"><PlayCircle className="w-4 h-4" /></div>
                ) : (
                  <img src={`${BACKEND}${media.url}`} className="w-12 h-12 object-cover rounded-lg" />
                )}
                <button onClick={() => setMedia(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/10 transition-all border border-transparent focus-within:border-primary-100">
              <label className="p-1.5 text-gray-400 hover:text-primary-600 cursor-pointer transition-colors shrink-0">
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Nhập tin nhắn..."
                rows={1}
                className="flex-1 bg-transparent border-none rounded-xl px-3 py-1.5 text-sm focus:ring-0 outline-none resize-none font-medium max-h-24"
              />
              <button
                onClick={handleSend}
                disabled={(!text.trim() && !media) || sending || uploading}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-xl transition-all flex items-center justify-center shrink-0 shadow-lg shadow-primary-200"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
