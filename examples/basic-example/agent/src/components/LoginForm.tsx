import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { LoginCredentials, FormErrors } from '../types';
import { validateUsername, validatePassword } from '../utils/auth';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error: authError = null,
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 清除通用错误当用户开始输入时
  useEffect(() => {
    if (authError) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  }, [credentials, authError]);

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }));
    
    // 清除特定字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    const usernameError = validateUsername(credentials.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }
    
    const passwordError = validatePassword(credentials.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit(credentials);
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-gray-600 mt-2">请登录您的账户</p>
        </div>

        {/* Error Message */}
        {(authError || errors.general) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">
              {authError || errors.general}
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={handleInputChange('username')}
                className={\`
                  block w-full pl-10 pr-3 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-colors duration-200
                  \${errors.username
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                  \${isLoading || isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
                \`}
                placeholder="请输入用户名"
                disabled={isLoading || isSubmitting}
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleInputChange('password')}
                className={\`
                  block w-full pl-10 pr-10 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-colors duration-200
                  \${errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                  \${isLoading || isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
                \`}
                placeholder="请输入密码"
                disabled={isLoading || isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading || isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={\`
              w-full flex items-center justify-center gap-2 px-4 py-3
              bg-primary-600 text-white font-medium rounded-lg
              hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              transition-all duration-200
              \${isLoading || isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg active:scale-[0.98]'
              }
            \`}
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500 mb-3">
            演示账户
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-gray-700">admin / admin123</span>
              <span className="text-gray-500">管理员</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-gray-700">user / user123</span>
              <span className="text-gray-500">普通用户</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
