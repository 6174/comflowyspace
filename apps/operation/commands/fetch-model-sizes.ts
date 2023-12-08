import fs from 'fs';
import {models} from "@comflowy/node/src/modules/model-manager/models";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";

let modelUrls: {url: string, [key: string]: string}[] = models;

type ModelWithSize = { url: string;  size: string; [key: string]: string };

const proxy_url = "http://127.0.0.1:7890"
async function fetchSize(url: string) {
    const response = await fetch(url, { 
        method: 'HEAD',
        agent: new HttpsProxyAgent(proxy_url)  // 使用代理服务器
    });

    const sizeInBytes = response.headers.get('content-length');

    if (sizeInBytes) {
        const sizeInM = (Number(sizeInBytes) / (1024 * 1024)).toFixed(2);
        return `${sizeInM}M`;
    } else {
        return 'Unknown size';
    }
}

const path = require("path");
export async function fetchModelSize() {
    let modelsWithSize: ModelWithSize[] = [];

    for (let model of modelUrls) {
        console.log(`Start Processed ${model.url}`);
        const size = await fetchSize(model.url);
        const modelWithSize: ModelWithSize = { ...model, size };
        modelsWithSize.push(modelWithSize);
        fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(modelsWithSize, null, 2));
    }
    console.log('Finished, data written to output.json');
}
