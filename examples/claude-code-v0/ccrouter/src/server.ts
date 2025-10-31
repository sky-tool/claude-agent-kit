import Server from "@musistudio/llms";
import { readConfigFile } from "./utils/config.js";
import { calculateTokenCount } from "./utils/router.js";

/**
 * 创建 Fastify 服务器
 */
export const createServer = (config: any): Server => {
  const server = new Server(config);

  // Token 计数端点
  server.app.post("/v1/messages/count_tokens", async (req: any, reply: any) => {
    const { messages, tools, system } = req.body;
    const tokenCount = calculateTokenCount(messages, system, tools);
    return { "input_tokens": tokenCount };
  });

  // 读取配置端点
  server.app.get("/api/config", async (req: any, reply: any) => {
    const config = await readConfigFile();
    return config;
  });

  return server;
};
