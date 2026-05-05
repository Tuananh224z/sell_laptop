import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

export interface CartItem {
  _id: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  slug: string;
  sku: string;
  thumbnail: string;
  price: number;
  comparePrice: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

interface CartContextType {
  cart: CartState;
  loading: boolean;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const defaultCart: CartState = { items: [], itemCount: 0, subtotal: 0 };

const CartContext = createContext<CartContextType>({
  cart: defaultCart,
  loading: false,
  addToCart: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refetchCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartState>(defaultCart);
  const [loading, setLoading] = useState(false);

  const refetchCart = useCallback(async () => {
    if (!user) { setCart(defaultCart); return; }
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      setCart(defaultCart);
    }
  }, [user]);

  // Fetch cart when user changes
  useEffect(() => {
    refetchCart();
  }, [refetchCart]);

  const addToCart = async (productId: string, variantId?: string, quantity = 1) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/cart/add', { productId, variantId, quantity });
      setCart({ items: data.items, itemCount: data.itemCount, subtotal: data.subtotal });
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ hàng!');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/cart/${itemId}`, { quantity });
      setCart({ items: data.items, itemCount: data.itemCount, subtotal: data.subtotal });
      if (quantity <= 0) {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật giỏ hàng!');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(true);
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart({ items: data.items, itemCount: data.itemCount, subtotal: data.subtotal });
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi xóa sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await api.delete('/cart');
      setCart(defaultCart);
    } catch (err: any) {
      toast.error('Lỗi xóa giỏ hàng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, refetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
