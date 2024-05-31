import { getExtensionInfos } from "../comfyui-bridge/bridge";
import { create } from "zustand";

export type Extension = {
    title: string;
    author: string;
    description: string;
    installed: boolean;
    reference: string;
    disabled: boolean;
    need_update: boolean;
    nodename_pattern?: string;
    nodes?: string[];
    [_: string]: any
}

export type ExtensionsState = {
    extensions: Extension[],
    loading: boolean,
    extensionNodeMap: Record<string, Extension>
}

export type ExtensionsAction = {
    onInit: (doUpdateCheck?: boolean) => Promise<void>;
    removeExtension: (extension: Extension) => void;
    onDisableExtension: (extension: Extension, disabled: boolean) => void;
}

export const useExtensionsState = create<ExtensionsState & ExtensionsAction>((set, get) => ({
    extensions: [],
    loading: true,
    extensionNodeMap: {},
    onInit: async (doUpdateCheck = true) => {
        const ret = await getExtensionInfos(doUpdateCheck);
        if (ret.success) {
            const { extensions, extensionNodeMap } = ret.data;
            const transformed = transformModeMap(extensionNodeMap, extensions)
            set({
                loading: false,
                extensions: extensions,
                extensionNodeMap: transformed
            });
            console.log("extension infos", ret);
        }
    },
    removeExtension: (extension: Extension) => {
        set({
            extensions: get().extensions.filter(it => it.title !== extension.title)
        })
    },
    onDisableExtension: (extension: Extension, disabled: boolean) => {
        const newExtensions = get().extensions.map(ext => {
            if (ext.title === extension.title) {
                ext.disabled = disabled;
            }
            return ext;
        });
        set({
            extensions: newExtensions
        })
    }
}));

export function transformModeMap(extensionNodeMap: Record<string, string[]>, extensions: Extension[]): Record<string, Extension> {
    const ret: Record<string, Extension> = {};
    for (let extensionName in extensionNodeMap) {
        const widgetList = extensionNodeMap[extensionName];
        const extension = extensions.find(ext => ext.title === extensionName);
        if (extension) {
            extension.nodes = widgetList;
            widgetList.forEach(widgetName => {
                ret[widgetName] = extension;
            })
        }
    }
    // console.log("mapping", ret);
    return ret;
}

export function findExtensionByWidgetName(widgetName: string): Extension | undefined {
    const {extensions, extensionNodeMap} = useExtensionsState.getState();
    let node = extensionNodeMap[widgetName];
    if (node) {
        return node;
    }
    const regex_to_extension = [];
    for (let i in extensions) {
        const ext = extensions[i];
        if (ext.nodename_pattern) {
            let item = { 
                regex: new RegExp(ext.nodename_pattern), 
                extension: ext
            };
            regex_to_extension.push(item);
        }
    }

    for (let j in regex_to_extension) {
        if (regex_to_extension[j].regex.test(widgetName)) {
            node = regex_to_extension[j].extension;
        }
    }
    return node
}