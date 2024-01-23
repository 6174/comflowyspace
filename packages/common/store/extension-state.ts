import { getExtensionInfos } from "../comfyui-bridge/bridge";
import { create } from "zustand";

export type Extension = {
    title: string;
    author: string;
    description: string;
    installed: boolean;
    disabled: boolean;
    need_update: boolean;
    [_: string]: any
}

export type ExtensionsState = {
    extensions: Extension[],
    loading: boolean,
    extensionNodeMap: Record<string, string[]>
}

export type ExtensionsAction = {
    onInit: (doUpdateCheck?: boolean) => Promise<void>;
}

export const useExtensionsState = create<ExtensionsState & ExtensionsAction>((set, get) => ({
    extensions: [],
    loading: true,
    extensionNodeMap: {},
    onInit: async (doUpdateCheck = true) => {
        const ret = await getExtensionInfos(doUpdateCheck);
        if (ret.success) {
            const { extensions, extensionNodeMap } = ret.data;
            set({
                loading: false,
                extensions: extensions,
                extensionNodeMap: extensionNodeMap
            });
            console.log("extension infos", ret);
        }
    },
}));