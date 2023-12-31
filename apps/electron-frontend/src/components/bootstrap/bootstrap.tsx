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
import { Spin } from "antd";
const Bootstrap = () => {
  const {bootstrapTasks} = useDashboardState();
  console.log("bootstrap", bootstrapTasks);
  const finisedTasks = bootstrapTasks.filter(task => task.finished);
  const unfinishedTasks = bootstrapTasks.filter(task => !task.finished);
  const currentTask = unfinishedTasks[0];

  // const seporator = <span>...</span>
  // const titles = useJoin<BootstrapTask>(bootstrapTasks, (task) => {
  //   return (
  //     <div className="task" key={task.title}>
  //       <Button type={task.finished ? "primary" : "default"}>{task.title}</Button>
  //     </div>
  //   )
  // }, seporator);

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
      </div>
    </div>
  )
}

export default Bootstrap;
