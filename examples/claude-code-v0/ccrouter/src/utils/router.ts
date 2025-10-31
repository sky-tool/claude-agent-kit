import {
  MessageCreateParamsBase,
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages";
import { get_encoding } from "tiktoken";
import { sessionUsageCache, Usage } from "./cache.js";

// 使用 tiktoken 的编码器
const enc = get_encoding("cl100k_base");

/**
 * 计算 token 数量
 */
export const calculateTokenCount = (
  messages: MessageParam[],
  system: any,
  tools: Tool[]
) => {
  let tokenCount = 0;

  if (Array.isArray(messages)) {
    messages.forEach((message) => {
      if (typeof message.content === "string") {
        tokenCount += enc.encode(message.content).length;
      } else if (Array.isArray(message.content)) {
        message.content.forEach((contentPart: any) => {
          if (contentPart.type === "text") {
            tokenCount += enc.encode(contentPart.text).length;
          } else if (contentPart.type === "tool_use") {
            tokenCount += enc.encode(JSON.stringify(contentPart.input)).length;
          } else if (contentPart.type === "tool_result") {
            tokenCount += enc.encode(
              typeof contentPart.content === "string"
                ? contentPart.content
                : JSON.stringify(contentPart.content)
            ).length;
          }
        });
      }
    });
  }

  if (typeof system === "string") {
    tokenCount += enc.encode(system).length;
  } else if (Array.isArray(system)) {
    system.forEach((item: any) => {
      if (item.type !== "text") return;
      if (typeof item.text === "string") {
        tokenCount += enc.encode(item.text).length;
      } else if (Array.isArray(item.text)) {
        item.text.forEach((textPart: any) => {
          tokenCount += enc.encode(textPart || "").length;
        });
      }
    });
  }

  if (tools) {
    tools.forEach((tool: Tool) => {
      if (tool.description) {
        tokenCount += enc.encode(tool.name + tool.description).length;
      }
      if (tool.input_schema) {
        tokenCount += enc.encode(JSON.stringify(tool.input_schema)).length;
      }
    });
  }

  return tokenCount;
};

/**
 * 获取要使用的模型
 */
const getUseModel = async (
  req: any,
  tokenCount: number,
  config: any,
  lastUsage?: Usage | undefined
) => {
  const Router = config.Router;

  // 如果请求中已经指定了模型（格式为 provider,model），则验证并使用
  if (req.body.model && req.body.model.includes(",")) {
    const [provider, model] = req.body.model.split(",");
    const finalProvider = config.Providers.find(
      (p: any) => p.name.toLowerCase() === provider.toLowerCase()
    );
    const finalModel = finalProvider?.models?.find(
      (m: any) => m.toLowerCase() === model.toLowerCase()
    );
    if (finalProvider && finalModel) {
      return `${finalProvider.name},${finalModel}`;
    }
    return req.body.model;
  }

  // 如果 token 数量超过配置的阈值，使用长上下文模型
  const longContextThreshold = Router.longContextThreshold || 60000;
  const lastUsageThreshold =
    lastUsage &&
    lastUsage.input_tokens > longContextThreshold &&
    tokenCount > 20000;
  const tokenCountThreshold = tokenCount > longContextThreshold;

  if ((lastUsageThreshold || tokenCountThreshold) && Router.longContext) {
    console.log(
      `使用长上下文模型，token 数量: ${tokenCount}, 阈值: ${longContextThreshold}`
    );
    return Router.longContext;
  }

  // 处理子代理模型标记
  if (
    req.body?.system?.length > 1 &&
    req.body?.system[1]?.text?.startsWith("<CCR-SUBAGENT-MODEL>")
  ) {
    const model = req.body?.system[1].text.match(
      /<CCR-SUBAGENT-MODEL>(.*?)<\/CCR-SUBAGENT-MODEL>/s
    );
    if (model) {
      req.body.system[1].text = req.body.system[1].text.replace(
        `<CCR-SUBAGENT-MODEL>${model[1]}</CCR-SUBAGENT-MODEL>`,
        ""
      );
      return model[1];
    }
  }

  // 为 Claude Haiku 变体使用背景模型
  if (
    req.body.model?.includes("claude") &&
    req.body.model?.includes("haiku") &&
    config.Router.background
  ) {
    console.log(`为 ${req.body.model} 使用背景模型`);
    return config.Router.background;
  }

  // Web 搜索优先级必须高于思考
  if (
    Array.isArray(req.body.tools) &&
    req.body.tools.some((tool: any) => tool.type?.startsWith("web_search")) &&
    Router.webSearch
  ) {
    return Router.webSearch;
  }

  // 如果存在思考，使用思考模型
  if (req.body.thinking && Router.think) {
    console.log(`为思考使用模型: ${req.body.thinking}`);
    return Router.think;
  }

  // 默认模型
  return Router!.default;
};

/**
 * 路由中间件
 */
export const router = async (req: any, _res: any, context: any) => {
  const { config } = context;

  // 从 metadata.user_id 解析 sessionId
  if (req.body.metadata?.user_id) {
    const parts = req.body.metadata.user_id.split("_session_");
    if (parts.length > 1) {
      req.sessionId = parts[1];
    }
  }

  // 获取上次的会话使用情况
  const lastMessageUsage = sessionUsageCache.get(req.sessionId);
  const { messages, system = [], tools }: MessageCreateParamsBase = req.body;

  try {
    // 计算 token 数量
    const tokenCount = calculateTokenCount(
      messages as MessageParam[],
      system,
      tools as Tool[]
    );

    // 获取要使用的模型
    let model;
    model = await getUseModel(req, tokenCount, config, lastMessageUsage);

    // 更新请求体中的模型
    req.body.model = model;
  } catch (error: any) {
    console.error(`路由中间件错误: ${error.message}`);
    req.body.model = config.Router!.default;
  }

  return;
};

// 简化的项目查找函数（返回 null 表示未找到）
export const searchProjectBySession = async (
  sessionId: string
): Promise<string | null> => {
  // 精简版暂不支持项目特定路由
  return null;
};
