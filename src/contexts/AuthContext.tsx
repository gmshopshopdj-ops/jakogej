import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('gmshop-admin-auth');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const login = (email: string, password: string): boolean => {
    // Demo admin credentials
    if ((email === 'admin@gmshop.com' && password === 'admin123') ||
        (email === 'damjan@detemarketinga.site' && password === 'Damjan123') ||
        (email === 'janko@detemarketinga.site' && password === 'janko_car1')) {
      setIsAuthenticated(true);
      localStorage.setItem('gmshop-admin-auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gmshop-admin-auth');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};