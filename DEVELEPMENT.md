# Architecture

Comfyspace is a typical Client-Server app, for long term design, it can work as a cloud web app
and a electron app.

1. /apps/electron-backend: Electron App Related Code
2. /apps/electron-prontend: A next.js app as the front-layer for app
3. /apps/node: A node application to connect comfyUI and front-end
4. /apps/electron-package: Electron app builder 

# Development preparation

1. Git clone the repo
2. Install dependencies: `pnpm i` 
3. Start frontend dev server: `cd apps/electron-frontend` | `pnpm dev`
4. Start electron dev server: `cd apps/electron-backend` | `pnpm dev`

# Build App

[TODO]

