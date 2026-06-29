import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authApi, userApi, adminApi, setToken, clearToken } from '../api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, code: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  sendCode: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  adminUpdateUser: (userId: string, data: { name?: string; role?: UserRole }) => Promise<void>;
  adminCreateUser: (data: { email: string; password: string; name: string; role: string }) => Promise<void>;
  adminDeleteUser: (userId: string) => Promise<void>;
  getAllUsers: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.getMe();
        if (data.user) {
          setUser(data.user);
          setRole(data.user.role);
        } else {
          // Token invalid or expired
          clearToken();
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authApi.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, code: string): Promise<boolean> => {
    try {
      const data = await authApi.register(email, password, name, code);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setRole('user');
    clearToken();
  };

  const updateProfile = async (data: Partial<User>) => {
    await userApi.updateProfile(data);
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  };

  const sendCode = async (email: string): Promise<boolean> => {
    try {
      await authApi.sendCode(email);
      return true;
    } catch {
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      await authApi.resetPassword(email, code, newPassword);
      return true;
    } catch {
      return false;
    }
  };

  const adminUpdateUser = async (userId: string, data: { name?: string; role?: UserRole }) => {
    await adminApi.updateUser(userId, data);
  };

  const adminCreateUser = async (data: { email: string; password: string; name: string; role: string }) => {
    await adminApi.createUser(data);
  };

  const adminDeleteUser = async (userId: string) => {
    await adminApi.deleteUser(userId);
  };

  const getAllUsers = async (): Promise<any[]> => {
    const data = await adminApi.getUsers();
    return data.users;
  };

  return (
    <AuthContext.Provider value={{
      user, role, loading, login, register, logout, updateProfile,
      sendCode, resetPassword, adminUpdateUser, adminCreateUser, adminDeleteUser, getAllUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
