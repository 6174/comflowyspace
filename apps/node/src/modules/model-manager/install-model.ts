import { TaskEventDispatcher } from "../task-queue/task-queue";
import { downloadUrl, downloadUrlPro } from "../utils/download-url";
import { getModelPath } from "./model-paths";
import * as fs from "fs";
import { MarketModel } from "./types";

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