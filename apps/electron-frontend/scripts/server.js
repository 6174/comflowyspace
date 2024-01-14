const express = require('express')
const next = require('next')
const path = require('path')
const fs = require("fs");
const os  = require("os");
// const loadConfig = require('next/dist/server/config');
// const constants = require("next/dist/shared/lib/constants");
// const nextConfig = await loadConfig(
//     dev ? constants.PHASE_DEVELOPMENT_SERVER : constants.PHASE_PRODUCTION_SERVER,
//     dir
//   );
// const { serverRuntimeConfig, basePath } = nextConfig;
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use('/static', (req, res, next) => {
    const comfyDir = getComfyUIDir(); // 获取用户设置
    if (comfyDir) {
      express.static(comfyDir)(req, res, next); // 使用 express.static 服务
    }
  });

  // server.use('/static', express.static(path.join(__dirname, 'static')))

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})

function getComfyUIDir() {
    const configStr = fs.readFileSync(path.join(getAppDataDir(), '_config.json'), 'utf8') ;
    let comfyUIDir = path.join(getAppDataDir(), 'ComfyUI');
    if (configStr) {
        try {
            const appSetupConfig = JSON.parse(configStr).appSetupConfig;
            const config = JSON.parse(appSetupConfig);
            console.log(config);
            comfyUIDir = config.comfyUIDir;
        } catch(err) {
            console.log("parse config error", err);
        }
    }
    return comfyUIDir;
}

 function getAppDataDir() {
    const appDir = path.join(os.homedir(), 'comflowy');
    console.log("app DIr", appDir);
    return appDir;
}
