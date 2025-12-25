import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Teacher } from '@/types';
import { getCurrentTeacher, setCurrentTeacher } from '../lib/storage';

interface AuthContextType {
  teacher: Teacher | null;
  login: (teacher: Teacher) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // Load teacher from localStorage on mount
  useEffect(() => {
    const currentTeacher = getCurrentTeacher();
    if (currentTeacher) {
      setTeacher(currentTeacher);
    }
  }, []);

  // Listen to localStorage changes for real-time sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentTeacher') {
        if (e.newValue) {
          setTeacher(JSON.parse(e.newValue));
        } else {
          setTeacher(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (teacher: Teacher) => {
    setTeacher(teacher);
    setCurrentTeacher(teacher);
  };

  const logout = () => {
    setTeacher(null);
    setCurrentTeacher(null);
    localStorage.removeItem('sui_wallet_address');
    localStorage.removeItem('sui_mock_mode');
  };

  return (
    <AuthContext.Provider value={{ teacher, login, logout, isAuthenticated: !!teacher }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};