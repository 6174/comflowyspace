import * as nodePty from "node-pty"
import { SlotEvent } from "@comflowy/common/utils/slot-event";
import logger from "../utils/logger";
import { ComflowyConsole } from "../comflowy-console/comflowy-console";
import { runCommand, shell } from "../utils/run-command";
import { getComfyUIDir } from "../utils/get-appdata-dir";
import { getSystemPath, getSystemProxy, isWindows } from "../utils/env";
import { uuid } from "@comflowy/common";
import { conda } from "../utils/conda";
import { ComfyUIRunPrecisionMode, ComfyUIRunVAEMode } from "@comflowy/common/types";
import { getPythonPackageRequirements } from "./requirements";

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
      if (event.type === "OUTPUT_WARPED" && event.message) {
        if (event.message?.includes("ComfyUI start up time")) {
          this.#comfyuiStarted = true;
        }

        if (this.#comfyuiStarted) {
          ComflowyConsole.consumeComfyUILogMessage(event.message);
          this.comfyuilogs += event.message;
        }

        if (event.message?.includes("To see the GUI go to: http://127.0.0.1:8188")) {
          this.comfyuiProgressEvent.emit({
            type: "START_SUCCESS",
            message: "ComfyUI Started Success"
          })
          this.comfyUIStartedSuccessEvent.emit({
            session: this.comfyuiSessionId
          })
        }
        
        if (event.message?.includes("Stopped server")) {
          this.#comfyuiStarted = false;
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
    const SHELL_ENV_PATH = getSystemPath({
      CONDA_SCRIPTS_PATH: conda.info?.CONDA_SCRIPTS_PATH || "",
      CONDA_ENV_PATH: conda.env?.CONDA_ENV_PATH || ""
    });
    try {

      const env: any = {
        ...process.env,
        ...systemProxy,
        PATH: SHELL_ENV_PATH,
        Path: SHELL_ENV_PATH,
        DISABLE_UPDATE_PROMPT: "true",
        encoding: 'utf-8',
      };

      // await runCommand("conda init");

      this.pty = nodePty.spawn(shell, [], {
        name: 'xterm-color',
        // conpty will cause Error: ptyProcess.kill() will throw a error that can't be catched
        useConpty: false,
        cols: 80,
        rows: 30,
        env,
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

      // this.pty.write(this.getCondaInitCommand());

    } catch(err: any) {
      logger.error(`Start Termnal Failed: ${err.message}, ${err.stack}`);
      throw new Error("Start Session Failed:" + err.message + err.stack);
    }
  };

  // getCondaInitCommand(): string {
  //   let condaInitCommand = "conda init zsh;";
  //   let shellActivateCommand = "source ~/.zshrc;";
  //   if (isWindows) {
  //     shellActivateCommand = '. $PROFILE;';
  //     condaInitCommand = `conda init powershell;`;
  //   }
  //   return `${condaInitCommand} ${shellActivateCommand}`;
  // }

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
  async startComfyUI(pip: boolean = true, fpmode: ComfyUIRunPrecisionMode = 'normal', vaemode: ComfyUIRunVAEMode = 'normal'): Promise<boolean> {
    try {
      this.comfyuiprelogs = this.comfyuilogs;
      this.comfyuilogs = "";
      if (this.#comfyuiStarted) {
        return true;
      }
      this.#comfyuiStarted = true;
      console.log("startted");
      const id = this.comfyuiSessionId = uuid();
      await this.startTerminal();
      const command = this.#getComfyUIRunCommand(pip, fpmode, vaemode);
      this.write(command);
  
      await new Promise((resolve, reject) => {
        this.comfyUIStartedSuccessEvent.on((event) => {
          if (event.session === id) {
            resolve(null);
          }
        });
        setTimeout(() => {
          this.comfyuiProgressEvent.emit({
            type: "TIMEOUT",
            message: "Start ComfyUI timed out"
          });
          reject(false);
        }, pip ? 60 * 1000 * 30: 60 * 1000 * 5);
      });

      return true;
    } catch (err: any) {
      const errMsg = `Start ComfyUI error: ${err.message} ${err.stack}`
      this.comfyuiProgressEvent.emit({
        type: "ERROR",
        message: errMsg
      });
      logger.error(errMsg);
      throw new Error(err.message);
    }
  }

  /**
   * Run comfyUI command
   */
  #getComfyUIRunCommand(pip: boolean = true, mode: ComfyUIRunPrecisionMode = "normal", vaemode: ComfyUIRunVAEMode) {
    const { PIP_PATH, PYTHON_PATH } = conda.getCondaPaths();
    const requirements = getPythonPackageRequirements();

    // Default command with no extra options
    let command = `${PIP_PATH} install -r requirements.txt; ${PIP_PATH} install mpmath==1.3.0 ${requirements}; ${PYTHON_PATH} main.py --enable-cors-header`;

    // Adjust command based on selected mode
    if(mode === 'fp16') {
      command += ' --force-fp16';
    } else if(mode === 'fp32') {
      command += ' --force-fp32';
    }

    if(vaemode === 'fp16') {
      command += ' --fp16-vae';
    } else if(vaemode === 'fp32') {
      command += ' --fp32-vae';
    }

    return `cd ${getComfyUIDir()}; ${command} \r`;
  }

  /**
   * stopComfyUI
   */
  stopComfyUI() {
    this.pty?.write('\x03');
    this.#comfyuiStarted = false;
  }

  /**
   * restart comfyUI
   * @param pip 
   */
  async restartComfyUI(pip: boolean = true, fpmode: ComfyUIRunPrecisionMode = 'normal', vaemode: ComfyUIRunVAEMode = 'normal'): Promise<boolean> {
    try {
      this.comfyuiProgressEvent.emit({
        type: "RESTART",
        message: "Restart ComfyUI"
      });
      this.stopComfyUI();
      await new Promise(resolve => setTimeout(resolve, isWindows ? 1000 : 100));
      await this.startComfyUI(pip, fpmode, vaemode);
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
      const { PIP_PATH, PYTHON_PATH } = conda.getCondaPaths();
      this.stopComfyUI();
      this.write(`${PIP_PATH} install ${requirements} \r`);
      this.startComfyUI(true);
    } catch(err: any) {
      logger.error("pip install error" + err.message);
    }
  }
}

export const comfyuiService = new ComfyuiService();

