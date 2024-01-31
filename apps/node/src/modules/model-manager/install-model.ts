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
            "name": "v1-5-dream-shaper.ckpt",
            "type": "checkpoints",
            "base": "SD1.5",
            "sha": "879DB523C30D3B9017143D56705015E15A2CB5628762C11D086FED9538ABD7FD",
            "save_path": "default",
            "description": "Stable Diffusion 1.5 DreamShaper ",
            "reference": "https://civitai.com/models/4384?modelVersionId=128713",
            "filename": "v1-5-dream-shaper.ckpt",
            "url": "https://civitai.com/api/download/models/128713",
            "size": "4067.78M"
        } as MarketModel;

        const finalOutputFile = getModelPath(modelConfig);

        if (await fsExtra.exists(finalOutputFile)) {
            return true;
        }

        const fileName = "v1-5-dream-shaper.ckpt";
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

        if (isWindows) {
            // For Windows
            const downloadCommand = `powershell -c "Start-BitsTransfer -Source ${modelConfig.url} -Destination '${tmpOutputFile}' -Restartable"`;
            await runCommand(downloadCommand, (ev) => {
                console.log(ev);
            });
        } else {
            // For Mac
            // -C - means continue download if file already exists
            const downloadCommand = `curl -L -C - ${modelConfig.url} --output ${tmpOutputFile}`;
            await runCommand(downloadCommand, (ev) => {
                console.log(ev);
            });
        }

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
