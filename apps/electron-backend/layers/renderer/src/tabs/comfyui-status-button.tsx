import { comfyElectronApi } from "../lib/bridge"

export const ComfyUIStatusButton = () => {
    return (
      <div className="action action-comfyui-status" onClick={ev => {
        comfyElectronApi.windowTabManager.triggerAction({
          type: "open-comfyui-process-manager"
        })
      }}>
        <div className="icon">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 16H14M9 11L12 13.5L9 16M5 16.8V9.2C5 8.08 5 7.52 5.218 7.092C5.41 6.715 5.715 6.41 6.092 6.218C6.52 6 7.08 6 8.2 6H19.8C20.92 6 21.48 6 21.907 6.218C22.284 6.41 22.59 6.715 22.782 7.092C23 7.519 23 8.079 23 9.197V16.803C23 17.921 23 18.48 22.782 18.907C22.59 19.2837 22.2837 19.59 21.907 19.782C21.48 20 20.921 20 19.803 20H8.197C7.079 20 6.519 20 6.092 19.782C5.71558 19.5899 5.40963 19.2836 5.218 18.907C5 18.48 5 17.92 5 16.8Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        Terminal
        {/* <div className="status">
          <div className="span"></div>
        </div> */}
      </div>
    )
}