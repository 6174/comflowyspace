import { getExtensionInfos } from "../comfyui-bridge/bridge";
import { create } from "zustand";

export type Extension = {
    title: string;
    author: string;
    description: string;
    installed: boolean;
    disabled: boolean;
    need_update: boolean;
    [_:string]: any
}

export type ExtensionsState = {
  extensions: Extension[],
  extensionNodeMap: Record<string, string[]>
}

export type ExtensionsAction = {
  onInit: () => Promise<void>;
}

export const useExtensionsState = create<ExtensionsState & ExtensionsAction>((set, get) => ({
    extensions: [],
    extensionNodeMap: {},
    onInit: async () => {
        const ret = await getExtensionInfos();
        if (ret.success) {
            const {extensions, extensionNodeMap} = ret.data;
            set({
                extensions: extensions, 
                extensionNodeMap: extensionNodeMap
            });
            console.log("extension infos", ret);
        }
    },
}));