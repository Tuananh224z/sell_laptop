import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  isVisible: boolean;
  sortOrder: number;
}

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
export const getCategoryImg = (url: string) =>
  url ? (url.startsWith('http') ? url : `${BACKEND}${url}`) : '';

// Separate caches: one for visible-only (user-facing), one for all (admin)
let cacheVisible: Category[] | null = null;
let cacheAll:     Category[] | null = null;
let promiseVisible: Promise<Category[]> | null = null;
let promiseAll:     Promise<Category[]> | null = null;

export const invalidateCategoryCache = () => {
  cacheVisible = null; cacheAll = null;
  promiseVisible = null; promiseAll = null;
};

export const useCategories = (showAll = false) => {
  const cache   = showAll ? cacheAll    : cacheVisible;
  const [categories, setCategories] = useState<Category[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (showAll) {
      if (cacheAll) { setCategories(cacheAll); setLoading(false); return; }
      if (!promiseAll) {
        promiseAll = categoryService.getAll({ all: true }).then(r => {
          cacheAll = r.data as Category[];
          return cacheAll;
        });
      }
      promiseAll.then(data => { setCategories(data); setLoading(false); })
                .catch(() => setLoading(false));
    } else {
      if (cacheVisible) { setCategories(cacheVisible); setLoading(false); return; }
      if (!promiseVisible) {
        promiseVisible = categoryService.getAll().then(r => {
          cacheVisible = (r.data as Category[]).filter(c => c.isVisible);
          return cacheVisible;
        });
      }
      promiseVisible.then(data => { setCategories(data); setLoading(false); })
                    .catch(() => setLoading(false));
    }
  }, [showAll]);

  return { categories, loading };
};
