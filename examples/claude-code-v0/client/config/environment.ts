export interface EnvironmentConfig {
  wsUrl: string;
  httpUrl: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  // 检测开发环境：通过hostname和端口判断
  const currentOrigin = window.location.origin;
  const url = new URL(currentOrigin);
  const isDevelopment = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // 从全局变量获取环境变量（如果有的话）
  const customWsUrl = (window as any).__REACT_APP_WS_URL__;
  const customHttpUrl = (window as any).__REACT_APP_HTTP_URL__;

  if (customWsUrl && customHttpUrl) {
    return {
      wsUrl: customWsUrl,
      httpUrl: customHttpUrl
    };
  }

  // 根据当前访问地址动态生成WebSocket URL
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  return {
    wsUrl: `${wsProtocol}//${url.host}/ws`,
    httpUrl: currentOrigin
  };
}