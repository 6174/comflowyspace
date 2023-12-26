import { comfyElectronApi } from "../lib/bridge"

export const ComfyUIStatusButton = () => {
    return (
      <div className="action action-comfyui-status" onClick={ev => {
        comfyElectronApi.windowTabManager.triggerAction({
          type: "open-comfyui-process-manager"
        })
      }}>
        ComfyUI
      </div>
    )
}