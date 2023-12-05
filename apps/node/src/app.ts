import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import { ApiRouteGetExtensions } from './routes/api/get-extensions';
import { ApiRouteGetModels } from './routes/api/get-models';

export async function startAppServer() {
  console.log("start server sd");
  const app = express();
  const port = 3333;

  app.use(express.json());

  app.use(cors({
    origin: '*',  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  
  }));

  const proxyMiddleware = createProxyMiddleware('/comfyui', {
    target: 'http://127.0.0.1:8188',
    changeOrigin: true,
    ws: true,  
    pathRewrite: {
      '^/comfyui': '',  
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

  app.get('/api/extension_infos', ApiRouteGetExtensions)
  app.get('/api/model_infos', ApiRouteGetModels);

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
