# Claude Code Router - 精简版

这是一个精简版的 Claude Code Router 实现，基于 `@musistudio/llms` 构建。

## 项目结构

```
claude-code-router-wbb/
├── src/
│   ├── index.ts                 # 入口文件，启动服务器
│   ├── server.ts                # Fastify 服务器配置
│   ├── constants.ts             # 常量定义
│   ├── types.d.ts               # 类型声明
│   ├── middleware/
│   │   └── auth.ts              # API Key 鉴权中间件
│   └── utils/
│       ├── config.ts            # 配置读取模块
│       ├── cache.ts             # LRU 缓存实现
│       ├── router.ts            # 路由逻辑
│       ├── rewriteStream.ts     # 流重写工具
│       ├── SSEParser.transform.ts      # SSE 解析器
│       └── SSESerializer.transform.ts  # SSE 序列化器
├── package.json
├── tsconfig.json
└── README.md
```

## 功能特性

### ✅ 已实现

- **配置管理**：读取 `docs/config.json` 配置文件
- **API 鉴权**：支持 API Key 验证，未设置时允许本机访问
- **模型路由**：根据 token 数量和配置自动选择模型
- **Token 计数**：提供 `/v1/messages/count_tokens` 端点
- **SSE 流处理**：支持流式响应和工具调用
- **缓存机制**：LRU 缓存用于会话使用统计
- **错误处理**：全局错误处理防止进程崩溃

### 🔄 精简移除的功能

- ❌ PID 文件守护进程管理
- ❌ 自动更新逻辑
- ❌ 静态资源和 UI
- ❌ 日志文件管理
- ❌ 项目目录扫描
- ❌ CLI 入口
- ❌ 自定义路由器支持

## 配置

项目使用 `docs/config.json` 作为配置文件，配置格式与原项目保持一致：

```json
{
  "Providers": [...],
  "Router": {
    "default": "GLM,glm-4.5",
    "background": "GLM,glm-4.5",
    "think": "GLM,glm-4.5"
  },
  "PORT": 3456,
  "HOST": "127.0.0.1",
  "LOG": true
}
```

## 使用方法

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

## API 端点

### 公共端点（无需鉴权）

- `GET /` - 根端点，返回服务器信息
- `GET /health` - 健康检查端点

### 鉴权端点

- `POST /v1/messages` - 消息代理端点（支持流式响应）
- `GET /v1/messages/count_tokens` - Token 计数
- `GET /api/config` - 读取配置

## 验证清单

- [x] `npm run dev` 成功启动，Fastify 监听指定端口
- [x] 未设置 `APIKEY` 时，本地请求通过鉴权
- [x] `/v1/messages/count_tokens` 返回正确的 token 统计
- [x] 正确读取和解析 `docs/config.json` 配置文件

## 核心模块说明

### 配置读取 (`utils/config.ts`)

- 读取 JSON5 格式配置文件
- 支持环境变量插值
- 配置文件路径：`docs/config.json`

### 鉴权中间件 (`middleware/auth.ts`)

- 公共端点无需鉴权
- 配置 APIKEY 后启用验证
- 未配置 APIKEY 时允许本机访问

### 路由逻辑 (`utils/router.ts`)

- 根据 token 数量选择模型
- 支持长上下文模型切换
- 支持思考模型和背景模型
- 支持 web-search 优先级

### SSE 流处理

- `SSEParserTransform`：解析 SSE 事件流
- `SSESerializerTransform`：序列化 SSE 事件
- `rewriteStream`：流重写和工具调用处理

## 注意事项

1. 配置文件位置：`docs/config.json`
2. 默认监听地址：`127.0.0.1:3456`
3. 未设置 APIKEY 时强制使用本机地址
4. 支持流式响应和工具调用
5. 基于 `@musistudio/llms` 实现

## 许可证

MIT
