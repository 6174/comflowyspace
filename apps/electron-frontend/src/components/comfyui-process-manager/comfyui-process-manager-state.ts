import {create} from 'zustand';

export type Message = {
  type: "START" | "RESTART" | "STOP" | "INFO" | "ERROR" | "WARNING",
  message: string | undefined
}
type State = {
  messages: Message[];
};
type Actions = {
  setMessages: (messages: Message[]) => void;
  onInit: () => void;
}

const initialState: State = {
  messages: [],
};

const useComfyUIProcessManagerState = create<State & Actions>((set, get) => ({
  ...initialState,
  onInit: () => {
    // try {
    //   const raw = localStorage.getItem("comfyui-messages");
    //   if (raw) {
    //     const messages = JSON.parse(raw);
    //     set({
    //       messages
    //     })
    //   }
    // } catch (err) {
    //   console.log("init error")
    // }
  },
  setMessages: (messages: Message[]) => {
    set({messages})
    // localStorage.setItem("comfyui-messages", JSON.stringify(messages));
  },
}));

export default useComfyUIProcessManagerState;
