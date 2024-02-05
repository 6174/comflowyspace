import {create} from 'zustand';

export type Message = {
  type: "START" | "RESTART" | "STOP" | "INFO" | "ERROR" | "WARNING",
  message: string | undefined
}
type State = {
  messages: Message[];
  missingModules: string[];
};
type Actions = {
  setMessages: (messages: Message[]) => void;
  onInit: () => void;
}

const initialState: State = {
  messages: [],
  missingModules: [],
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
    set({
      messages,
      missingModules: findMissingModulesInMessages(messages)
    })
  },
}));

export default useComfyUIProcessManagerState;

function findMissingModulesInMessages(messages: Message[] = []): string[] {
  const logText = messages.map(m => m.message).join("\n");
  const regex = /No module named '(\w+)'/g;
  let match;
  let uniqueMissingModules = new Set();

  while ((match = regex.exec(logText)) !== null) {
    uniqueMissingModules.add(match[1]);
  }

  const missingModules = Array.from(uniqueMissingModules) as string[];
  return missingModules;
}
