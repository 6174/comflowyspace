import { useAppStore } from "@comflowy/common/store";
import { useExtensionsState } from "./extension.state";
import { useEffect, useState } from "react";
import { ExtensionManager } from "./extension.manager";
import { ExtensionManifest } from "./extension.types";

/**
 * Controller 
 * @returns 
 */
export function ReactflowExtensionController() {
  const onInit = useExtensionsState((st) => st.onInit);
  const extensions = useExtensionsState((st) => st.extensions);
  const editorEvent = useAppStore(st => st.editorEvent);
  const [manager, setManager] = useState<ExtensionManager>();
  useEffect(() => {
    onInit();
  }, []);

  useEffect(() => {
    if (extensions.length > 0) {
      // do mount extensions
      const manager = createExtensionManager(extensions);
      manager.init().then(() => {
        setManager(manager);
      });
      return () => {
        manager.destroy();
      }
    }
  }, [extensions])

  useEffect(() => {
    if (editorEvent && manager) {
      const disposable = editorEvent.on((event) => {
        manager.onEditorEvent(event);
      })
      return () => {
        disposable.dispose();
      }
    }
  }, [manager, editorEvent]);

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



