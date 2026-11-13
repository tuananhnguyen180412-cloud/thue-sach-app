import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Book {
  id: number;
  title: string;
  author: string;
  priceNumber: number;
  priceText: string;
  category: string;
}

export interface CartItem {
  book: Book;
  days: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (id: number) => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        return prev.map(item => 
          item.book.id === book.id ? { ...item, days: item.days + 7 } : item
        );
      }
      return [...prev, { book, days: 7 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.book.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.book.priceNumber * item.days, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phải được sử dụng trong CartProvider');
  return context;
};