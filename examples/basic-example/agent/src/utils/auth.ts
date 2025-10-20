import { LoginCredentials, User } from '../types';

// 模拟的用户数据库
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: '管理员'
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    name: '普通用户'
  }
];

// 模拟登录 API
export const loginAPI = async (credentials: LoginCredentials): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        // 不返回密码
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('用户名或密码错误'));
      }
    }, 1000); // 模拟网络延迟
  });
};

// 检查用户名格式
export const validateUsername = (username: string): string | null => {
  if (!username) {
    return '请输入用户名';
  }
  if (username.length < 3) {
    return '用户名至少需要3个字符';
  }
  if (username.length > 20) {
    return '用户名不能超过20个字符';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return '用户名只能包含字母、数字和下划线';
  }
  return null;
};

// 检查密码格式
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return '请输入密码';
  }
  if (password.length < 6) {
    return '密码至少需要6个字符';
  }
  if (password.length > 50) {
    return '密码不能超过50个字符';
  }
  return null;
};
