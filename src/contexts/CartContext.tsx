import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem } from '../types';

// Toast notification component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const addToCart = (product: Product) => {
    // Check stock availability
    if (product.track_stock && product.stock_quantity <= 0) {
      setToastMessage(`${product.name} trenutno nije dostupan!`);
      setShowToast(true);
      return;
    }

    let isNewItem = false;
    setItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        // Check if adding one more would exceed stock
        if (product.track_stock && existingItem.quantity >= product.stock_quantity) {
          setToastMessage(`Maksimalno ${product.stock_quantity} komada!`);
          setShowToast(true);
          return prev; // Don't add more
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      isNewItem = true;
      return [...prev, { product, quantity: 1 }];
    });
    
    // Only show success toast if we actually added the item
    if (isNewItem || (!product.track_stock || product.stock_quantity > 1)) {
      setToastMessage(`${product.name} dodan u korpu!`);
      setShowToast(true);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // Check stock limit when updating quantity
    const product = items.find(item => item.product.id === productId)?.product;
    if (product?.track_stock && quantity > product.stock_quantity) {
      setToastMessage(`Maksimalna količina za ${product.name} je ${product.stock_quantity}!`);
      setShowToast(true);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
      {showToast && (
        <Toast 
          message={toastMessage} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </CartContext.Provider>
  );
};