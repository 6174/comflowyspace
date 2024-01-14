import { Popover } from "antd";
import { useExtensionsState } from "./extension.state";
import { ExtensionManifest } from "./extension.types";
import styles from "./extension.style.module.scss";
export const ExtensionListPopover = (props: {
  children: any;
}) => {
  return (
    <Popover
      title={null}
      content={<ExtensionList/>}
      trigger="click"
      arrow={false}
      align={{ offset: [0, -26] }}
      rootClassName={styles.extensionListPopover}
      placement="top"
    >
      {props.children}
    </Popover>
  );
};

function ExtensionList() {
  const extensions = useExtensionsState((st) => st.extensions);
  const uiExtensions = extensions.filter(ext => !!ext.ui);

  return (
    <>
      <h3>Extension List</h3>
      <div className="extension-list">
        {uiExtensions.map(ext => {
          return <ExtensionItem extension={ext} key={ext.id}/>
        })}
      </div>
    </>
  )
}

function ExtensionItem({extension}: {extension: ExtensionManifest}) {
  const openModal = useExtensionsState(st => st.openModal);
  return (
    <div className="extension-item action" onClick={ev => {
      openModal(extension)
    }}>
      {extension.name}
    </div>
  )
}