import { useState, useEffect } from 'react';
import { Star, Check, Trash2, Search, MessageSquare, X, XCircle, Loader2 } from 'lucide-react';
import api from '../../config/Axios';
import { toast } from 'react-toastify';
import DeleteConfirmModal from './DeleteConfirmModal';

interface Review {
  _id: string;
  user: { name: string; avatar?: string; email: string };
  product: { name: string; thumbnail?: string };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  reply?: { content: string; repliedAt: string };
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt',  color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối',   color: 'bg-red-100 text-red-700' },
};

const StarRow = ({ n }: { n: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
  </div>
);

/* ─── Reply Modal ─── */
const ReplyModal = ({ review, onClose, onUpdate }: { review: Review; onClose: () => void; onUpdate: (r: Review) => void }) => {
  const [text, setText] = useState(review.reply?.content ?? '');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/reviews/admin/${review._id}/reply`, { content: text });
      toast.success('Đã gửi phản hồi');
      onUpdate(data);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi phản hồi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Trả lời đánh giá</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">{review.user?.name}</span>
              <StarRow n={review.rating} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nội dung trả lời *</label>
            <textarea
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Nhập phản hồi của shop đến khách hàng..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Huỷ</button>
          <button 
            disabled={!text.trim() || loading} 
            onClick={handleSend} 
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            Gửi trả lời
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ─── */
const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews/admin/all', {
        params: { status: filter, search }
      });
      setReviews(data);
    } catch (err) {
      console.error('Fetch reviews failed', err);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter, search]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { data } = await api.patch(`/reviews/admin/${id}/status`, { status: newStatus });
      setReviews(prev => prev.map(r => r._id === id ? data : r));
      toast.success(newStatus === 'approved' ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/reviews/admin/${deleteTarget._id}`);
      setReviews(prev => prev.filter(r => r._id !== deleteTarget._id));
      toast.success('Đã xoá đánh giá');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    }
  };

  const onUpdate = (updated: Review) => {
    setReviews(prev => prev.map(r => r._id === updated._id ? updated : r));
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Quản lý đánh giá</h1>
        <p className="text-sm text-gray-500 mt-0.5">{reviews.length} đánh giá được tìm thấy</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filter === s ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {s === 'all' ? 'Tất cả' : statusMap[s]?.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Tìm theo user, sản phẩm..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
          />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p className="font-medium">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            Không có đánh giá nào phù hợp.
          </div>
        ) : (
          reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:border-primary-100 transition-all">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {r.user?.name?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900">{r.user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          về <span className="text-primary-600 font-semibold">{r.product?.name}</span> · {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${statusMap[r.status]?.color}`}>
                        {statusMap[r.status]?.label}
                      </span>
                    </div>
                    <div className="mt-2"><StarRow n={r.rating} /></div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>
                  </div>
                </div>

                {/* Shop reply */}
                {r.reply && (
                  <div className="mt-3 ml-14 bg-primary-50/50 border border-primary-100/50 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-primary-600 mb-1 uppercase tracking-tight">💬 Phản hồi từ Shop</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.reply.content}</p>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex-wrap">
                {r.status !== 'approved' && (
                  <button onClick={() => handleStatusUpdate(r._id, 'approved')}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-green-700 hover:bg-green-100 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg transition-all">
                    <Check className="w-3.5 h-3.5" /> Duyệt
                  </button>
                )}
                <button onClick={() => setReplyTarget(r)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all">
                  <MessageSquare className="w-3.5 h-3.5" /> {r.reply ? 'Sửa trả lời' : 'Trả lời'}
                </button>
                {r.status === 'pending' && (
                  <button onClick={() => handleStatusUpdate(r._id, 'rejected')}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-orange-700 hover:bg-orange-100 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg transition-all">
                    <XCircle className="w-3.5 h-3.5" /> Từ chối
                  </button>
                )}
                <button onClick={() => setDeleteTarget(r)}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all ml-auto opacity-40 hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" /> Xoá
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {replyTarget && <ReplyModal review={replyTarget} onClose={() => setReplyTarget(null)} onUpdate={onUpdate} />}
      {deleteTarget && (
        <DeleteConfirmModal 
          title="Xóa đánh giá" 
          message={`Xác nhận xóa đánh giá của "${deleteTarget.user?.name}"?`} 
          onConfirm={handleDelete} 
          onClose={() => setDeleteTarget(null)} 
        />
      )}
    </div>
  );
};

export default AdminReviews;
