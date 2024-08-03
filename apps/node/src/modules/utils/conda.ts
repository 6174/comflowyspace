import { execSync } from "child_process";
import { OS_HOME_DIRECTORY, SHELL_ENV_PATH, getSystemPath, isWindows } from "./env";
import path from "path";
import { CONDA_ENV_NAME, CONFIG_KEYS, appConfigManager } from "../config-manager";
import logger from "./logger";

export const DEFAULT_CONDA_PATH = isWindows ? 'C:\\tools\\Miniconda3' : `${OS_HOME_DIRECTORY}/miniconda3`;
export const DEFAULT_CONDA_ENV_PATH = isWindows ? `${DEFAULT_CONDA_PATH}\\envs\\${CONDA_ENV_NAME}` : `${DEFAULT_CONDA_PATH}/envs/${CONDA_ENV_NAME}`;

type CondaInfo = {
  // The conda install folder
  CONDA_ROOT: string,
  // The conda command path
  CONDA_PATH: string,
  CONDA_SCRIPTS_PATH: string
};

type CondaEnvInfo = {
  // The conda env path
  CONDA_ENV_PATH: string,
  // The conda env we use
  CONDA_ENV_NAME: string,
  // Python path location
  PYTHON_PATH: string,
  // Pip Path location
  PIP_PATH: string,
  CONDA_ENV_SCRIPTS_PATH: string,
};

class Conda {
  info?: CondaInfo;
  env?: CondaEnvInfo;
  /**
   * Init conda env
   */
  updateCondaInfo () {
    // 如果有配置本地自定义的 python 环境，那么就简单设置 PYTHON 和 PIP 就好
    this.info = getCondaInfo();
    this.env = getCondaEnv(CONDA_ENV_NAME, this.info!);
    console.log("env", this.info, this.env);
    logger.info("update conda info" + JSON.stringify(this.info) + JSON.stringify(this.env));

    const {pythonPath} = appConfigManager.getSetupConfig();
    if (pythonPath && pythonPath !== "") {
      logger.info("use custom env python: ", pythonPath)
      this.env!.PYTHON_PATH = pythonPath;
      this.env!.PIP_PATH = `${pythonPath} -m pip`;
    }
  }

  getCondaPaths(): CondaInfo & CondaEnvInfo {
    return {
      ...this.env!,
      ...this.info!
    };
  }
}

export const conda = new Conda();
conda.updateCondaInfo();

/**
 * get conda env path
 */
export function getCondaEnv(env: string, condaInfo: CondaInfo): CondaEnvInfo | undefined {
  const SHELL_ENV_PATH = getSystemPath({
    CONDA_SCRIPTS_PATH: condaInfo.CONDA_SCRIPTS_PATH,
    CONDA_ENV_PATH: DEFAULT_CONDA_ENV_PATH
  });
  try {
    const result = execSync(`conda info --envs`, {
      env: {
        ...process.env,
        PATH: SHELL_ENV_PATH,
        Path: SHELL_ENV_PATH
      },
      encoding: 'utf-8',

    });
    // console.log("result", result);
    const lines = result.toString().split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(env)) {
        const CONDA_ENV_PATH = line.split(/\s+/).filter(w => w !== "*")[1].trim();
        if (isWindows) {
          return {
            CONDA_ENV_PATH,
            PYTHON_PATH: `${CONDA_ENV_PATH}\\python.exe`,
            PIP_PATH: `${CONDA_ENV_PATH}\\Scripts\\pip.exe`,
            CONDA_ENV_SCRIPTS_PATH: `${CONDA_ENV_PATH}\\Scripts`,
            CONDA_ENV_NAME: env
          }
        }
        return {
          CONDA_ENV_PATH,
          PYTHON_PATH: `${CONDA_ENV_PATH}/bin/python`,
          PIP_PATH: `${CONDA_ENV_PATH}/bin/pip`,
          CONDA_ENV_SCRIPTS_PATH: `${CONDA_ENV_PATH}/bin`,
          CONDA_ENV_NAME: env
        }
      }
    }
  } catch (err) {
    console.log("get conda env path error", err);
    return undefined
  }
}

/**
 * Parse Conda path
 * @returns 
 */
export function getCondaInfo(): CondaInfo {
  // if user already install conda, conda_prefix is the location of conda root;
  const conda = getCondaPrefixSync();
  const CONDA_ROOT = conda ? conda : DEFAULT_CONDA_PATH;

  if (isWindows) {
    return {
      CONDA_ROOT,
      CONDA_SCRIPTS_PATH: `${CONDA_ROOT}\\Scripts`,
      CONDA_PATH: `${CONDA_ROOT}\\Scripts\\conda.exe`,
    }
  }

  return {
    CONDA_ROOT,
    CONDA_SCRIPTS_PATH: `${CONDA_ROOT}/bin`,
    CONDA_PATH: `${CONDA_ROOT}/condabin/conda`,
  }

  /**
   * Get real conda path position
   * @returns 
   */
  function getCondaPrefixSync(): string | undefined {
    const SHELL_ENV_PATH = getSystemPath({
      CONDA_SCRIPTS_PATH: DEFAULT_CONDA_PATH,
      CONDA_ENV_PATH: DEFAULT_CONDA_ENV_PATH
    });
    console.log("Use custom shell path to resolve conda", SHELL_ENV_PATH);

    let ret;
    try {
      const result = execSync(`conda info --base`, {
        env: {
          ...process.env,
          PATH: SHELL_ENV_PATH,
          Path: SHELL_ENV_PATH
        },
        encoding: 'utf-8',
      });
      ret = result.toString().trim();
    } catch (err1: any) {
      console.log("get conda default prefix error", err1);
    }

    if (ret && ret !== "") {
      return ret;
    }

    console.log("Try Use default PATH to resolve conda", process.env.PATH);

    try {
      const result = execSync(`conda info --base`, {
        env: {
          ...process.env,
          PATH: process.env.PATH,
          Path: process.env.PATH
        },
        encoding: 'utf-8',
      });
      ret = result.toString().trim();
    } catch (err2: any) {
      console.log("get conda default prefix error", err2);
      logger.error("Get conda prefix error: " + err2.message)
    }

    if (ret && ret !== "") {
      console.log("Find default conda path", ret);
    }
    return ret;
  }
}


