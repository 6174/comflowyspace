import { useAppStore } from "@comflowy/common/store";
import { useExtensionsState } from "./extension.state";
import { useEffect, useRef, useState } from "react";
import { ExtensionManager } from "./extension.manager";
import { ExtensionEventTypes, ExtensionManifest } from "./extension.types";
import { DraggableModal } from "ui/antd/draggable-modal";
import { getBackendUrl } from "@comflowy/common/config";
import styles from "./extension.style.module.scss";

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
      });
      return () => {
        disposable.dispose();
      }
    }
  }, [manager, editorEvent]);

  const extensionModals = useExtensionsState(st => st.extensionModals);
  const visibleModals = Object.keys(extensionModals).map(id => extensionModals[id]).filter(modal => modal.visible);

  return (
    <div className="controller">
      {visibleModals.map(ext => {
        return <ExtensionModal key={ext.extension.id} extension={ext.extension} visible={ext.visible} postMessage={(ev) => {
          manager?.onUIEvent({
            extensionId: ext.extension.id,
            srcEvent: ev
          })
          console.log('postMessage from ui', ev);
        }}/>
      })}
    </div>
  );
}

function ExtensionModal(props: {
  extension: ExtensionManifest;
  visible: boolean;
  postMessage: (message: any) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const closeModal = useExtensionsState(st => st.closeModal);
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        console.log('Received message from iframe:', event);
        props.postMessage(event);
      }
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    }
  }, []);
  if (!props.extension.ui) {
    return null;
  }
  const src = getBackendUrl("/static/" + props.extension.ui);
  return (
    <DraggableModal 
      open={props.visible}
      title={props.extension.name}
      footer={null}
      initialWidth={400}
      initialHeight={450}
      rootClassName={styles.extensionUIModal}
      onCancel={ev => {
        closeModal(props.extension);
      }}>
      <iframe id={"iframe-" + props.extension.id } ref={iframeRef} src={src} />;
    </DraggableModal>
  )
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



