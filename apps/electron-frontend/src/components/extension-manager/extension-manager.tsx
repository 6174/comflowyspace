import { useCallback, useEffect, useState } from "react";
import styles from "./extension-manager.style.module.scss";
import {Extension, useExtensionsState} from "@comflowy/common/store/extension-state";
import { Button, Col, Input, Modal, Row, Space } from "antd";
import { InstallExtensionButton } from "./install-extension-button";
import { CloseIcon, ExtensionIcon, MoreIcon } from "ui/icons";
import { RemoveExtensionButton } from "./remove-extension-button";
import { UpdateExtensionButton } from "./update-extension-button";
import { DisableExtensionButton } from "./disable-extension-button";

function ExtensionManager() {
  const {onInit, extensions, extensionNodeMap, loading} = useExtensionsState();
  useEffect(() => {
    onInit();
  }, []);

  const installedExtensions = extensions.filter(ext => ext.installed);
  console.log("installed", installedExtensions);
  return (
    <div className={styles.extensionManager}>
      <div className="my-extensions">
        <h2>My Extensions</h2>
        <p className="sub">Extensions already installed on your device</p>
        <ExtensionList extensions={installedExtensions} showFilter={false}/>
      </div>
      <div className="extension-market">
        <h2>Community Extensions</h2>
        <p className="sub">Install extensions from the community</p>
        <ExtensionList extensions={extensions}/>
      </div>
    </div>
  )
}

function ExtensionList(props: {
  extensions: Extension[],
  showFilter?: boolean
}) {
  const {extensions, showFilter = true} = props;
  const [displayedExtensions, setDisplayedExtensions] = useState(extensions);
  const [searchText, setSearchText] = useState('');

  const doFilter = useCallback(() => {
    let filteredExtensions = extensions.filter(
      ext =>
        ext.title.toLowerCase().includes(searchText.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchText.toLowerCase())
    );

    setDisplayedExtensions(filteredExtensions);
  }, [extensions, searchText]);

  useEffect(() => {
    doFilter();
  }, [extensions])

  return (
    <div className='extension-list'>
      <Row>
        {showFilter && 
          <Col span={12} style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search Extensions"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={doFilter}
            />
          </Col>
        }
      </Row>
      <p className="sub">
        Total extensions: {displayedExtensions.length}
      </p>
      <div className="result">
        {displayedExtensions.map(ext => {
          return <ExtensionListItem extension={ext} key={ext.title + ext.author}/>
        })}
      </div>
    </div>
  )
}

function ExtensionListItem({extension}: {
  extension: Extension
}) {
  const [visible, setVisible] = useState<boolean>(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const title = `${extension.title}${extension.disabled && "(disabled)"}`;
  return (
    <>
      <ExtensionModal extension={extension} visible={visible} handleOk={handleOk} handleCancel={handleCancel}/>
      <div className={`extension-card ${extension.disabled && "disabled"}`} onClick={showModal}>
        <div className={styles.extensionTitleBar}>
          <div className="icon">
            <ExtensionIcon/>
          </div>
          <div className="text">
            <div className="name" title={title}>{title}</div>
            <div className="author" title={extension.author}>Created by {extension.author}</div>
          </div>
        </div>
        <div className="description" dangerouslySetInnerHTML={{__html: extension.description}}></div>
      </div>
    </>
  )
}


export function ExtensionModal(props: {
  extension: Extension,
  visible: boolean,
  handleOk: () => void,
  handleCancel: () => void
}) {
  const {visible, handleOk, handleCancel, extension} = props;
  const title = (
    <div className={styles.extensionTitleBar} >
      <div className="icon">
        <ExtensionIcon/>
      </div>
      <div className="text">
        <div className="name" title={extension.title}>{extension.title}</div>
        <div className="author" title={extension.author}>
        <a target="__blank" href={extension.reference}>Reference</a>, Created by {extension.author}
        </div>
      </div>
      <Space className="actions">
        {/* <div className="action-button">
          <MoreIcon/>
        </div> */}
        <div className="action-button" onClick={handleCancel}>
          <CloseIcon/>
        </div>
      </Space>
    </div>
  )


  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      closable={false}
      footer={null}
      className={styles.extensionModal}
      onCancel={handleCancel}
    >
      <div className="description" dangerouslySetInnerHTML={{__html: extension.description}}></div>
      <div className="footer-actions">
        <Space>
          {extension.installed  === false && <InstallExtensionButton extension={extension}/>}
          {extension.installed && <RemoveExtensionButton extension={extension}/>}
          {extension.installed && extension.need_update && <UpdateExtensionButton extension={extension}/>}
          {extension.installed && <DisableExtensionButton extension={extension}/>}
        </Space>
      </div>
    </Modal>
  )
}


export default ExtensionManager;
