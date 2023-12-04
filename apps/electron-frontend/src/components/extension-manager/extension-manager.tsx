import { useEffect } from "react";
import styles from "./extension-manager.style.module.scss";
import {Extension, useExtensionsState} from "@comflowy/common/store/extension-state";
import { Button, Space } from "antd";

function ExtensionManager() {
  return (
    <div className={styles.extensionManager}>
      <h1>Extensions</h1>
      <ExtensionList />
    </div>
  )
}

function ExtensionList() {
  const {onInit, extensions, extensionNodeMap} = useExtensionsState();
  useEffect(() => {
    onInit();
  }, [])
  return (
    <div className='extension-list'>
      {extensions.map(ext => {
        return <ExtensionListItem extension={ext} key={ext.title + ext.author}/>
      })}
    </div>
  )
}

function ExtensionListItem({extension}: {
  extension: Extension
}) {
  return (
    <div className='extension-list-item'>
      <div className="title">Title: {extension.title}</div>
      <div className="author">Author: {extension.author}</div>
      <div className="description" dangerouslySetInnerHTML={{__html: extension.description}}></div>
      <div className="actions">
        <Space>
          <Button>Install</Button>
          <Button>Uninstall</Button>
          <Button>Update</Button>
        </Space>
      </div>
    </div>
  )
}

export default ExtensionManager;
