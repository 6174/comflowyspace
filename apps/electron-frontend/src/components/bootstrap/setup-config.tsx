import { comfyElectronApi } from "@/lib/electron-bridge";
import { getBackendUrl } from "@comflowy/common/config";
import { BootStrapTaskType, useDashboardState } from "@comflowy/common/store/dashboard-state";
import { Alert, Button, Input, Space, message } from "antd";
import { useCallback, useEffect, useState } from "react";

export function SetupConfig() {
  const {bootstrapTasks, setBootstrapTasks} = useDashboardState();
  const task = bootstrapTasks.find(task => task.type === BootStrapTaskType.setupConfig);
  const [defaultValue, setDefaultValue] = useState("");
  const [value, setValue] = useState("");
  useEffect(() => {
    const promise = comfyElectronApi.selectHomeDir();
    promise.then((ret: string) => {
      const value = ret + "/.comflowy/ComfyUI";
      setDefaultValue(value);
      setValue(value);
    }).catch(err => {
      message.error(err);
    });
  }, []);
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
  const useDefaultFolder = useCallback(() => {
      setValue(defaultValue);
  }, [value, defaultValue]);

  const [loading, setLoading] = useState(false);
  const saveValue = useCallback(async () => {
    const config = {
      comfyUIDir: value
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
      }
    } catch(err) {
      console.log(err);
      message.error(err);
    }
    setLoading(false);
  }, [value, bootstrapTasks, task]);

  return (
    <div className="SetupConfig">
      <div className="field">
        <Alert message="If you already installed comfyUI, you can choose the exist comfyUI path" type="info" showIcon />
        <br />
        <div className="field-label" style={{
          marginBottom: "10px"
        }}>ComfyUI Path:</div>
        <Space>
          <Input disabled value={value} style={{width: 400}}/>
          <Button type="link" onClick={selectFolder}>Select folder..</Button>
          <Button type="link" disabled={value === defaultValue} onClick={useDefaultFolder}>Use Default</Button>
        </Space>
      </div>
      <div className="field">
        <Button onClick={saveValue} type="primary" loading={loading} disabled={loading}>Save</Button>
      </div>
    </div>
  )
}