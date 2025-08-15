import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ReferralUser {
  id: string;
  username: string;
  email: string;
  referral_code: string;
  credit_balance: number;
  credit_per_order: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralOrder {
  id: string;
  referral_user_id: string;
  order_id: string;
  credit_earned: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ReferralContextType {
  currentUser: ReferralUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  orders: ReferralOrder[];
  fetchOrders: () => Promise<void>;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

interface ReferralProviderProps {
  children: ReactNode;
}

export const ReferralProvider: React.FC<ReferralProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ReferralUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<ReferralOrder[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('gmshop-referral-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('referral_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;

      if (data.password_hash === password) {
        setCurrentUser(data);
        setIsAuthenticated(true);
        localStorage.setItem('gmshop-referral-user', JSON.stringify(data));
        await fetchOrders(); // Fetch orders immediately after login
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gmshop-referral-user');
  };

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('referral_orders')
        .select('*')
        .eq('referral_user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching referral orders:', error);
    }
  };

  return (
    <ReferralContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout,
      orders,
      fetchOrders
    }}>
      {children}
    </ReferralContext.Provider>
  );
};