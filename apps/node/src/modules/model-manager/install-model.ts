import { TaskEventDispatcher } from "../task-queue/task-queue";
import { downloadUrl, downloadUrlPro } from "../utils/download-url";
import { getModelPath } from "./model-paths";
import * as fs from "fs";
import { MarketModel } from "./types";
import { isWindows } from "../utils/env";
import { runCommand } from "../utils/run-command";
import { getAppTmpDir } from "../utils/get-appdata-dir";
import path from "path";

/**
 * install a model
 * @param dispatch 
 * @param model 
 */
export async function installModel(dispatch: TaskEventDispatcher, model: MarketModel): Promise<boolean> {
    const modelPath = getModelPath(model);
    if (fs.existsSync(modelPath)) {
        dispatch({
            message: `${modelPath} already installed`
        });
        return true;
    }
    try {
        await downloadUrlPro(dispatch, modelPath, model.url)
        return true;
    } catch(err) {
        dispatch({
            message: `Dowload ${modelPath} error`,
            error: err,
        });
        return false;
    }
}

/**
 * Download a default model for user 
 * 1) check if there is already a default model in comfyUI folder
 * 2) if not, download a default model async from server use execCommand (consider windows and macOS)
 * 3) download step1: download model to tmp folder, if there is already a model ,skip this step 
 * 4) download step2: move model from tmp folder to comfyUI folder
 */
import * as fsExtra from "fs-extra";
import { checkIfInstalledComfyUI } from "../comfyui/bootstrap";
import { calculateSHA } from "../utils/sha";
import logger from "../utils/logger";

export async function downloadDefaultModel(): Promise<boolean> { 
    try {
        const modelConfig = {
            "name": "v1-5-pruned-emaonly.ckpt",
            "type": "checkpoints",
            "base": "SD1.5",
            "sha": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
            "save_path": "default",
            "description": "Stable Diffusion 1.5 base model",
            "reference": "https://huggingface.co/runwayml/stable-diffusion-v1-5",
            "filename": "v1-5-pruned-emaonly.ckpt",
            "url": "https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.ckpt",
            "size": "4067.78M"
        } as MarketModel;

        const finalOutputFile = getModelPath(modelConfig);

        if (await fsExtra.exists(finalOutputFile)) {
            return true;
        }

        const fileName = "v1-5-pruned-emaonly.ckpt";
        const tmpOutputFile = path.resolve(getAppTmpDir(), fileName);

        console.log(tmpOutputFile, finalOutputFile);

        if (await fsExtra.exists(tmpOutputFile)) {
            const sha = await calculateSHA(tmpOutputFile);
            if (sha === modelConfig.sha) {
                if (await checkIfInstalledComfyUI()) {
                    await fsExtra.move(tmpOutputFile, finalOutputFile);
                }
                return true;
            }
        }

        await downloadUrlPro((ev) => {
            console.log(ev);
        }, modelConfig.url, tmpOutputFile, modelConfig.sha);   
        
        console.log("download success");

        if (await checkIfInstalledComfyUI()) {
            await fsExtra.move(tmpOutputFile, finalOutputFile);
        }
        return true;
    } catch(err: any) {
        logger.error("Download default model error" + err.message + ":" + err.stack)
    }
    return false;
}