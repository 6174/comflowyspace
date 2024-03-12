import * as React from 'react'
import {BootStrapTaskType, BootstrapTask, useDashboardState} from "@comflowy/common/store/dashboard-state";
import styles from "./bootstrap.style.module.scss";
import { InstallConda } from './install-conda';
import { InstallPython } from './install-python';
import { InstallGit } from './install-git';
import { InstallTorch } from './install-torch';
import { InstallModels } from './install-models';
import { InstallExtensions } from './install-extensions';
import { StartComfyUI } from './start-comfyui';
import { SetupConfig } from './setup-config';
import { InstallComfyUI } from './install-comfyui';
import LogoSvg from "ui/icons/logo";
import BgSVG from "./background.svg";
import { Alert, Spin } from "antd";
import { openExternalURL } from '@/lib/electron-bridge';
import { track } from '@/lib/tracker';
import { LogViewer } from 'ui/log-viewer/log-viewer';
import { Log } from '../comflowy-console/log-types/log';
import { ComflowyConsoleLogTypes } from '@comflowy/common/types/comflowy-console.types';
import { isWindow } from 'ui/utils/is-window';
const Bootstrap = () => {
  const {bootstrapTasks} = useDashboardState();
  console.log("bootstrap", bootstrapTasks);
  const finisedTasks = bootstrapTasks.filter(task => task.finished);
  const unfinishedTasks = bootstrapTasks.filter(task => !task.finished);
  const currentTask = unfinishedTasks[0];

  let $task = null;
  let isSetup = false;
  if (currentTask) {
    switch (currentTask.type) {
      case BootStrapTaskType.setupConfig:
        $task = <SetupConfig/>;
        isSetup = true;
        break;
      case BootStrapTaskType.installConda:
        $task = <InstallConda/>;
        break;
      case BootStrapTaskType.installPython:
        $task = <InstallPython/>;
        break;
      case BootStrapTaskType.installTorch:
        $task = <InstallTorch/>;
        break;
      case BootStrapTaskType.installGit:
        $task = <InstallGit/>;
        break;
      case BootStrapTaskType.installComfyUI:
        $task = <InstallComfyUI/>;
        break;
      case BootStrapTaskType.installBasicModel:
        $task = <InstallModels/>;
        break;
      case BootStrapTaskType.installBasicExtension:
        $task = <InstallExtensions/>;
        break;
      case BootStrapTaskType.startComfyUI:
        $task = <StartComfyUI/>;
        break;
      default:
        break;
    }
  }

  const bootstrapMessages = useDashboardState(state => state.bootstrapMessages);

  return (
    <div className={styles.bootstrap} style={{
      backgroundImage: `url(${BgSVG.src})`
    }}>
      <div className={`inner ${isSetup ? "setup-task" : ""}`}>
        <div className="logo">
          <h1><LogoSvg /> Comflowy</h1>
        </div>
        {currentTask ? (
          <>
            {!isSetup && <div><Spin /> {currentTask.title} ({finisedTasks.length + 1} / {bootstrapTasks.length})</div>}
            {$task}
          </>
        ) : (
          <>
            <Spin/> Preparing
          </>
        )}

        {bootstrapTasks.length > 0 && currentTask?.type !== BootStrapTaskType.setupConfig && (
          <>
            <LogViewer messages={bootstrapMessages}/>
            <div className="faq-link">
              <a onClick={ev=> {
                openExternalURL("https://www.comflowy.com/blog/comflowy-faq");
                track("bootstrap-faq-link-click");
              }}>Having trouble with installation? Check out our FAQ document for help &#x2192; </a>
            </div>
          </>
        )}
      </div>
      <BootstrapErrors />
    </div>
  )
}

function BootstrapErrors() {
  const errors = useDashboardState(state => state.errors);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (isWindow) {
      setVisible(true);
    }
  }, [])
  if (!visible) {
    return null;
  }
  return (
    <div className={styles.errors}>
      {errors.map((error, index) => (
        <Log key={index} title={error.title} log={{
          id: index + "",
          message: error.message,
          readed: false,
          data: {
            createdAt: error.createdAt,
            level: error.level || 'error',
            type: ComflowyConsoleLogTypes.BOOTSTRAP_ERROR,
          }
        }}>
          <div className="full-message">
            {error.message}
          </div>
        </Log>
      ))}
    </div>
  )
}

export default Bootstrap;
