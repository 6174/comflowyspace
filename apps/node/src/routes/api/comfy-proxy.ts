import { Request, Response, Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from "../../modules/utils/logger";
import { comfyuiService } from "../../modules/comfyui/comfyui.service";
import { channelService } from '../../modules/channel/channel.service';

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


let cached_object_info: any = null;

async function updateObjectInfo() {
    const res = await fetch('http://127.0.0.1:8188/object_info')
    const data = await res.json();
    cached_object_info = data
    return data
}

comfyuiService.comfyUIStartedSuccessEvent.on(async () => {
    try {
        console.log("update comfyui object info");
        const data = await updateObjectInfo();
        channelService.emit('comfyui', { type: 'object_info_updated', payload: data});
        console.log("update comfyui object info success");
    } catch(err) {
        console.log(err);
    }
});

export async function ApiGetObjectInfo(req: Request, res: Response) {
    try {
        try {
            const data = await updateObjectInfo();
            return res.status(200).send(data);
        } catch(err) {
            if (cached_object_info) {
                res.status(200).send(cached_object_info);
                return
            }
        }
    } catch(err: any) {
        logger.error(err.message + ":" + err.stack);
        res.status(500).send({
            success: false,
            error: err.message
        });
    }
}