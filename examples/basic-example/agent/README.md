# 登录页面项目

一个功能完整、设计美观的登录页面，使用 React + TypeScript + Tailwind CSS 构建。

## 功能特性

### 🔐 核心功能
- **用户认证**：完整的登录/登出功能
- **表单验证**：实时验证用户名和密码格式
- **错误处理**：友好的错误提示和状态反馈
- **路由保护**：基于认证状态的路由守卫
- **状态持久化**：使用 localStorage 保存用户登录状态

### 🎨 设计特性
- **响应式设计**：适配各种屏幕尺寸
- **现代 UI**：使用 Tailwind CSS 实现精美界面
- **交互动画**：流畅的过渡效果和微交互
- **密码显示切换**：支持显示/隐藏密码
- **加载状态**：登录过程中的加载指示器

### 🛠 技术特性
- **TypeScript**：完整的类型安全
- **React Hooks**：现代化的状态管理
- **模块化组件**：可复用的组件设计
- **模拟 API**：真实的异步登录体验

## 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本
\`\`\`bash
npm run build
\`\`\`

### 预览生产版本
\`\`\`bash
npm run preview
\`\`\`

## 演示账户

项目提供了两个演示账户用于测试：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| user | user123 | 普通用户 |

## 项目结构

\`\`\`
src/
├── components/          # 可复用组件
│   ├── LoginForm.tsx   # 登录表单组件
│   └── Dashboard.tsx   # 用户控制台组件
├── hooks/              # 自定义 Hooks
│   └── useAuth.ts      # 认证状态管理
├── pages/              # 页面组件
│   └── LoginPage.tsx   # 登录页面
├── types/              # TypeScript 类型定义
│   └── index.ts        # 通用类型
├── utils/              # 工具函数
│   └── auth.ts         # 认证相关工具
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
\`\`\`

## 技术栈

- **前端框架**：React 18
- **类型系统**：TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **路由管理**：React Router
- **图标库**：Lucide React

## 组件说明

### LoginForm 组件
登录表单组件，包含以下功能：
- 用户名和密码输入
- 实时表单验证
- 密码显示/隐藏切换
- 错误状态显示
- 加载状态处理

### useAuth Hook
认证状态管理 Hook，提供：
- 登录/登出方法
- 用户状态信息
- 认证状态持久化
- 错误处理

### 表单验证规则

**用户名验证：**
- 不能为空
- 长度 3-20 个字符
- 只能包含字母、数字和下划线

**密码验证：**
- 不能为空
- 长度 6-50 个字符

## 自定义配置

### 修改主题色彩
在 \`tailwind.config.js\` 中修改 \`primary\` 颜色配置：

\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义你的主题色
      }
    }
  }
}
\`\`\`

### 添加新的验证规则
在 \`src/utils/auth.ts\` 中添加新的验证函数：

\`\`\`typescript
export const validateCustomField = (value: string): string | null => {
  // 你的验证逻辑
  return null; // 返回 null 表示验证通过
};
\`\`\`

### 扩展用户信息
在 \`src/types/index.ts\` 中扩展 \`User\` 接口：

\`\`\`typescript
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  // 添加新的用户字段
  avatar?: string;
  role?: string;
}
\`\`\`

## 部署说明

### 静态部署
构建完成后，将 \`dist\` 目录部署到任何静态文件服务器即可。

### 环境变量
如果需要配置环境变量，创建 \`.env\` 文件：

\`\`\`
VITE_API_URL=https://your-api.com
VITE_APP_NAME=Your App Name
\`\`\`

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
