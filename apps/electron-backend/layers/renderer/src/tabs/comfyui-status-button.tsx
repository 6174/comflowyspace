import { comfyElectronApi } from "../lib/bridge"

export const ComfyUIStatusButton = () => {
    return (
      <div className="action action-comfyui-status" onClick={ev => {
        comfyElectronApi.windowTabManager.triggerAction({
          type: "open-comfyui-process-manager"
        })
      }}>
        <div className="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 18.5C6.94772 18.5 6.5 18.0523 6.5 17.5V5.5C6.5 4.94772 6.94772 4.5 7.5 4.5H15.6C16.1523 4.5 16.6 4.94772 16.6 5.5V10H16.8177C17.2563 10 17.6786 10.1659 18 10.4643V4.35714C18 3.60868 17.3721 3 16.6 3H6.4C5.6279 3 5 3.60868 5 4.35714V18.6429C5 19.3913 5.6279 20 6.4 20H12L11.7236 19.4472C11.5766 19.1531 11.5 18.8288 11.5 18.5H7.5Z" fill="white" />
            <path d="M14.4994 7.43104H9C8.72126 7.43104 8.51785 7.2201 8.51785 6.9489C8.51785 6.68522 8.72126 6.47429 9 6.47429H14.4994C14.7706 6.47429 14.974 6.68522 14.974 6.9489C14.974 7.2201 14.7706 7.43104 14.4994 7.43104Z" fill="white" />
            <path d="M9 9.45675H14.4994C14.7706 9.45675 14.974 9.24582 14.974 8.97461C14.974 8.71094 14.7706 8.5 14.4994 8.5H9C8.72126 8.5 8.51785 8.71094 8.51785 8.97461C8.51785 9.24582 8.72126 9.45675 9 9.45675Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M15.4158 11.2528C15.6682 10.3972 16.8806 10.3972 17.133 11.2528L17.1941 11.4606C17.2318 11.5886 17.2977 11.7067 17.387 11.806C17.4763 11.9053 17.5866 11.9833 17.71 12.0344C17.8333 12.0855 17.9666 12.1084 18.0999 12.1013C18.2332 12.0942 18.3633 12.0573 18.4805 11.9934L18.6706 11.8902C19.454 11.463 20.3114 12.3204 19.8849 13.1044L19.781 13.2939C19.7171 13.4111 19.6802 13.5412 19.6731 13.6745C19.666 13.8078 19.6889 13.9411 19.74 14.0644C19.7911 14.1878 19.8691 14.2981 19.9685 14.3874C20.0678 14.4767 20.1858 14.5426 20.3139 14.5803L20.5216 14.6414C21.3772 14.8938 21.3772 16.1062 20.5216 16.3586L20.3139 16.4197C20.1858 16.4574 20.0678 16.5233 19.9685 16.6126C19.8691 16.7019 19.7911 16.8122 19.74 16.9356C19.6889 17.0589 19.666 17.1922 19.6731 17.3255C19.6802 17.4588 19.7171 17.5889 19.781 17.7061L19.8842 17.8962C20.3114 18.6796 19.454 19.537 18.67 19.1104L18.4805 19.0066C18.3633 18.9427 18.2332 18.9058 18.0999 18.8987C17.9666 18.8916 17.8333 18.9145 17.71 18.9656C17.5866 19.0167 17.4763 19.0947 17.387 19.194C17.2977 19.2933 17.2318 19.4114 17.1941 19.5394L17.133 19.7472C16.8806 20.6028 15.6682 20.6028 15.4158 19.7472L15.3547 19.5394C15.317 19.4114 15.2511 19.2933 15.1618 19.194C15.0726 19.0947 14.9622 19.0167 14.8389 18.9656C14.7155 18.9145 14.5823 18.8916 14.4489 18.8987C14.3156 18.9058 14.1855 18.9427 14.0683 19.0066L13.8782 19.1098C13.0948 19.537 12.2374 18.6796 12.664 17.8956L12.7679 17.7061C12.8318 17.5889 12.8686 17.4588 12.8757 17.3255C12.8828 17.1922 12.8599 17.0589 12.8088 16.9356C12.7577 16.8122 12.6797 16.7019 12.5804 16.6126C12.4811 16.5233 12.3631 16.4574 12.235 16.4197L12.0272 16.3586C11.1716 16.1062 11.1716 14.8938 12.0272 14.6414L12.235 14.5803C12.7819 14.4189 13.0404 13.795 12.7679 13.2939L12.6646 13.1038C12.2374 12.3204 13.0948 11.463 13.8789 11.8896L14.0683 11.9934C14.1855 12.0573 14.3156 12.0942 14.4489 12.1013C14.5823 12.1084 14.7155 12.0855 14.8389 12.0344C14.9622 11.9833 15.0726 11.9053 15.1618 11.806C15.2511 11.7067 15.317 11.5886 15.3547 11.4606L15.4158 11.2528ZM15.0083 16.7661C15.3441 17.1019 15.7995 17.2906 16.2744 17.2906V17.2893C16.7491 17.2893 17.2044 17.1007 17.5401 16.7651C17.8758 16.4294 18.0644 15.9741 18.0644 15.4994C18.0644 15.0247 17.8758 14.5694 17.5401 14.2337C17.2044 13.898 16.7491 13.7094 16.2744 13.7094C15.7995 13.7094 15.3441 13.8981 15.0083 14.2339C14.6725 14.5697 14.4839 15.0251 14.4839 15.5C14.4839 15.9749 14.6725 16.4303 15.0083 16.7661Z" fill="white" />
          </svg>
        </div>
        ComfyUI
        <div className="status">
          <div className="span"></div>
        </div>
      </div>
    )
}