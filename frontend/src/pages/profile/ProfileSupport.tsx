import { useState, useRef, useEffect } from 'react';
import { Plus, Send, ChevronRight, MessageCircle, Clock, CheckCircle, X, Image, Loader2, Phone, Mail, MessageSquare, ArrowLeft, Paperclip, PlayCircle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Message {
  sender: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
}

interface Ticket {
  _id: string;
  subject: string;
  content: string;
  status: 'open' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  open:        { label: 'Đang chờ',      color: 'bg-blue-100 text-blue-700',   icon: Clock },
  processing:  { label: 'Đang xử lý',   color: 'bg-amber-100 text-amber-700', icon: MessageCircle },
  resolved:    { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed:      { label: 'Đã đóng',       color: 'bg-gray-100 text-gray-500',   icon: X },
};

const TOPICS = [
  'Lỗi sản phẩm / Bảo hành',
  'Đổi trả hàng',
  'Vấn đề vận chuyển / Giao hàng',
  'Thanh toán / Hoàn tiền',
  'Tài khoản & Đăng nhập',
  'Tư vấn sản phẩm',
  'Khác',
];

const NewTicketModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [form, setForm] = useState({ topic: '', subject: '', desc: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);

  const canSubmit = form.topic && form.subject && form.desc;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/support', {
        subject: `[${form.topic}] ${form.subject}`,
        content: form.desc,
        priority: form.priority
      });
      toast.success('Gửi yêu cầu thành công');
      onCreated();
      onClose();
    } catch (err) {
      toast.error('Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Tạo yêu cầu hỗ trợ mới</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Chủ đề yêu cầu *</label>
            <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">-- Chọn chủ đề --</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tiêu đề *</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Mô tả ngắn gọn vấn đề của bạn..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Độ ưu tiên</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.priority === p ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-100 text-gray-500'}`}>
                  {p === 'low' ? 'Thấp' : p === 'medium' ? 'Vừa' : 'Cao'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mô tả chi tiết *</label>
            <textarea rows={4} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Vui lòng mô tả chi tiết vấn đề, bao gồm mã đơn hàng nếu có..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Huỷ</button>
          <button
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<any>(null);
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
          // Check if message already exists to avoid duplicates
          const exists = prev.messages.some(m => m.createdAt === msg.createdAt && m.sender._id === msg.sender._id);
          if (exists) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
      };

      socketRef.current.on('new_message', handleNewMessage);
      return () => {
        socketRef.current.off('new_message', handleNewMessage);
      };
    }
  }, [selectedId]);

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

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support/my');
      setTickets(data);
    } catch (err) {
      toast.error('Lỗi tải yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const fetchDetail = async (id: string) => {
    try {
      const { data } = await api.get(`/support/${id}`);
      setDetail(data);
    } catch (err) {
      toast.error('Lỗi tải chi tiết yêu cầu');
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchSettings();
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

  const handleReply = async () => {
    if ((!reply.trim() && !media) || !selectedId || sending) return;
    setSending(true);
    try {
      await api.post(`/support/${selectedId}/reply`, { 
        content: reply,
        mediaUrl: media?.url,
        mediaType: media?.type
      });
      setReply('');
      setMedia(null);
      // No need to fetchDetail because socket will handle the real-time update
    } catch (err) {
      toast.error('Gửi phản hồi thất bại');
    } finally {
      setSending(false);
    }
  };

  if (selectedId && detail) {
    const cfg = statusConfig[detail.status] || statusConfig.open;
    const StatusIcon = cfg.icon;
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start gap-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors shrink-0 mt-0.5 font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{detail.subject}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.color} uppercase`}>
                <StatusIcon className="w-3 h-3" />{cfg.label}
              </span>
              <span className="text-xs text-gray-400 font-medium">#{detail._id.slice(-6).toUpperCase()}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">Tạo lúc {new Date(detail.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/40 custom-scrollbar">
          {/* Initial content */}
          <div className="flex justify-end">
            <div className="max-w-[85%] flex flex-col items-end">
              <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Tôi</p>
              <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm shadow-primary-100">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{detail.content}</p>
                <p className="text-[10px] mt-2 opacity-70 font-bold">{new Date(detail.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          {detail.messages.slice(1).map((msg, i) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === user?.id;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mr-3 mt-4 overflow-hidden">
                    {msg.sender?.avatar ? (
                      <img src={`${BACKEND}${msg.sender.avatar}`} className="w-full h-full object-cover" alt="" />
                    ) : 'CS'}
                  </div>
                )}
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase">{isMe ? 'Tôi' : 'CSKH TechStore'}</p>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-primary-600 text-white rounded-tr-sm shadow-sm shadow-primary-100' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    {msg.mediaUrl && (
                      <div className="mb-2 max-w-xs overflow-hidden rounded-lg cursor-pointer">
                        {msg.mediaType === 'video' ? (
                          <video src={`${BACKEND}${msg.mediaUrl}`} controls className="w-full max-h-60" />
                        ) : (
                          <img src={`${BACKEND}${msg.mediaUrl}`} alt="Attachment" className="w-full object-cover max-h-60" onClick={() => window.open(`${BACKEND}${msg.mediaUrl}`, '_blank')} />
                        )}
                      </div>
                    )}
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">{new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}

          {detail.status === 'resolved' && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-tight">
                <CheckCircle className="w-3.5 h-3.5" /> Yêu cầu đã được giải quyết
              </div>
            </div>
          )}
        </div>

        {/* Reply box */}
        {['open', 'processing'].includes(detail.status) && (
          <div className="border-t border-gray-100 p-4 bg-white">
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

            <div className="flex items-end gap-3 bg-gray-50 rounded-2xl p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/10 transition-all border border-transparent focus-within:border-primary-100">
              <label className="p-2 text-gray-400 hover:text-primary-600 cursor-pointer transition-colors shrink-0">
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
              </label>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="Nhập phản hồi của bạn..."
                rows={2}
                className="flex-1 bg-transparent border-none rounded-xl px-3 py-2 text-sm focus:ring-0 outline-none resize-none font-medium"
              />
              <button
                onClick={handleReply}
                disabled={(!reply.trim() && !media) || sending || uploading}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 text-white rounded-xl transition-all flex items-center justify-center shrink-0 shadow-lg shadow-primary-200"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Hỗ trợ khách hàng</h2>
          <p className="text-sm text-gray-500 mt-1">Gửi yêu cầu hỗ trợ và trao đổi trực tiếp với nhân viên TechStore</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-primary-100 active:scale-95">
          <Plus className="w-5 h-5" /> Tạo yêu cầu mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, title: 'Hotline miễn phí', desc: settings?.phone || '1800 6868', sub: 'Hỗ trợ 24/7', color: 'bg-red-50 text-red-600' },
          { icon: Mail, title: 'Email hỗ trợ', desc: settings?.email || 'hotro@techstore.vn', sub: 'Phản hồi trong 24h', color: 'bg-blue-50 text-blue-600' },
          { icon: MessageSquare, title: 'Zalo / Messenger', desc: 'TechStore Vietnam', sub: 'Phản hồi nhanh', color: 'bg-primary-50 text-primary-600' },
        ].map(card => (
          <div key={card.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{card.title}</p>
              <p className="text-sm text-primary-600 font-extrabold mt-0.5 truncate" title={card.desc}>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-gray-900">Yêu cầu của tôi</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tickets.length} Yêu cầu</span>
        </div>
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" /></div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-gray-200" />
            </div>
            <p className="font-bold text-gray-400">Bạn chưa có yêu cầu hỗ trợ nào</p>
            <button onClick={() => setShowNew(true)} className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-extrabold underline underline-offset-4">Tạo yêu cầu ngay</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map(ticket => {
              const cfg = statusConfig[ticket.status] || statusConfig.open;
              const StatusIcon = cfg.icon;
              return (
                <button key={ticket._id} onClick={() => setSelectedId(ticket._id)} className="w-full text-left px-6 py-5 hover:bg-gray-50/70 transition-all flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cfg.color.replace('text-', 'bg-').replace('700', '50')} ${cfg.color}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      <span>#{ticket._id.slice(-6).toUpperCase()}</span>
                      <span className="opacity-30">|</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="opacity-30">|</span>
                      <span className={ticket.priority === 'high' ? 'text-red-500' : 'text-gray-400'}>Ưu tiên {ticket.priority === 'high' ? 'Cao' : ticket.priority === 'medium' ? 'Vừa' : 'Thấp'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-tighter ${cfg.color} ${cfg.color.replace('text-', 'bg-').replace('700', '100')}`}>{cfg.label}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={fetchTickets} />}
    </div>
  );
};

export default ProfileSupport;
