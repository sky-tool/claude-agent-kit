import { FastifyRequest, FastifyReply } from "fastify";

/**
 * API Key 鉴权中间件
 * @param config 配置对象，包含 APIKEY 等信息
 * @returns Fastify 预处理器函数
 */
export const apiKeyAuth =
  (config: any) =>
  async (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
    // 公共端点，无需鉴权
    if (["/", "/health"].includes(req.url)) {
      return done();
    }

    const apiKey = config.APIKEY;
    if (!apiKey) {
      // 如果没有设置 API Key，允许本机来源通过
      const allowedOrigins = [
        `http://127.0.0.1:${config.PORT || 3456}`,
        `http://localhost:${config.PORT || 3456}`,
      ];
      if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) {
        reply.status(403).send("CORS not allowed for this origin");
        return;
      } else {
        reply.header('Access-Control-Allow-Origin', `http://127.0.0.1:${config.PORT || 3456}`);
        reply.header('Access-Control-Allow-Origin', `http://localhost:${config.PORT || 3456}`);
      }
      return done();
    }

    const authHeaderValue =
      req.headers.authorization || req.headers["x-api-key"];
    const authKey: string = Array.isArray(authHeaderValue)
      ? authHeaderValue[0]
      : authHeaderValue || "";
    if (!authKey) {
      reply.status(401).send("APIKEY is missing");
      return;
    }

    let token = "";
    if (authKey.startsWith("Bearer")) {
      token = authKey.split(" ")[1];
    } else {
      token = authKey;
    }

    if (token !== apiKey) {
      reply.status(401).send("Invalid API key");
      return;
    }

    done();
  };
