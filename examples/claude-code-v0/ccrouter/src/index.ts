import { initConfig, readConfigFile } from "./utils/config.js";
import { createServer } from "./server.js";
import { router } from "./utils/router.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { sessionUsageCache } from "./utils/cache.js";
import {SSEParserTransform} from "./utils/SSEParser.transform.js";
import {SSESerializerTransform} from "./utils/SSESerializer.transform.js";
import {rewriteStream} from "./utils/rewriteStream.js";
import JSON5 from "json5";
import path from "node:path";

const CONFIG_FILE = path.join(process.cwd(), "..", "docs", "config.json");

/**
 * 运行服务器
 */
async function run() {
  try {
    // 读取配置
    console.log("正在读取配置文件...");
    const config = await readConfigFile();

    let HOST = config.HOST || "127.0.0.1";
    const port = config.PORT || 3456;

    // 如果没有配置 APIKEY，强制使用本机地址
    if (config.HOST && !config.APIKEY) {
      HOST = "127.0.0.1";
      console.warn("⚠️ 未设置 API Key，HOST 强制设置为 127.0.0.1");
    }

    console.log(`启动服务器，监听地址: ${HOST}:${port}`);

    // 创建服务器
    const server = createServer({
      jsonPath: CONFIG_FILE,
      initialConfig: {
        providers: config.Providers || config.providers,
        HOST: HOST,
        PORT: port,
      },
    });

    // 添加鉴权预处理器
    server.addHook("preHandler", async (req: any, reply: any) => {
      return new Promise<void>((resolve, reject) => {
        const done = (err?: Error) => {
          if (err) reject(err);
          else resolve();
        };
        // 调用鉴权函数
        apiKeyAuth(config)(req, reply, done).catch(reject);
      });
    });

    // 添加路由预处理器
    server.addHook("preHandler", async (req: any, reply: any) => {
      if (req.url.startsWith("/v1/messages") && !req.url.startsWith("/v1/messages/count_tokens")) {
        await router(req, reply, { config });
      }
    });

    // 添加错误处理钩子
    server.addHook("onError", async (request: any, reply: any, error: any) => {
      console.error("服务器错误:", error);
    });

    // 添加 SSE 流处理钩子
    server.addHook("onSend", (req: any, reply: any, payload: any, done: any) => {
      if (req.sessionId && req.url.startsWith("/v1/messages") && !req.url.startsWith("/v1/messages/count_tokens")) {
        if (payload instanceof ReadableStream) {
          // 复制流：一个用于处理，一个用于后台统计
          const [originalStream, clonedStream] = payload.tee();

          // 后台统计 token 使用情况
          const read = async (stream: ReadableStream) => {
            const reader = stream.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const dataStr = new TextDecoder().decode(value);
                if (!dataStr.startsWith("event: message_delta")) {
                  continue;
                }
                const str = dataStr.slice(27);
                try {
                  const message = JSON.parse(str);
                  sessionUsageCache.put(req.sessionId, message.usage);
                } catch {}
              }
            } catch (readError: any) {
              if (readError.name === 'AbortError' || readError.code === 'ERR_STREAM_PREMATURE_CLOSE') {
                console.error("后台读取流提前关闭");
              } else {
                console.error("后台流读取错误:", readError);
              }
            } finally {
              reader.releaseLock();
            }
          };
          read(clonedStream);

          return done(null, originalStream);
        }

        // 非流式响应
        if (typeof payload === 'object') {
          if (payload.error) {
            return done(payload.error, null);
          } else {
            return done(payload, null);
          }
        }
      }

      // 默认处理
      if (typeof payload === 'object' && payload.error) {
        return done(payload.error, null);
      }
      done(null, payload);
    });

    // 添加发送后钩子
    server.addHook("onSend", async (req: any, reply: any, payload: any) => {
      return payload;
    });

    // 全局错误处理，防止进程崩溃
    process.on("uncaughtException", (err) => {
      console.error("未捕获的异常:", err);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("未处理的拒绝:", reason);
    });

    // 启动服务器
    server.start();
    console.log(`✅ 服务器已启动，访问地址: http://${HOST}:${port}`);
  } catch (error: any) {
    console.error("启动服务器失败:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此文件，则启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export { run };
