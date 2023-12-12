import * as React from 'react'
import {BootStrapTaskType, useDashboardState} from "@comflowy/common/store/dashboard-state";
import styles from "./bootstrap.style.module.scss";
import { InstallConda } from './install-conda';
import { InstallPython } from './install-python';
import { InstallGit } from './install-git';
import { InstallTorch } from './install-torch';
import { InstallModels } from './install-models';
import { InstallExtensions } from './install-extensions';
import { StartComfyUI } from './start-comfyui';
import { SetupConfig } from './setup-config';

const Bootstrap = () => {
  const {onInit, env, loading, bootstrapTasks} = useDashboardState();
  console.log("bootstrap", bootstrapTasks);
  const finisedTasks = bootstrapTasks.filter(task => task.finished);
  const unfinishedTasks = bootstrapTasks.filter(task => !task.finished);
  const currentTask = unfinishedTasks[0];
  let $task = null;
  switch (currentTask.type) {
    case BootStrapTaskType.setupConfig:
      $task = <SetupConfig/>;
      break;
    case BootStrapTaskType.installConda:
      $task = <InstallConda/>;
      break;
    case BootStrapTaskType.installPython:
      $task = <InstallPython/>;
      break;
    case BootStrapTaskType.installGit:
      $task = <InstallGit/>;
      break;
    case BootStrapTaskType.installTorch:
      $task = <InstallTorch/>;
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
  return (
    <div className={styles.bootstrap}>
      <h1>Bootstrap tasks</h1>
      <p>{currentTask.title}...({finisedTasks.length + 1} / {bootstrapTasks.length})</p>
      {$task}
    </div>
  )
}

export default Bootstrap;
