import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Upload, Plus, Trash2, X, Star,
  ChevronDown, ChevronRight, Check, Tag, Package, Loader2, AlertCircle,
} from 'lucide-react';
import api from '../../config/Axios';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getUrl = (u: string) => u ? (u.startsWith('http') ? u : `${BACKEND}${u}`) : '';

// ─── Types ─────────────────────────────────────────────────────────────────
type ImageItem  = { id: string; url: string; file?: File; isPrimary: boolean; isNew: boolean };
type VideoItem  = { id: string; url: string; file?: File; isNew: boolean };
type SpecItem   = { id: string; key: string; value: string };
type SpecGroup  = { id: string; name: string; items: SpecItem[] };
type Attribute  = { id: string; name: string; values: string[] };
type Serial     = { _id?: string; id: string; code: string; status: 'available'|'sold'|'defective'|'reserved'; note: string };
type Variant    = { _id?: string; id: string; label: string; combo: Record<string,string>; origPrice: string; salePrice: string; sku: string; isDefault: boolean; serials: Serial[] };

const uid = () => Math.random().toString(36).slice(2, 8);

function cartesian(attrs: Attribute[]): Record<string,string>[] {
  const valid = attrs.filter(a => a.values.length > 0);
  if (!valid.length) return [];
  return valid.reduce<Record<string,string>[]>((acc, attr) => {
    if (!acc.length) return attr.values.map(v => ({ [attr.name]: v }));
    return acc.flatMap(combo => attr.values.map(v => ({ ...combo, [attr.name]: v })));
  }, []);
}
function syncVariants(attrs: Attribute[], existing: Variant[]): Variant[] {
  const combos = cartesian(attrs);
  if (!combos.length) return [];
  return combos.map(combo => {
    const label = Object.values(combo).join(' / ');
    return existing.find(v => v.label === label) ?? { id: uid(), label, combo, origPrice: '', salePrice: '', sku: '', isDefault: false, serials: [] };
  });
}

