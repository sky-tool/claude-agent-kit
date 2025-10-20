import { useState, useCallback } from 'react';
import { AuthState, User, LoginCredentials } from '../types';
import { loginAPI } from '../utils/auth';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(initialState);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await loginAPI(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // 在实际应用中，这里会保存 token 到 localStorage 或 cookie
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    setState(initialState);
    localStorage.removeItem('user');
  }, []);

  // 初始化时检查本地存储的用户信息
  const initializeAuth = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    initializeAuth,
  };
};
