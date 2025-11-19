import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { setGlobalLogoutHandler } from "@/lib/queryClient";
import { identifyUser, resetUser, trackEvent } from "@/lib/amplitude";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  const logout = () => {
    resetUser();
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      
      identifyUser(parsedUser.id, {
        username: parsedUser.username,
        country: parsedUser.country,
        school: parsedUser.school,
        provider: parsedUser.provider || 'email',
      });
    }
    
    setIsLoading(false);
    
    // 글로벌 로그아웃 핸들러 설정
    setGlobalLogoutHandler(logout);
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Clear all previous session data to prevent conflicts
    localStorage.clear();
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    identifyUser(newUser.id, {
      username: newUser.username,
      country: newUser.country,
      school: newUser.school,
      provider: newUser.provider || 'email',
    });
    
    trackEvent('User Login', {
      method: newUser.provider || 'email',
      country: newUser.country,
      school: newUser.school,
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}
