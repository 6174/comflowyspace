import { comfyElectronApi, isElectron, useIsElectron } from "@/lib/electron-bridge";
import { getBackendUrl } from "@comflowy/common/config";
import { BootStrapTaskType, useDashboardState } from "@comflowy/common/store/dashboard-state";
import { Alert, Button, Input, Space, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { FolderIcon, SaveIcon } from "ui/icons";

export function SetupConfig() {
  const {bootstrapTasks, setBootstrapTasks} = useDashboardState();
  const task = bootstrapTasks.find(task => task.type === BootStrapTaskType.setupConfig);
  const [defaultValue, setDefaultValue] = useState("");
  const [value, setValue] = useState("");
  const [sdwebuiPath, setSDWebuiPath] = useState("");
  const electronEnv = useIsElectron();

  useEffect(() => {
    if (electronEnv) {
      const promise = comfyElectronApi.selectHomeDir();
      promise.then((ret: string) => {
        const value = ret + "/comflowy/ComfyUI";
        setDefaultValue(value);
        setValue(value);
      }).catch(err => {
        message.error(err);
      });
    }
  }, [electronEnv]);

  const selectFolder = useCallback(async () => {
    try {
      const ret = await comfyElectronApi.selectDirectory();
      const folder = ret[0];
      setValue(folder);
    } catch(err) {
      console.log(err);
      message.error(err);
    }
  }, []);

  const selectSdWebUIFolder = useCallback(async () => {
    try {
      const ret = await comfyElectronApi.selectDirectory();
      const folder = ret[0];
      setSDWebuiPath(folder);
    } catch (err) {
      console.log(err);
      message.error(err);
    }
  }, []);

  
  const useDefaultFolder = useCallback(() => {
      setValue(defaultValue);
  }, [value, defaultValue]);

  const [loading, setLoading] = useState(false);
  const saveValue = useCallback(async () => {
    const config = {
      comfyUIDir: value.trim(),
      stableDiffusionDir: sdwebuiPath.trim()
    };
    const api = getBackendUrl('/api/setup_config');
    try {
      setLoading(true);
      const ret = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: config
        })
      });
      const data = await ret.json();
      if (data.success) {
        // message.success("Setup success");
        task.finished = true;
        const isComfyUIInstalled = data.isComfyUIInstalled;
        if (isComfyUIInstalled) {
          const installComfyTask = bootstrapTasks.find(task => task.type === BootStrapTaskType.installComfyUI);
          installComfyTask.finished = true;
        }
        setBootstrapTasks([...bootstrapTasks]);
      } else {
        message.error("Setup failed: " + data.error);
      }
    } catch(err) {
      console.log(err);
      message.error(err);
    }
    setLoading(false);
  }, [value, sdwebuiPath, bootstrapTasks, task]);

  return (
    <div className="SetupConfig">
      <div className="field">
        <div className="field-label" style={{
          marginBottom: "10px"
        }}>ComfyUI Path:</div>
        <div className="description">
          If you have already installed ComfyUI, you can select from the existing ComfyUI paths.
        </div>
        <div className="input-wrapper">
          <Input disabled={electronEnv} value={value} />
        </div>
        <Space>
          { electronEnv && <Button onClick={selectFolder}> <FolderIcon/> Select folder</Button>}
          <Button disabled={value === defaultValue} onClick={useDefaultFolder}>Use Default</Button>
        </Space>
      </div>

      <div className="field">
        <div className="field-label" style={{
          marginBottom: "10px"
        }}>SD WebUI Path:</div>
        <div className="description">
          If Stable Diffusion WebUI is already installed, you can opt for the SD path to utilize existing models
        </div>
        <div className="input-wrapper">
          <Input value={sdwebuiPath} placeholder="Input sd webui path if exists"/>
        </div>
        <Space>
          {electronEnv && <Button onClick={selectSdWebUIFolder}><FolderIcon /> Select folder</Button>}
        </Space>
      </div>

      <div className="field">
        <Button onClick={saveValue} style={{
          float: "right"
        }} type="primary" loading={loading} disabled={loading}>
          <SaveIcon/> Save
        </Button>
      </div>
    </div>
  )
}