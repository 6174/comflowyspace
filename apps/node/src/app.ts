import express, { Request, Response, response } from 'express';
import cors from 'cors';
import { ApiRouteGetModels, ApiRouteInstallModel } from './routes/api/models';
import { setupComfyUIProxy } from './routes/api/comfy-proxy';
import { setupWebsocketHandler } from './routes/api/websocket-handler';
import { ApiRouteAddTask } from './routes/api/add-task';
import { ApiRouteInstallExtension, ApiRouteGetExtensions, ApiRouteEnableExtensions, ApiRouteDisableExtensions, ApiRouteRemoveExtensions, ApiRouteUpdateExtensions, ApiRouteGetFrontendExtensions, ApiInstallPipPackages } from './routes/api/extension';
import { ApiBootstrap, ApiEnvCheck, ApiSetupConfig, ApiUpdateStableDiffusionConfig, ApiRestartComfyUI, ApiUpdateComfyUIAndRestart } from './routes/api/bootstrap';
import { JSONDB } from './modules/jsondb/jsondb';
import { getComfyUIDir } from './modules/utils/get-appdata-dir';
import logger from './modules/utils/logger';
import { downloadDefaultModel } from './modules/model-manager/install-model';

import * as Sentry from "@sentry/node";
import ComflowyConsole from './modules/comflowy-console';

Sentry.init({
  dsn: "https://c22ceb8e2ea24010369ea2497e96fbd6@o4506737077256192.ingest.sentry.io/4506737079156736",
  environment: process.env.NODE_ENV || 'development',
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

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

  app.use('/static', (req, res, next) => {
    const comfyDir = getComfyUIDir(); // 获取用户设置
    if (comfyDir) {
      express.static(comfyDir)(req, res, next); // 使用 express.static 服务
    }
  });

  setupComfyUIProxy(app);
  
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express + TypeScript!');
  });

  app.get('/api/env_check', ApiEnvCheck);
  app.get('/api/extension_infos', ApiRouteGetExtensions)
  app.get('/api/frontend_extension', ApiRouteGetFrontendExtensions);
  app.get('/api/model_infos', ApiRouteGetModels);

  app.post('/api/add_bootstrap_task', ApiBootstrap);
  app.post('/api/install_extension', ApiRouteInstallExtension)
  app.post('/api/enable_extensions', ApiRouteEnableExtensions)
  app.post('/api/disable_extensions', ApiRouteDisableExtensions)
  app.post('/api/remove_extensions', ApiRouteRemoveExtensions)
  app.post('/api/update_extensions', ApiRouteUpdateExtensions)
  app.post('/api/install_pip_packages', ApiInstallPipPackages)

  app.post('/api/install_model', ApiRouteInstallModel)
  app.post('/api/add_task', ApiRouteAddTask);
  app.post('/api/setup_config', ApiSetupConfig);
  app.post('/api/update_sdwebui', ApiUpdateStableDiffusionConfig);
  app.post('/api/restart_comfy', ApiRestartComfyUI);
  app.post('/api/update_comfy', ApiUpdateComfyUIAndRestart)
  app.post('/api/data', (req: Request, res: Response) => {
    const { data } = req.body;
    res.json({ message: `Received data: ${data}` });
  });

  const [server, wss] = setupWebsocketHandler(app);

  JSONDB.serve(app, server, wss);
  ComflowyConsole.serve(app, server, wss);
  server.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
  });

  setTimeout(() => {
    downloadDefaultModel();
  }, 10000);
}
