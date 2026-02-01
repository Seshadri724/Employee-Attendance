import { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { demoUsers } from '../data/demoData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('carivix_current_user', null);

  const login = (email: string, password: string): boolean => {
    // Get users from localStorage
    const storedUsers = localStorage.getItem('carivix_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : demoUsers;

    // Demo credentials for quick access
    const demoCredentials = {
      'john@carivix.com': 'employee123',
      'admin@carivix.com': 'admin123',
    };

    // Check demo credentials first
    if (demoCredentials[email as keyof typeof demoCredentials] === password) {
      const foundUser = users.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        return true;
      }
    }

    // Check against stored users (for dynamic login)
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      // For demo purposes, accept any password for existing users
      // In production, you'd verify against a hashed password
      setUser(foundUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update in users list as well
      const storedUsers = localStorage.getItem('carivix_users');
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      localStorage.setItem('carivix_users', JSON.stringify(updatedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
