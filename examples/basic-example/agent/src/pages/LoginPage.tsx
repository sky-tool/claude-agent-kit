import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const result = await login(credentials);
    if (result.success) {
      // 登录成功，路由会自动跳转（在 App 组件中处理）
      console.log('登录成功');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <LoginForm 
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
