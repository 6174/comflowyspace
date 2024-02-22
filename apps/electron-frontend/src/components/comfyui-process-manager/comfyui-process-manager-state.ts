import {create} from 'zustand';

export type Message = {
  type: "INPUT" | "OUTPUT" | "START" | "RESTART" | "STOP" | "INFO" | "ERROR" | "WARNING",
  message: string | undefined
}
type State = {
  messages: Message[];
  installedModules: string[];
  missingModules: string[];
};
type Actions = {
  setMessages: (messages: Message[]) => void;
  onInit: () => void;
  setInstalledModules: (modules: string[]) => void;
}

const initialState: State = {
  messages: [],
  installedModules: [],
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
    set((st) => {
      return {
        messages,
        missingModules: filterMissingModules(findMissingModulesInMessages(messages), st.installedModules)
      }
    })
  },
  setInstalledModules: (modules: string[]) => {
    set((st) => {
      const installedModules = [...st.installedModules, ...modules];
      return {
        installedModules,
        missingModules: filterMissingModules(st.missingModules, installedModules)
      }
    })
  }
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

function filterMissingModules(missingModules: string[], installedModules: string[]) {
  return missingModules.filter(m => !installedModules.includes(m));
}