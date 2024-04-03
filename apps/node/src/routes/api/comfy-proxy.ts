import { Express } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';

export function setupComfyUIProxy(app: Express) {
    const proxyMiddleware = createProxyMiddleware('/comfyui', {
        target: 'http://127.0.0.1:8188',
        changeOrigin: true,
        ws: true,
        pathRewrite: (path, req) => {
            return path.replace(/^\/comfyui/, '');
        },
    });

    app.use('/comfyui', proxyMiddleware);
}