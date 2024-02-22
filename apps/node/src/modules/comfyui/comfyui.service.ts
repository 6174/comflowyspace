import * as nodePty from "node-pty"
import { SlotEvent } from "@comflowy/common/utils/slot-event";
import logger from "../utils/logger";
import { ComflowyConsole } from "../comflowy-console/comflowy-console";
import { SHELL_ENV_PATH, runCommand, shell } from "../utils/run-command";
import { getComfyUIDir } from "../utils/get-appdata-dir";
import { getSystemProxy } from "../utils/env";
import { uuid } from "@comflowy/common";

export type ComfyUIProgressEventType = {
  type: "INPUT" | "OUTPUT" | "OUTPUT_WARPED" | "EXIT" | "START" | "RESTART" | "START_SUCCESS" | "STOP" | "INFO" | "WARNING" | "ERROR" | "WARNING" | "TIMEOUT",
  message: string | undefined
}

class ComfyuiService {
  pty?: nodePty.IPty;
  comfyuilogs: string = "";
  comfyuiprelogs: string = "";
  comfyuiSessionId: string = "";
  comfyuiProgressEvent = new SlotEvent<ComfyUIProgressEventType>();
  comfyUIStartedSuccessEvent = new SlotEvent<{session: string}>();
  inputEvent = new SlotEvent<{command: string}>();
  #comfyuiStarted:boolean = false;
  constructor() {
    /**
     * handling input data
     */
    this.inputEvent.on((event) => {
      this.write(event.command);
    });

    /**
     * handling output data
     */
    this.comfyuiProgressEvent.on((event) => {
      if (this.#comfyuiStarted) {
        if (event.type === "OUTPUT_WARPED" && event.message) {
          ComflowyConsole.consumeComfyUILogMessage(event.message);
          this.comfyuilogs += event.message;
          if (event.message?.includes("To see the GUI go to: http://127.0.0.1:8188")) {
            this.comfyuiProgressEvent.emit({
              type: "START_SUCCESS",
              message: "ComfyUI Started Success"
            })
            this.comfyUIStartedSuccessEvent.emit({
              session: this.comfyuiSessionId
            })
          }
        }
      }      
    });
  }

  /**
   * Start a node pty session for comfyUI service
   * @returns 
   */
  async startTerminal() {
    if (this.pty) {
      return
    }
    const { systemProxy } = await getSystemProxy();
    try {
      this.pty = nodePty.spawn(shell, [], {
        name: 'xterm-color',
        // conpty will cause Error: ptyProcess.kill() will throw a error that can't be catched
        useConpty: false,
        cols: 80,
        rows: 30,
        env: {
          ...process.env,
          ...systemProxy,
          PATH: SHELL_ENV_PATH,
          DISABLE_UPDATE_PROMPT: "true",
          encoding: 'utf-8',
        },
        cwd: getComfyUIDir()
      });

      let buffer = "";

      this.pty.onData((data: string) => {
        // raw output data
        this.comfyuiProgressEvent.emit({
          type: "OUTPUT",
          message: data,
        });

        // wrapped output data
        buffer += data;
        if (data.indexOf('\n') > 0) {
          logger.info("[ComfyUI Session Log:" + buffer + "]");
          
          this.comfyuiProgressEvent.emit({
            type: "OUTPUT_WARPED",
            message: buffer
          });
          buffer = "";
        }
      });

      this.pty.onExit((e: { exitCode: number }) => {
        this.#comfyuiStarted = false;
        this.comfyuiProgressEvent.emit({
          type: "EXIT",
          message: "Comfyui Exit:" + e.exitCode,
        });
        logger.info("Comfyui Exit:", e.exitCode);
      });
    } catch(err: any) {
      throw new Error("Start Session Failed:" + err.message)
    }
  };

  /**
   * stop comfyUI session
   */
  async stopTerminal() {
    this.pty?.kill();
  }

  /**
   * write command to comfyUI
   * @param command 
   */
  write(command: string) {
    console.log("write command", command);
    this.pty?.write(command);
  }

  /**
   * start comfyUI
   * @param pip 
   */
  async startComfyUI(pip: boolean = false): Promise<boolean> {
    try {
      this.comfyuiprelogs = this.comfyuilogs;
      this.comfyuilogs = "";
      if (this.#comfyuiStarted) {
        return true;
      }
      this.#comfyuiStarted = true;
      const id = this.comfyuiSessionId = uuid();
      await this.startTerminal();
      const command = this.#getComfyUIRunCommand(pip);
      this.write(command);
  
      await new Promise((resolve, reject) => {
        this.comfyUIStartedSuccessEvent.on((event) => {
          if (event.session === id) {
            resolve(null);
          }
        });
        setTimeout(() => {
          reject(new Error("ComfyUI start timeout"));
        }, 60 * 1000);
      });

      return true;
    } catch (err: any) {
      const errMsg = `Start ComfyUI error: ${err.message}, ${err.stack}`
      this.comfyuiProgressEvent.emit({
        type: "ERROR",
        message: errMsg
      });
      logger.error(errMsg);
      throw new Error(errMsg);
    }
  }

  /**
   * Run comfyUI command
   */
  #getComfyUIRunCommand(pip: boolean = false) {
    // const { PIP_PATH, PYTHON_PATH } = getCondaPaths();
    const command = pip ? `pip3 install -r requirements.txt; python3 main.py --enable-cors-header \r` : `python3 main.py --enable-cors-header \r`;
    return `cd ${getComfyUIDir()}; conda activate comflowy; ${command}`;
  }

  /**
   * stopComfyUI
   */
  async stopComfyUI() {
    this.pty?.write('\x03');
    this.#comfyuiStarted = false;
  }

  /**
   * restart comfyUI
   * @param pip 
   */
  async restartComfyUI(pip: boolean = false): Promise<boolean> {
    try {
      this.comfyuiProgressEvent.emit({
        type: "RESTART",
        message: "Restart ComfyUI"
      });
      await this.stopComfyUI();
      await this.startComfyUI(pip);
      this.comfyuiProgressEvent.emit({
        type: "RESTART",
        message: "Restart ComfyUI Success"
      })
      return true;
    } catch(err: any) {
      throw new Error(`Error restarting comfyui: ${err.message}`);
    }
  }

  /**
   * check if comfyUI is alive
   * @returns 
   */
  async updateComfyUI(): Promise<boolean> {
    try {
      this.comfyuiProgressEvent.emit({
        type: "RESTART",
        message: "Try Update ComfyUI"
      });
      const repoPath = getComfyUIDir();
      this.stopComfyUI();
      this.write(`cd ${repoPath}; git pull \r`);
      await this.startComfyUI(true);
      logger.info("updateComfyUI: stopped");
    } catch (err: any) {
      logger.error(err);
      throw new Error(`Error restarting comfyui: ${err.message}`);
    }
    return true;
  }

  async isComfyUIAlive(): Promise<boolean> {
    try {
      await fetch("http://127.0.0.1:8188");
      return true;
    } catch (err: any) {
      logger.error('Error checking process:' + err.message + ":" + err.stack);
      return false;
    }
  }

  /**
   * pip install packages
   */
  async pipInstall(requirements: string) {
    try {
      this.stopComfyUI();
      this.write(`conda activate comflowy; pip install ${requirements} \r`);
      this.startComfyUI(true);
    } catch(err: any) {
      logger.error("pip install error" + err.message);
    }
  }
}

export const comfyuiService = new ComfyuiService();

