import { useAppStore } from "@comflowy/common/store";
import { useExtensionsState } from "./extension.state";
import { useEffect } from "react";
import { ExtensionManager } from "./extension.manager";
import { ExtensionManifest } from "./extension.types";

/**
 * Controller 
 * @returns 
 */
export function ReactflowExtensionController() {
  const onInit = useExtensionsState((st) => st.onInit);
  const extensions = useExtensionsState((st) => st.extensions);
  // const edditorEvent = useAppStore((st) => st.editorEvent);
  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    if (extensions.length > 0) {
      // do mount extensions
      const manager = createExtensionManager(extensions);
      manager.init();
    }
  }, [extensions])
  return <></>;
}

function createExtensionManager(extensions: ExtensionManifest[]): ExtensionManager {
  const apiHooks = {
    getNodes
  };
  const manager = new ExtensionManager(extensions, apiHooks);
  return manager;
}

/**
 * Api getNodes
 */
function getNodes() {
  const nodes = useAppStore.getState().nodes;
  return nodes;
}



