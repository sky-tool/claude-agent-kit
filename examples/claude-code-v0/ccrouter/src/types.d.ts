// 类型声明文件

declare module '@musistudio/llms' {
  import { FastifyInstance } from 'fastify';

  class Server {
    app: FastifyInstance;
    logger: any;

    constructor(config: any);

    addHook(hook: string, handler: any): void;

    start(): void;
  }

  export = Server;
}
