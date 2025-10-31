import fs from "node:fs/promises";
import path from "node:path";
import JSON5 from "json5";
import { CONFIG_FILE, HOME_DIR } from "../constants.js";

/**
 * 函数用于在配置值中插值环境变量
 */
const interpolateEnvVars = (obj: any): any => {
  if (typeof obj === "string") {
    // 将 $VAR_NAME 或 ${VAR_NAME} 替换为环境变量值
    return obj.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g, (match, braced, unbraced) => {
      const varName = braced || unbraced;
      return process.env[varName] || match; // 如果环境变量不存在则保持原样
    });
  } else if (Array.isArray(obj)) {
    return obj.map(interpolateEnvVars);
  } else if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateEnvVars(value);
    }
    return result;
  }
  return obj;
};

/**
 * 确保目录存在
 */
const ensureDir = async (dir_path: string) => {
  try {
    await fs.access(dir_path);
  } catch {
    await fs.mkdir(dir_path, { recursive: true });
  }
};

/**
 * 读取配置文件
 */
export const readConfigFile = async () => {
  try {
    const config = await fs.readFile(CONFIG_FILE, "utf-8");
    try {
      // 尝试使用 JSON5 解析（也支持标准 JSON）
      const parsedConfig = JSON5.parse(config);
      // 在解析的配置中插值环境变量
      return interpolateEnvVars(parsedConfig);
    } catch (parseError: any) {
      console.error(`解析配置文件失败: ${CONFIG_FILE}`);
      console.error("错误详情:", parseError.message);
      console.error("请检查配置文件语法。");
      process.exit(1);
    }
  } catch (readError: any) {
    if (readError.code === "ENOENT") {
      console.error(`配置文件不存在: ${CONFIG_FILE}`);
      console.error("请确保配置文件存在。");
      process.exit(1);
    } else {
      console.error(`读取配置文件失败: ${CONFIG_FILE}`);
      console.error("错误详情:", readError.message);
      process.exit(1);
    }
  }
};

/**
 * 写入配置文件
 */
export const writeConfigFile = async (config: any) => {
  await ensureDir(HOME_DIR);
  const configWithComment = `${JSON.stringify(config, null, 2)}\n`;
  await fs.writeFile(CONFIG_FILE, configWithComment);
};

/**
 * 初始化配置
 * 读取配置文件并将配置写入环境变量
 */
export const initConfig = async () => {
  const config = await readConfigFile();
  Object.assign(process.env, config);
  return config;
};
