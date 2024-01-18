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
  const [selectedIfInstalledComfyUI, setSelectedIfInstalledComfyUI] = useState(false);
  const [installedComfyUI, setInstalledComfyUI] = useState(false);

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
            installedComfyUI,
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
  }, [value, sdwebuiPath, bootstrapTasks, task, installedComfyUI]);

  if (!selectedIfInstalledComfyUI) {
    return (
      <div className="SetupConfig ">
        <div className="field select-if-installed-comfyui">
          <div className={`card ${installedComfyUI ? "": "active"}`} onClick={ev => {
            setInstalledComfyUI(false);
          }}>
            <div className="card-inner">
              <div className="icon">
                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M27 27.6215C27.4237 27.6215 27.7966 27.4859 28.2204 27.0791L33.8988 21.6041C34.1869 21.316 34.3564 21.0108 34.3564 20.5871C34.3564 19.7904 33.7123 19.2311 32.9326 19.2311C32.5427 19.2311 32.1529 19.3836 31.8817 19.6887L29.5086 22.2143L28.4577 23.4686L28.5933 20.943V6.53526C28.5933 5.68774 27.8814 4.97583 27 4.97583C26.1355 4.97583 25.4236 5.68774 25.4236 6.53526V20.943L25.5422 23.4686L24.4913 22.2143L22.1352 19.6887C21.864 19.3836 21.4572 19.2311 21.0673 19.2311C20.2876 19.2311 19.6605 19.7904 19.6605 20.5871C19.6605 21.0108 19.813 21.316 20.1012 21.6041L25.7965 27.0791C26.2033 27.4859 26.5932 27.6215 27 27.6215ZM12.4905 44.3345H41.4925C45.1707 44.3345 47.0861 42.4361 47.0861 38.8087V29.0962C47.0861 27.3842 46.8658 26.5367 46.086 25.4688L40.4585 17.8581C38.4923 15.1799 37.1193 13.8917 34.0174 13.8917H31.7291V16.6716H34.1869C35.3734 16.6716 36.56 17.6547 37.3058 18.6547L43.0689 26.6892C43.6452 27.452 43.4418 27.774 42.5773 27.774H32.458C31.4749 27.774 31.0341 28.452 31.0341 29.1809V29.2487C31.0341 31.2319 29.4917 33.3676 27 33.3676C24.5083 33.3676 22.9658 31.2319 22.9658 29.2487V29.1809C22.9658 28.452 22.5251 27.774 21.542 27.774H11.4226C10.5412 27.774 10.3717 27.4011 10.9141 26.6892L16.6772 18.6547C17.44 17.6547 18.6265 16.6716 19.813 16.6716H22.2708V13.8917H19.9656C16.8637 13.8917 15.5076 15.1799 13.5414 17.8581L7.89694 25.4688C7.11722 26.5367 6.91382 27.3842 6.91382 29.0962V38.8087C6.91382 42.4361 8.82921 44.3345 12.4905 44.3345Z" fill="white" />
                </svg>
              </div>
              <div className="title">
                I never install ComfyUI before
              </div>
            </div>
          </div>
          <div className={`card ${installedComfyUI ? "active" : ""}`} onClick={ev => {
            setInstalledComfyUI(true);
          }}>
            <div className="card-inner">
              <div className="icon">
                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.4905 41.1818H41.4925C45.1707 41.1818 47.0861 39.2833 47.0861 35.656V26.1638C47.0861 24.2653 46.8149 23.4517 45.9335 22.2991L40.3738 14.8918C38.3906 12.2645 37.3566 11.5356 34.3056 11.5356H19.6944C16.6264 11.5356 15.5924 12.2645 13.6262 14.8918L8.04949 22.2991C7.18502 23.4517 6.91382 24.2653 6.91382 26.1638V35.656C6.91382 39.2833 8.82921 41.1818 12.4905 41.1818ZM27 30.7573C24.4235 30.7573 22.8132 28.7063 22.8132 26.5875V26.4519C22.8132 25.6722 22.3386 24.9264 21.3725 24.9264H11.1684C10.5412 24.9264 10.4395 24.4179 10.7276 24.0111L16.9145 15.7054C17.6264 14.7223 18.5248 14.3494 19.6774 14.3494H34.3225C35.4582 14.3494 36.3566 14.7223 37.0854 15.7054L43.2553 24.0111C43.5435 24.4179 43.4418 24.9264 42.8146 24.9264H32.6105C31.6444 24.9264 31.1867 25.6722 31.1867 26.4519V26.5875C31.1867 28.7063 29.5764 30.7573 27 30.7573ZM34.1022 16.875H19.9147C19.4401 16.875 19.0842 17.2479 19.0842 17.7056C19.0842 18.1802 19.4401 18.5361 19.9147 18.5361H34.1022C34.5598 18.5361 34.9158 18.1802 34.9158 17.7056C34.9158 17.2479 34.5598 16.875 34.1022 16.875ZM36.3057 20.6549H17.6942C17.2027 20.6549 16.8298 21.0787 16.8298 21.5363C16.8298 22.011 17.2027 22.4008 17.6942 22.4008H36.3057C36.7973 22.4008 37.1702 22.011 37.1702 21.5363C37.1702 21.0787 36.7973 20.6549 36.3057 20.6549Z" fill="white" />
                </svg>
              </div>
              <div className="title">
                I've installed ComfyUI before
              </div>
            </div>
          </div>
        </div>
        <div className="field">
          <Button onClick={() => {
            setSelectedIfInstalledComfyUI(true);
          }} style={{
            float: "right"
          }} type="primary" >
            Next Step
          </Button>
        </div>
      </div>
    )
  }

  if (installedComfyUI) {
    return (
      <div className="SetupConfig">
        <div className="field">
          <div className="field-label" style={{
            marginBottom: "10px"
          }}>Select your comfyUI path</div>
          <div className="description">
            You can select the ComfyUI path you have installed before to reuse existing extensions and models.
          </div>
          <div className="input-wrapper">
            <Input disabled={electronEnv} value={value} />
          </div>
          <Space>
            { electronEnv && <Button onClick={selectFolder}> <FolderIcon/> Select folder</Button>}
          </Space>
        </div>

        <div className="field buttons">
          <Space>
            <Button onClick={() => {
              setSelectedIfInstalledComfyUI(false);
            }}>
             Back
            </Button>
            <Button onClick={saveValue} type="primary" loading={loading} disabled={loading}>
              Next
            </Button>
          </Space>
        </div>
      </div>
    )
  }

  return (
    <div className="SetupConfig">
      <div className="field">
        <div className="field-label" style={{
          marginBottom: "10px"
        }}>ComfyUI will be installed at:</div>
        <div className="description">
          You can select a folder to install ComfyUI, or just use the default path.
        </div>
        <div className="input-wrapper">
          <Input disabled={electronEnv} value={value} />
        </div>
        <Space>
          { electronEnv && <Button onClick={selectFolder}> <FolderIcon/> Select folder</Button>}
          <Button disabled={value === defaultValue} onClick={useDefaultFolder}>Use Default</Button>
        </Space>
      </div>
      <div className="field buttons">
        <Space>
          <Button onClick={() => {
            setSelectedIfInstalledComfyUI(false);
          }}>
            Back
          </Button>
          <Button onClick={saveValue} type="primary" loading={loading} disabled={loading}>
            Next
          </Button>
        </Space>
      </div>
    </div>
  )
}

/* 
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
</div> */