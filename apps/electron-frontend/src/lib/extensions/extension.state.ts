import { create } from "zustand";
import { ExtensionManifest } from "./extension.types";
import { getBackendUrl } from "@comflowy/common/config";
import { ExtensionManager } from "./extension.manager";

type ExtensionsState = {
  extensions: ExtensionManifest[];
  extensionModals: Record<string, {
    visible: boolean;
    extension: ExtensionManifest;
  }>;
  extensionManager?: ExtensionManager;
}

const initialState: ExtensionsState = {
  extensions: [],
  extensionModals: {}
}

type ExtensionsAction = {
  onInit: () => void;
  openModal: (extension: ExtensionManifest) => void;
  closeModal: (extension: ExtensionManifest) => void;
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
  },
  openModal: (extension: ExtensionManifest) => {
    set({
      extensionModals: {
        ...get().extensionModals,
        [extension.id]: {
          extension,
          visible: true,
        }
      }
    });
  },
  closeModal: (extension: ExtensionManifest) => {
    set({
      extensionModals: {
        ...get().extensionModals,
        [extension.id]: {
          extension,
          visible: false,
        }
      }
    });
  }
}));

