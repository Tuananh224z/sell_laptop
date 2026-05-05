import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  country: string;
  website: string;
  isVisible: boolean;
  sortOrder: number;
  productCount: number;
}

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
export const getBrandLogo = (url: string) =>
  url ? (url.startsWith('http') ? url : `${BACKEND}${url}`) : '';

let cache: Brand[] | null = null;
let promise: Promise<Brand[]> | null = null;

export const useBrands = (showAll = false) => {
  const [brands, setBrands] = useState<Brand[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (!showAll && cache) { setBrands(cache); setLoading(false); return; }
    const p = showAll
      ? api.get('/brands').then(r => r.data as Brand[])
      : (() => {
          if (!promise) promise = api.get('/brands').then(r => { cache = (r.data as Brand[]).filter(b => b.isVisible); return cache; });
          return promise;
        })();
    p.then(data => { setBrands(data); setLoading(false); }).catch(() => setLoading(false));
  }, [showAll]);

  return { brands, loading };
};

// Invalidate cache khi admin thay đổi
export const invalidateBrandCache = () => { cache = null; promise = null; };
