import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('recheiae-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('recheiae-cart', JSON.stringify(items));
  }, [items]);

  const buildItemSignature = useCallback((item) => {
    return JSON.stringify({
      id: item.id,
      type: item.type,
      addons: (item.addons || []).map((addon) => addon.name).sort(),
      notes: item.notes || '',
    });
  }, []);

  const addItem = useCallback((item) => {
    setItems(prev => {
      const itemSignature = buildItemSignature(item);
      const existing = prev.find(i => (i.signature || buildItemSignature(i)) === itemSignature);
      if (existing) {
        return prev.map(i =>
          (i.signature || buildItemSignature(i)) === itemSignature
            ? { ...i, quantity: i.quantity + 1, signature: itemSignature }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, signature: itemSignature }];
    });
  }, [buildItemSignature]);

  const removeItem = useCallback((signature) => {
    setItems(prev => prev.filter(i => (i.signature || buildItemSignature(i)) !== signature));
  }, [buildItemSignature]);

  const updateQuantity = useCallback((signature, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => (i.signature || buildItemSignature(i)) !== signature));
      return;
    }
    setItems(prev => prev.map(i =>
      (i.signature || buildItemSignature(i)) === signature ? { ...i, quantity } : i
    ));
  }, [buildItemSignature]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      isOpen, openCart, closeCart, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
