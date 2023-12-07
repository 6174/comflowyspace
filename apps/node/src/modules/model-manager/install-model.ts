import { TaskEventDispatcher } from "../task-queue/task-queue";
import { downloadUrl, downloadUrlPro } from "../utils/download-url";
import { MarketModel } from "./model-manager";
import { getModelPath } from "./model-paths";
import * as fs from "fs";

/**
 * install a model
 * @param dispatch 
 * @param model 
 */
export async function installModel(dispatch: TaskEventDispatcher, model: MarketModel) {
    const modelPath = getModelPath(model);
    if (fs.existsSync(modelPath)) {
        dispatch({
            message: `${modelPath} already installed`
        });
        return true;
    }
    try {
        await downloadUrlPro(dispatch, modelPath, model.url)
    } catch(err) {
        dispatch({
            message: `Dowload ${modelPath} error`,
            error: err,
        });
    }
}