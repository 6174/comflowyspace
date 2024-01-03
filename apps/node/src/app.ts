import express, { Request, Response, response } from 'express';
import cors from 'cors';
import { ApiRouteGetModels, ApiRouteInstallModel } from './routes/api/models';
import { setupComfyUIProxy } from './routes/api/comfy-proxy';
import { setupWebsocketHandler } from './routes/api/websocket-handler';
import { ApiRouteAddTask } from './routes/api/add-task';
import { ApiRouteInstallExtension, ApiRouteGetExtensions, ApiRouteEnableExtensions, ApiRouteDisableExtensions, ApiRouteRemoveExtensions, ApiRouteUpdateExtensions } from './routes/api/extension';
import { ApiBootstrap, ApiEnvCheck, ApiSetupConfig, ApiUpdateStableDiffusionConfig } from './routes/api/bootstrap';
export async function startAppServer(params: {
  port:number,
  staticFolder?: string | null
}) {
  const {port = 3333, staticFolder} = params;
  const app = express();

  app.use(express.static(staticFolder ? staticFolder : 'public'));
  app.use(express.json());

  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));

  setupComfyUIProxy(app);
  
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express + TypeScript!');
  });

  app.get('/api/env_check', ApiEnvCheck);
  app.get('/api/extension_infos', ApiRouteGetExtensions)
  app.get('/api/model_infos', ApiRouteGetModels);
  
  app.post('/api/add_bootstrap_task', ApiBootstrap);
  app.post('/api/install_extension', ApiRouteInstallExtension)
  app.post('/api/enable_extensions', ApiRouteEnableExtensions)
  app.post('/api/disable_extensions', ApiRouteDisableExtensions)
  app.post('/api/remove_extensions', ApiRouteRemoveExtensions)
  app.post('/api/update_extensions', ApiRouteUpdateExtensions)

  app.post('/api/install_model', ApiRouteInstallModel)
  app.post('/api/add_task', ApiRouteAddTask);
  app.post('/api/setup_config', ApiSetupConfig);
  app.post('/api/update_sdwebui', ApiUpdateStableDiffusionConfig);
  app.post('/api/data', (req: Request, res: Response) => {
    const { data } = req.body;
    res.json({ message: `Received data: ${data}` });
  });

  const [server, wss] = setupWebsocketHandler(app);
  
  server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
