import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalAuthService, LocalUser } from '../lib/localAuth';

interface AuthContextType {
  user: LocalUser | null;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  handleAuthSuccess: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check current auth status from localStorage
    const current = LocalAuthService.getCurrentUser();
    setUser(current);

    // Listen for auth changes
    const subscription = LocalAuthService.onAuthStateChange((updatedUser) => {
      setUser(updatedUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const logout = async () => {
    try {
      LocalAuthService.signOut();
      setUser(null);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, showAuthModal, setShowAuthModal, handleAuthSuccess, logout }}>
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
