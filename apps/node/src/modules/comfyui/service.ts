import * as nodePty from "node-pty"
import { SlotEvent } from "@comflowy/common/utils/slot-event";
import logger from "../utils/logger";
import { comfyExtensionManager } from "../comfy-extension-manager/comfy-extension-manager";
import { ComflowyConsole } from "../comflowy-console/comflowy-console";
import { TaskEventDispatcher } from "../task-queue/task-queue";
import { getCondaPaths, runCommand, runCommandWithPty } from "../utils/run-command";
import { getSystemProxy } from "../utils/env";
import { getComfyUIDir } from "../utils/get-appdata-dir";
let comfyuiProcess: nodePty.IPty | null;
let comfyuilogs: string = "";
let comfyuiprelogs: string = "";

/**
 * Get runtime logs in memory 
 * @returns 
 */
export function getComfyuiLogs() {
  return {
    comfyuilogs,
    comfyuiprelogs
  }
}

export type ComfyUIProgressEventType = {
  type: "START" | "RESTART" | "STOP" | "INFO" | "WARNING" | "ERROR" | "WARNING" | "TIMEOUT",
  message: string | undefined
}
export const comfyUIProgressEvent = new SlotEvent<ComfyUIProgressEventType>();

export async function startComfyUI(dispatcher: TaskEventDispatcher, pip: boolean = false): Promise<boolean> {
  const { PIP_PATH, PYTHON_PATH } = getCondaPaths();
  const { systemProxy, systemProxyString } = await getSystemProxy();
  if (comfyuiProcess) {
    return true;
  }
  comfyuiprelogs = comfyuilogs;
  try {
    logger.info("start comfyUI");
    comfyUIProgressEvent.emit({
      type: "INFO",
      message: systemProxy.http_proxy ? "Start ComfyUI With Proxy: " + systemProxyString : "Start ComfyUI Without Proxy"
    })
    const repoPath = getComfyUIDir();
    await new Promise((resolve, reject) => {
      const command = pip ? `${PIP_PATH} install -r requirements.txt ; ${PYTHON_PATH} main.py --enable-cors-header \r` : `${PYTHON_PATH} main.py --enable-cors-header \r`;
      let success = false;
      runCommandWithPty(command, (event => {
        if (event.message) {
          comfyuilogs += event.message;
          ComflowyConsole.consumeComfyUILogMessage(event.message);
        }

        dispatcher(event);

        const cevent: ComfyUIProgressEventType = {
          type: "INFO",
          message: event.message
        };

        if (event.message?.includes("To see the GUI go to: http://127.0.0.1:8188")) {
          dispatcher({
            type: "SUCCESS",
            message: "Comfy UI started success"
          })
          cevent.type = "START"
          cevent.message = "Comfy UI started success"
          success = true;
          resolve(null);
        }

        if (event.message?.includes("ERROR")) {
          cevent.type = "ERROR"
        }

        comfyUIProgressEvent.emit(cevent);
      }), {
        cwd: repoPath
      }, (process: nodePty.IPty) => {
        comfyuiProcess = process;
      });

      setTimeout(() => {
        if (!success) {
          comfyUIProgressEvent.emit({
            type: "TIMEOUT",
            message: "ComfyUI start timeout"
          });
          reject(new Error("ComfyUI start timeout"));
        }
      }, 60 * 1000);

    });

    // check comfyUI extensions
    const extensions = await comfyExtensionManager.getAllExtensions();
    const installedExtensions = extensions.filter((extension) => extension.installed);
    const msg = "All installed extensions: " + installedExtensions.map(ext => ext.title).join(",")
    logger.info(msg)
    comfyUIProgressEvent.emit({
      type: "INFO",
      message: msg
    })
  } catch (err: any) {
    const errMsg = `Start ComfyUI error: ${err.message}, ${err.stack}`
    comfyUIProgressEvent.emit({
      type: "ERROR",
      message: errMsg
    });
    logger.error(errMsg);
  }
  return true;
}

export async function stopComfyUI(): Promise<boolean> {
  try {
    if (comfyuiProcess) {
      console.log("before kill")
      comfyuiProcess.clear();
      comfyuiProcess.kill(); // 停止当前运行的 ComfyUI
      console.log("after kill")
      comfyuiProcess = null;
    }
    comfyUIProgressEvent.emit({
      type: "STOP",
      message: "STOP COMFYUI SUCCESS"
    });
  } catch (error: any) {
    const msg = `Error stopping comfyui: ${error.message}, ${error.stack}`
    logger.error(msg);
  }
  return true;
}

export async function isComfyUIAlive(): Promise<boolean> {
  try {
    await fetch("http://127.0.0.1:8188");
    return true;
  } catch (err: any) {
    logger.error('Error checking process:' + err.message + ":" + err.stack);
    return false;
  }
}

export async function restartComfyUI(dispatcher?: TaskEventDispatcher, pip = false): Promise<boolean> {
  try {
    comfyUIProgressEvent.emit({
      type: "RESTART",
      message: "Restart ComfyUI"
    });
    await stopComfyUI(); // 停止当前运行的 ComfyUI
    await startComfyUI(dispatcher ? dispatcher : (event) => null, pip); // 启动新的 ComfyUI
    comfyUIProgressEvent.emit({
      type: "RESTART",
      message: "Restart ComfyUI Success"
    })
  } catch (err: any) {
    throw new Error(`Error restarting comfyui: ${err.message}`);
  }
  return true;
}

export async function updateComfyUI(dispatcher: TaskEventDispatcher): Promise<boolean> {
  try {
    comfyUIProgressEvent.emit({
      type: "RESTART",
      message: "Try Update ComfyUI"
    });
    const repoPath = getComfyUIDir();
    await runCommand(`git pull`, (event => {
      dispatcher(event);
      const cevent: ComfyUIProgressEventType = {
        type: "INFO",
        message: event.message
      };
      comfyUIProgressEvent.emit(cevent);
    }), {
      cwd: repoPath
    });
    await restartComfyUI(dispatcher, true);
    logger.info("updateComfyUI: stopped");
  } catch (err: any) {
    logger.info(err);
    throw new Error(`Error restarting comfyui: ${err.message}`);
  }
  return true;
}