# Architecture

Comflowyspace is a typical Client-Server app, for long term design, it can work as a cloud web app
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

## node-pty rebuild 

If there are some problems happen related to node-pty, try to rebuild id on `electron-backend` project for your OS 
1. `cd apps/electron-backend`
2. `./node_modules/.bin/electron-rebuild --arc=arm64`

# Build App

Considering pnpm's package design, it can't work compatible with electron builders, so I 
create a new npm based folder to package app

1. Clean node_modules already installed in /apps/electron-package
2. Install dependencies: `npm i` 
3. Code signing: rename `.env.example` to `.env` and change your app signing params
4. Compile: `npm run compile` 
5. Make app: `npm run make`


