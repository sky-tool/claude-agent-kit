import path from "node:path";
import os from "node:os";

// 使用 docs/config.json 作为配置文件
export const CONFIG_FILE = path.join(
  process.cwd(),
  "..",
  "docs",
  "config.json"
);

// 简化的HOME_DIR，不再使用用户主目录
export const HOME_DIR = path.join(process.cwd(), "logs");

export const PID_FILE = path.join(HOME_DIR, '.claude-code-router-wbb.pid');

// Claude projects directory（可选，暂不使用）
export const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");

export const DEFAULT_CONFIG = {
  LOG: false,
  OPENAI_API_KEY: "",
  OPENAI_BASE_URL: "",
  OPENAI_MODEL: "",
};