// ─── Shared UI ─────────────────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>{children}</div>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition ${props.className ?? ''}`} />
);
const Card = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h2 className="font-bold text-gray-900">{title}</h2>{action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Serial Table ───────────────────────────────────────────────────────────
const SerialTable = ({ serials, onChange }: { serials: Serial[]; onChange: (s: Serial[]) => void }) => {
  const add = () => onChange([...serials, { id: uid(), code: '', status: 'available', note: '' }]);
  const upd = (i: number, k: keyof Serial, v: string) => onChange(serials.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  const del = (i: number) => onChange(serials.filter((_, idx) => idx !== i));
  const statusOpts: Serial['status'][] = ['available', 'sold', 'defective', 'reserved'];
  const statusLabel = { available: 'Còn hàng', sold: 'Đã bán', defective: 'Lỗi', reserved: 'Đã đặt' };
  const statusColor = { available: 'bg-green-100 text-green-700', sold: 'bg-red-100 text-red-600', defective: 'bg-gray-100 text-gray-500', reserved: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">Serial ({serials.length}) — {serials.filter(s => s.status === 'available').length} còn hàng</p>
        <button onClick={add} className="flex items-center gap-1 text-xs text-primary-600 font-semibold">
          <Plus className="w-3 h-3" /> Thêm serial
        </button>
      </div>
      {serials.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-500">Mã serial</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-500">Trạng thái</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-500">Ghi chú</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {serials.map((s, i) => (
                <tr key={s.id || s._id}>
                  <td className="px-3 py-2">
                    <input value={s.code} onChange={e => upd(i, 'code', e.target.value)} placeholder="VD: SN-ABC123"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-500 outline-none" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select value={s.status} onChange={e => upd(i, 'status', e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer mx-auto ${statusColor[s.status]}`}>
                      {statusOpts.map(o => <option key={o} value={o}>{statusLabel[o]}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input value={s.note} onChange={e => upd(i, 'note', e.target.value)} placeholder="Ghi chú..."
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary-500 outline-none" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => del(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────
const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new' && !!id;

  const { categories } = useCategories(true); // showAll: kể cả category ẩn
  const { brands } = useBrands(true); // showAll: kể cả brand ẩn

  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  // Basic form
  const [form, setForm] = useState({
    name: '', sku: '', slug: '', shortDesc: '', description: '',
    category: '', brand: '', isVisible: true,
    isBestSeller: false, isNew: false, isFeatured: false, isHot: false,
    isSale: false, isGift: false, isExclusive: false, isLimited: false,
    tags: '', sortOrder: 0,
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Auto-slug
  const toSlug = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  const handleName = (v: string) => {
    set('name', v);
    if (!isEdit) set('slug', toSlug(v));
  };

  // Images
  const fileImgRef = useRef<HTMLInputElement>(null);
  const [images, setImages]             = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const newImgs: ImageItem[] = Array.from(files).map((f, i) => ({
      id: uid(), url: URL.createObjectURL(f), file: f,
      isPrimary: images.length === 0 && i === 0, isNew: true,
    }));
    setImages(prev => [...prev, ...newImgs]);
  };
  const setPrimary = (id: string) => setImages(imgs => imgs.map(img => ({ ...img, isPrimary: img.id === id })));
  const removeImage = (img: ImageItem) => {
    if (!img.isNew && img.url) setRemovedImages(prev => [...prev, img.url]);
    setImages(prev => {
      const next = prev.filter(i => i.id !== img.id);
      if (next.length && !next.some(i => i.isPrimary)) next[0].isPrimary = true;
      return next;
    });
  };

  // Videos
  const fileVidRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos]             = useState<VideoItem[]>([]);
  const [removedVideos, setRemovedVideos] = useState<string[]>([]);

  const handleVideos = (files: FileList | null) => {
    if (!files) return;
    const newVids: VideoItem[] = Array.from(files).map(f => ({
      id: uid(), url: URL.createObjectURL(f), file: f, isNew: true,
    }));
    setVideos(prev => [...prev, ...newVids]);
  };
  const removeVideo = (vid: VideoItem) => {
    if (!vid.isNew) setRemovedVideos(prev => [...prev, vid.url]);
    setVideos(prev => prev.filter(v => v.id !== vid.id));
  };

  // Spec groups
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (id: string) => setOpenGroups(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const addGroup = () => { const g: SpecGroup = { id: uid(), name: '', items: [] }; setSpecGroups(s => [...s, g]); setOpenGroups(s => new Set([...s, g.id])); };
  const setGroupName = (gi: number, v: string) => setSpecGroups(gs => gs.map((g, i) => i === gi ? { ...g, name: v } : g));
  const removeGroup = (gi: number) => setSpecGroups(gs => gs.filter((_, i) => i !== gi));
  const addSpecItem = (gi: number) => setSpecGroups(gs => gs.map((g, i) => i === gi ? { ...g, items: [...g.items, { id: uid(), key: '', value: '' }] } : g));
  const setSpecItem = (gi: number, ii: number, k: 'key'|'value', v: string) => setSpecGroups(gs => gs.map((g, i) => i === gi ? { ...g, items: g.items.map((it, j) => j === ii ? { ...it, [k]: v } : it) } : g));
  const removeSpecItem = (gi: number, ii: number) => setSpecGroups(gs => gs.map((g, i) => i === gi ? { ...g, items: g.items.filter((_, j) => j !== ii) } : g));

  // Variants
  const [hasVariants, setHasVariants]       = useState(false);
  const [attributes, setAttributes]         = useState<Attribute[]>([]);
  const [variants, setVariants]             = useState<Variant[]>([]);
  const [expandedVariant, setExpandedVariant] = useState<string|null>(null);
  const [simplePrice, setSimplePrice]       = useState({ orig: '', sale: '' });
  const [simpleSerials, setSimpleSerials]   = useState<Serial[]>([]);
  const [attrInputs, setAttrInputs]         = useState<Record<string,string>>({});

  const addAttribute = () => {
    const attr: Attribute = { id: uid(), name: '', values: [] };
    setAttributes(a => { const next = [...a, attr]; setVariants(v => syncVariants(next, v)); return next; });
  };
  const setAttrName = (i: number, v: string) => setAttributes(a => { const next = a.map((at, idx) => idx === i ? { ...at, name: v } : at); setVariants(vs => syncVariants(next, vs)); return next; });
  const addAttrValue = (i: number) => {
    const raw = attrInputs[attributes[i].id] ?? '';
    if (!raw.trim()) return;
    setAttributes(a => {
      const next = a.map((at, idx) => idx === i && !at.values.includes(raw.trim()) ? { ...at, values: [...at.values, raw.trim()] } : at);
      setVariants(v => syncVariants(next, v));
      setAttrInputs(inp => ({ ...inp, [a[i].id]: '' }));
      return next;
    });
  };
  const removeAttrValue = (i: number, vi: number) => setAttributes(a => { const next = a.map((at, idx) => idx === i ? { ...at, values: at.values.filter((_, j) => j !== vi) } : at); setVariants(v => syncVariants(next, v)); return next; });
  const removeAttribute = (i: number) => setAttributes(a => { const next = a.filter((_, idx) => idx !== i); setVariants(v => syncVariants(next, v)); return next; });
  const setVariantField = useCallback((vid: string, k: 'origPrice'|'salePrice'|'sku', val: string) =>
    setVariants(vs => vs.map(v => v.id === vid ? { ...v, [k]: val } : v)), []);
  const setVariantDefault = (vid: string) => setVariants(vs => vs.map(v => ({ ...v, isDefault: v.id === vid })));
  const setVariantSerials = useCallback((vid: string, serials: Serial[]) =>
    setVariants(vs => vs.map(v => v.id === vid ? { ...v, serials } : v)), []);
  const discount = (orig: string, sale: string) => {
    const o = Number(orig), s = Number(sale);
    if (!o || !s || o <= s) return null;
    return Math.round((1 - s / o) * 100);
  };

  // ── Load existing product ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setForm({
          name: data.name, sku: data.sku, slug: data.slug,
          shortDesc: data.shortDesc || '', description: data.description || '',
          category: data.category?._id || '', brand: data.brand?._id || '',
          isVisible: data.isActive !== false,
          isBestSeller: !!data.isBestSeller, isNew: !!data.isNew,
          isFeatured: !!data.isFeatured, isHot: !!data.isHot,
          isSale: !!data.isSale, isGift: !!data.isGift,
          isExclusive: !!data.isExclusive, isLimited: !!data.isLimited,
          tags: (data.tags || []).join(', '), sortOrder: data.sortOrder || 0,
        });
        setImages((data.images || []).map((url: string, i: number) => ({
          id: uid(), url: getUrl(url), isPrimary: i === 0, isNew: false,
        })));
        setVideos((data.videos || []).map((url: string) => ({ id: uid(), url: getUrl(url), isNew: false })));
        const sg = (data.specGroups || []).map((g: { name: string; items: {key: string; value: string}[] }) => ({
          id: uid(), name: g.name, items: g.items.map((it: {key: string; value: string}) => ({ id: uid(), ...it })),
        }));
        setSpecGroups(sg);
        setOpenGroups(new Set(sg.map((g: SpecGroup) => g.id)));
        setHasVariants(!!data.hasVariants);
        if (data.hasVariants) {
          const attrs: Attribute[] = (data.variantOptions || []).map((o: { name: string; values: string[] }) => ({ id: uid(), name: o.name, values: o.values }));
          setAttributes(attrs);
          setVariants((data.variants || []).map((v: { _id: string; label: string; combo: Record<string,string>; comparePrice: number; price: number; sku: string; isDefault: boolean; serials: Serial[] }) => ({
            _id: v._id, id: uid(), label: v.label, combo: v.combo,
            origPrice: String(v.comparePrice || ''), salePrice: String(v.price || ''),
            sku: v.sku || '', isDefault: !!v.isDefault,
            serials: (v.serials || []).map((s: Serial) => ({ ...s, id: uid() })),
          })));
        } else {
          setSimplePrice({ orig: String(data.comparePrice || ''), sale: String(data.price || '') });
          setSimpleSerials((data.serials || []).map((s: Serial) => ({ ...s, id: uid() })));
        }
      } catch {
        setError('Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [id, isEdit]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { setError('Tên sản phẩm không được trống'); return; }
    if (!form.sku.trim())  { setError('SKU không được trống'); return; }
    if (!form.slug.trim()) { setError('Slug không được trống'); return; }
    setSaving(true); setError('');

    try {
      const payload = {
        name: form.name, slug: form.slug, sku: form.sku,
        shortDesc: form.shortDesc, description: form.description,
        category: form.category || undefined,
        brand: form.brand || undefined,
        hasVariants,
        variantOptions: hasVariants ? attributes.map(a => ({ name: a.name, values: a.values })) : [],
        variants: hasVariants ? variants.map(v => ({
          _id: v._id, label: v.label, combo: v.combo, sku: v.sku,
          price: Number(v.salePrice || 0), comparePrice: Number(v.origPrice || 0),
          isDefault: v.isDefault,
          serials: v.serials.map(s => ({ _id: s._id, code: s.code, status: s.status, note: s.note })),
        })) : [],
        serials: !hasVariants ? simpleSerials.map(s => ({ _id: s._id, code: s.code, status: s.status, note: s.note })) : [],
        price: hasVariants ? 0 : Number(simplePrice.sale || 0),
        comparePrice: hasVariants ? 0 : Number(simplePrice.orig || 0),
        specGroups: specGroups.map(g => ({ name: g.name, items: g.items.map(it => ({ key: it.key, value: it.value })) })),
        isActive: form.isVisible,
        isFeatured: form.isFeatured, isBestSeller: form.isBestSeller,
        isNew: form.isNew, isHot: form.isHot, isSale: form.isSale,
        isGift: form.isGift, isExclusive: form.isExclusive, isLimited: form.isLimited,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        sortOrder: form.sortOrder,
        removedImages, removedVideos,
      };

      const fd = new FormData();
      fd.append('data', JSON.stringify(payload));
      images.filter(i => i.isNew && i.file).forEach(i => fd.append('images', i.file!));
      videos.filter(v => v.isNew && v.file).forEach(v => fd.append('videos', v.file!));

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  const LABEL_BTNS = [
    { key: 'isBestSeller', label: '🔥 Bán chạy',   color: 'orange' },
    { key: 'isNew',        label: '🆕 Hàng mới',   color: 'green'  },
    { key: 'isFeatured',   label: '⭐ Nổi bật',     color: 'yellow' },
    { key: 'isHot',        label: '💥 Hot',          color: 'red'    },
    { key: 'isSale',       label: '🏷️ Khuyến mãi', color: 'violet' },
    { key: 'isGift',       label: '🎁 Tặng quà',   color: 'pink'   },
    { key: 'isExclusive',  label: '💎 Độc quyền',  color: 'blue'   },
    { key: 'isLimited',    label: '⏳ Giới hạn',   color: 'gray'   },
  ] as { key: string; label: string; color: string }[];

  const colorMap: Record<string,string> = {
    orange: 'bg-orange-50 border-orange-400 text-orange-700',
    green:  'bg-green-50 border-green-400 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-400 text-yellow-700',
    red:    'bg-red-50 border-red-400 text-red-700',
    violet: 'bg-violet-50 border-violet-400 text-violet-700',
    pink:   'bg-pink-50 border-pink-400 text-pink-700',
    blue:   'bg-blue-50 border-blue-400 text-blue-700',
    gray:   'bg-gray-100 border-gray-400 text-gray-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/products')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{isEdit ? `SKU: ${form.sku}` : 'Điền thông tin sản phẩm'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/products')} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Huỷ</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Basic */}
          <Card title="Thông tin cơ bản">
            <div className="space-y-4">
              <Field label="Tên sản phẩm *"><Input value={form.name} onChange={e => handleName(e.target.value)} placeholder="Tên sản phẩm..." /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="SKU *"><Input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="ROG-G15" /></Field>
                <Field label="Slug *"><Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="rog-g15" className="font-mono" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Hiển thị">
                  <select value={form.isVisible ? 'yes' : 'no'} onChange={e => set('isVisible', e.target.value === 'yes')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium">
                    <option value="yes" className="text-green-600">Đang hiển thị (Bán)</option>
                    <option value="no" className="text-gray-500">Đang ẩn</option>
                  </select>
                </Field>
                <Field label="Thứ tự"><Input type="number" value={form.sortOrder} onChange={e => set('sortOrder', Number(e.target.value))} /></Field>
              </div>
              <Field label="Mô tả ngắn"><Input value={form.shortDesc} onChange={e => set('shortDesc', e.target.value)} placeholder="Hiển thị ở trang danh sách..." /></Field>
              <Field label="Mô tả chi tiết">
                <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="Mô tả đầy đủ..." />
              </Field>
            </div>
          </Card>

          {/* Images */}
          <Card title="Hình ảnh sản phẩm">
            <input ref={fileImgRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImages(e.target.files)} />
            <div onClick={() => fileImgRef.current?.click()} onDrop={e => { e.preventDefault(); handleImages(e.dataTransfer.files); }} onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-all mb-4">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Kéo thả hoặc <span className="text-primary-600 font-medium">chọn file</span></p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — tối đa 5MB/ảnh, 10 ảnh</p>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map(img => (
                  <div key={img.id} className={`relative group aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${img.isPrimary ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" onClick={() => setPrimary(img.id)} />
                    {img.isPrimary && <div className="absolute top-1 left-1 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center"><Star className="w-2.5 h-2.5 fill-white" /></div>}
                    {!img.isPrimary && <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={() => setPrimary(img.id)}>
                      <span className="text-white text-xs font-semibold bg-black/50 rounded-lg px-2 py-1">Ảnh chính</span>
                    </div>}
                    <button onClick={e => { e.stopPropagation(); removeImage(img); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length > 0 && <p className="text-xs text-gray-400 mt-3">⭐ Click vào ảnh để đặt làm ảnh chính</p>}
          </Card>

          {/* Videos */}
          <Card title="Video sản phẩm">
            <input ref={fileVidRef} type="file" accept="video/*" multiple className="hidden" onChange={e => handleVideos(e.target.files)} />
            <div onClick={() => fileVidRef.current?.click()} onDrop={e => { e.preventDefault(); handleVideos(e.dataTransfer.files); }} onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/20 transition-all mb-4">
              <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Kéo thả video hoặc <span className="text-primary-600 font-medium">chọn file</span></p>
              <p className="text-xs text-gray-400 mt-1">MP4, WEBM, MOV — tối đa 200MB/video, 3 video</p>
            </div>
            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map(vid => (
                  <div key={vid.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <video src={vid.url} className="w-24 h-14 object-cover rounded-lg bg-black" controls />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">{vid.file?.name || vid.url}</p>
                      {vid.file && <p className="text-xs text-gray-400">{(vid.file.size / 1024 / 1024).toFixed(1)} MB</p>}
                    </div>
                    <button onClick={() => removeVideo(vid)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Specs */}
          <Card title="Thông số kỹ thuật" action={
            <button onClick={addGroup} className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
              <Plus className="w-3.5 h-3.5" /> Thêm nhóm
            </button>
          }>
            <div className="space-y-3">
              {specGroups.map((g, gi) => {
                const open = openGroups.has(g.id);
                return (
                  <div key={g.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5">
                      <button onClick={() => toggleGroup(g.id)} className="text-gray-400 hover:text-gray-600">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <input value={g.name} onChange={e => setGroupName(gi, e.target.value)} placeholder="Tên nhóm (VD: Bộ xử lý)"
                        className="flex-1 bg-transparent text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-400 placeholder:font-normal" />
                      <span className="text-xs text-gray-400">{g.items.length} thông số</span>
                      <button onClick={() => removeGroup(gi)} className="text-red-400 hover:text-red-600 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    {open && (
                      <div className="p-4 space-y-2">
                        {g.items.map((it, ii) => (
                          <div key={it.id} className="flex items-center gap-2">
                            <input value={it.key} onChange={e => setSpecItem(gi, ii, 'key', e.target.value)} placeholder="Thuộc tính" className="w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none shrink-0" />
                            <input value={it.value} onChange={e => setSpecItem(gi, ii, 'value', e.target.value)} placeholder="Giá trị" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
                            <button onClick={() => removeSpecItem(gi, ii)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => addSpecItem(gi)} className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold mt-1">
                          <Plus className="w-3 h-3" /> Thêm thông số
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {specGroups.length === 0 && <p className="text-xs text-gray-400 italic">Chưa có nhóm thông số. Nhấn "Thêm nhóm" để bắt đầu.</p>}
            </div>
          </Card>

          {/* Variants / Price */}
          <Card title="Giá & Biến thể">
            <div className="flex gap-3 mb-6 flex-wrap">
              <button onClick={() => { if (attributes.length === 0) { setHasVariants(false); setVariants([]); } }}
                disabled={hasVariants && attributes.length > 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${!hasVariants ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'}`}>
                <Check className={`w-4 h-4 ${!hasVariants ? 'text-primary-600' : 'text-transparent'}`} />
                Không có biến thể
              </button>
              <button onClick={() => setHasVariants(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${hasVariants ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                <Check className={`w-4 h-4 ${hasVariants ? 'text-primary-600' : 'text-transparent'}`} />
                Có biến thể (thuộc tính)
              </button>
            </div>

            {!hasVariants && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Giá gốc"><Input type="number" value={simplePrice.orig} onChange={e => setSimplePrice(p => ({ ...p, orig: e.target.value }))} placeholder="0" /></Field>
                  <Field label="Giá bán *"><Input type="number" value={simplePrice.sale} onChange={e => setSimplePrice(p => ({ ...p, sale: e.target.value }))} placeholder="0" /></Field>
                </div>
                {simplePrice.orig && simplePrice.sale && discount(simplePrice.orig, simplePrice.sale) !== null && (
                  <p className="text-sm text-green-600 font-semibold">Giảm {discount(simplePrice.orig, simplePrice.sale)}%</p>
                )}
                <div className="border-t border-gray-100 pt-5">
                  <SerialTable serials={simpleSerials} onChange={setSimpleSerials} />
                </div>
              </div>
            )}

            {hasVariants && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Thuộc tính</p>
                  <div className="space-y-3">
                    {attributes.map((attr, ai) => (
                      <div key={attr.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <input value={attr.name} onChange={e => setAttrName(ai, e.target.value)} placeholder="Tên thuộc tính (VD: Màu sắc, RAM...)"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-1 focus:ring-primary-500 outline-none" />
                          <button onClick={() => removeAttribute(ai)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attr.values.map((v, vi) => (
                            <span key={vi} className="flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 text-xs font-medium px-2.5 py-1 rounded-xl">
                              {v}<button onClick={() => removeAttrValue(ai, vi)} className="text-primary-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input value={attrInputs[attr.id] ?? ''} onChange={e => setAttrInputs(inp => ({ ...inp, [attr.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addAttrValue(ai)} placeholder="Thêm giá trị rồi nhấn Enter..."
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
                          <button onClick={() => addAttrValue(ai)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Thêm</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={addAttribute} className="mt-3 flex items-center gap-1.5 text-sm text-primary-600 font-semibold">
                    <Plus className="w-4 h-4" /> Thêm thuộc tính
                  </button>
                </div>

                {variants.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Biến thể ({variants.length}) — {variants.reduce((s, v) => s + v.serials.filter(sr => sr.status === 'available').length, 0)} còn hàng
                    </p>
                    <div className="space-y-2">
                      {variants.map(v => {
                        const disc = discount(v.origPrice, v.salePrice);
                        const stockCount = v.serials.filter(s => s.status === 'available').length;
                        const expanded = expandedVariant === v.id;
                        return (
                          <div key={v.id} className={`border rounded-xl overflow-hidden transition-all ${v.isDefault ? 'border-primary-300 shadow-sm' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-3 px-4 py-3 bg-white flex-wrap">
                              <button onClick={() => setVariantDefault(v.id)} title="Đặt mặc định"
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${v.isDefault ? 'border-primary-600 bg-primary-600' : 'border-gray-300 hover:border-primary-400'}`}>
                                {v.isDefault && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                                <Package className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-semibold text-gray-800">{v.label}</span>
                                {v.isDefault && <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">Mặc định</span>}
                              </div>
                              <input value={v.sku} onChange={e => setVariantField(v.id, 'sku', e.target.value)} placeholder="SKU biến thể"
                                className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary-500 outline-none" />
                              <div className="flex items-center gap-2">
                                <input value={v.origPrice} onChange={e => setVariantField(v.id, 'origPrice', e.target.value)} placeholder="Giá gốc" type="number"
                                  className="w-32 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary-500 outline-none text-right" />
                                <input value={v.salePrice} onChange={e => setVariantField(v.id, 'salePrice', e.target.value)} placeholder="Giá bán *" type="number"
                                  className="w-32 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary-500 outline-none text-right font-semibold" />
                                {disc !== null && <span className="text-xs font-bold text-green-600 shrink-0">-{disc}%</span>}
                              </div>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${stockCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {stockCount} serial
                              </span>
                              <button onClick={() => setExpandedVariant(expanded ? null : v.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium shrink-0">
                                Serial {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {expanded && (
                              <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4">
                                <SerialTable serials={v.serials} onChange={serials => setVariantSerials(v.id, serials)} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {variants.length === 0 && attributes.length > 0 && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    Thêm ít nhất một giá trị cho mỗi thuộc tính để tạo biến thể.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right ── */}
        <div className="space-y-6">
          <Card title="Phân loại">
            <div className="space-y-4">
              <Field label="Danh mục *">
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Thương hiệu *">
                <select value={form.brand} onChange={e => set('brand', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </Field>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nhãn sản phẩm</label>
                <div className="flex flex-wrap gap-2">
                  {LABEL_BTNS.map(({ key, label, color }) => {
                    const active = !!(form as Record<string, unknown>)[key];
                    return (
                      <button key={key} type="button" onClick={() => set(key, !active)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-2 transition-all select-none ${active ? colorMap[color] + ' shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tags / Từ khoá</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)}
                  placeholder="gaming, laptop, rtx4080 (cách bằng dấu phẩy)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Giúp tìm kiếm và lọc sản phẩm</p>
              </div>
            </div>
          </Card>

          <Card title="Tóm tắt">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Ảnh</span><span className="font-semibold">{images.length} ảnh</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Video</span><span className="font-semibold">{videos.length} video</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Nhóm thông số</span><span className="font-semibold">{specGroups.length} nhóm</span></div>
              {hasVariants ? (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">Thuộc tính</span><span className="font-semibold">{attributes.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Biến thể</span><span className="font-semibold">{variants.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tổng tồn</span><span className="font-semibold text-green-600">{variants.reduce((s, v) => s + v.serials.filter(sr => sr.status === 'available').length, 0)}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">Giá bán</span><span className="font-bold text-primary-600">{simplePrice.sale ? Number(simplePrice.sale).toLocaleString('vi-VN') + '₫' : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tồn kho</span><span className="font-semibold text-green-600">{simpleSerials.filter(s => s.status === 'available').length}</span></div>
                </>
              )}
            </div>
          </Card>

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEdit;
