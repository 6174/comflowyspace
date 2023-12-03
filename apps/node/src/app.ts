import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

export async function startAppServer() {
  console.log("start server sd");
  const app = express();
  const port = 3333;

  app.use(express.json());

  app.use(cors({
    origin: '*',  // 允许来自 http://localhost 的请求
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // 允许发送身份验证凭据（例如 cookies）
  }));

  // 配置代理中间件
  const proxyMiddleware = createProxyMiddleware('/comfyui', {
    target: 'http://127.0.0.1:8188',
    changeOrigin: true,
    ws: true,  // 支持 WebSocket
    pathRewrite: {
      '^/comfyui': '',  // 重写路径，去掉 /comfui 前缀
    },
  });
  
  app.use('/comfyui', proxyMiddleware);

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express + TypeScript! asdf');
  });

  app.post('/api/data', (req: Request, res: Response) => {
    const { data } = req.body;
    res.json({ message: `Received data: ${data}` });
  });

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
