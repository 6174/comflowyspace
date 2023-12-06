import express, { Request, Response, response } from 'express';
import cors from 'cors';
import { ApiRouteGetExtensions } from './routes/api/get-extensions';
import { ApiRouteGetModels } from './routes/api/get-models';
import { ApiRouteAddTask } from './routes/api/add-task';
import { setupComfyUIProxy } from './routes/api/comfy-proxy';
import { setupWebsocketHandler } from './routes/api/websocket-handler';
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

  setupComfyUIProxy(app);
  setupWebsocketHandler(app);

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express + TypeScript! asdf');
  });
  app.post('/api/add_task', ApiRouteAddTask);
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
