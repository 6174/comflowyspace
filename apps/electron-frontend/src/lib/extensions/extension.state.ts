import { create } from "zustand";
import { ExtensionManifest } from "./extension.types";
import { getBackendUrl } from "@comflowy/common/config";
import { ExtensionManager } from "./extension-manager";

type ExtensionsState = {
  extensions: ExtensionManifest[];
  extensionManager?: ExtensionManager;
}

const initialState: ExtensionsState = {
  extensions: []
}

type ExtensionsAction = {
  onInit: () => void;
}

export const useExtensionsState = create<ExtensionsState & ExtensionsAction>((set, get) => ({
  ...initialState,
  onInit: async () => {
    const url = getBackendUrl("/api/frontend_extension");
    try {
      const ret = await fetch(url);
      const retData = await ret.json();
      if (retData.success) {
        set({
          extensions: retData.data
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
}));

