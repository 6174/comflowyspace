import { comfyElectronApi } from "../lib/bridge"

export const ComfyUIHelpButton = () => {
    return (
      <div className="action action-comfyui-queue" onClick={ev => {
        comfyElectronApi.openURL("https://discord.com/invite/cj623WvcVx");
      }}>
        <div className="icon">
          <svg
            width={24}
            height={25}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.572 16.513h.678c.113 0 .188-.076.188-.189v-4.369C5.438 8.4 8.143 6.094 12 6.094s6.562 2.305 6.562 5.861v4.37c0 .113.075.188.188.188h.678c.331 0 .58-.211.58-.528v-4.377c0-4.143-3.292-6.938-7.737-6.938h-.542c-4.445 0-7.737 2.795-7.737 6.938v4.377c0 .317.249.528.58.528zm2.456 2.908h.896c.904 0 1.44-.497 1.44-1.356v-3.443c0-.859-.536-1.356-1.44-1.356h-.896c-.505 0-.791.279-.791.768v4.618c0 .49.286.769.79.769zm9.055 0h.897c.504 0 .798-.279.798-.769v-4.618c0-.497-.294-.768-.798-.768h-.897c-.904 0-1.439.497-1.439 1.356v3.443c0 .859.535 1.356 1.44 1.356z"
              fill="#fff"
            />
          </svg>
        </div>
        Get help
      </div>
    )
}