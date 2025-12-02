import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'recruiter' | 'candidate';
  isDefaultPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const checkAuth = async () => {
    try {
      // Check localStorage first for instant load
      const storedUser = localStorage.getItem('sentivox_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoading(false);
          
          // Verify with server in background and handle invalid sessions
          fetch('/api/auth/me', { credentials: 'include' })
            .then(async res => {
              if (res.ok) {
                return res.json();
              } else {
                // Session invalid on server - clear local state
                setUser(null);
                localStorage.removeItem('sentivox_user');
                setLocation('/login');
                return null;
              }
            })
            .then(data => {
              if (data?.user) {
                // Update if server response differs
                if (JSON.stringify(parsedUser) !== JSON.stringify(data.user)) {
                  setUser(data.user);
                  localStorage.setItem('sentivox_user', JSON.stringify(data.user));
                }
              }
            })
            .catch((error) => {
              // Network error during background check - log but don't clear user
              console.warn('Background auth check failed:', error);
            });
          
          return;
        } catch {
          // Invalid stored user data
          localStorage.removeItem('sentivox_user');
        }
      }

      // No stored user, check with server
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('sentivox_user', JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem('sentivox_user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('sentivox_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('sentivox_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sentivox_user');
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(console.error);
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation('/login');
      } else {
        // Small delay to prevent flicker
        setShouldRender(true);
      }
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !shouldRender) {
    return null;
  }

  return <>{children}</>;
}
