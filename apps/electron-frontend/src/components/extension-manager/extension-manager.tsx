import { useCallback, useEffect, useState } from "react";
import styles from "./extension-manager.style.module.scss";
import {Extension, useExtensionsState} from "@comflowy/common/store/extension-state";
import { Button, Col, Input, Modal, Row, Space, Tabs, Tooltip } from "antd";
import { InstallExtensionButton, InstallExtensionFromGitUrl } from "./install-extension-button";
import { CloseIcon, ExtensionIcon, MoreIcon, ReloadIcon } from "ui/icons";
import { RemoveExtensionButton } from "./remove-extension-button";
import { UpdateExtensionButton } from "./update-extension-button";
import { DisableExtensionButton } from "./disable-extension-button";
import { openExternalURL } from "@/lib/electron-bridge";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import {KEYS, t} from "@comflowy/common/i18n";
import { VirtualGrid } from "ui/virtual/virtual-grid";
import _ from "lodash";
function ExtensionManager() {
  const {onInit, extensions, loading} = useExtensionsState();
  useEffect(() => {
    onInit(false).then(() => {
      setTimeout(() => {
        onInit()
      }, 3000)
    });
  }, []);

  const installedExtensions = extensions.filter(ext => ext.installed);
  const extensionsNeedUpdate = extensions.filter(ext => ext.need_update);

  return (
    <div className={styles.extensionManager}>
      <div className="my-extensions">
        <div style={{
          display: 'flex'
        }}>
          <h2> {t(KEYS.extensions)} </h2>
          <div className="actions">
            <InstallExtensionFromGitUrl/>
            <Tooltip title="Update all extensions">
              <UpdateExtensionButton extensions={extensionsNeedUpdate} buttonSize={"small"}/>
            </Tooltip>
          </div>
        </div>
      </div>
      <Tabs defaultActiveKey="available" >
        <Tabs.TabPane
          tab={t(KEYS.installedExtensions)}
          key="installed"
        >
          <ExtensionList extensions={installedExtensions} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={t(KEYS.communityExtensions)}
          key="community"
        >
          <ExtensionList extensions={extensions} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

function ExtensionList(props: {
  extensions: Extension[],
  showFilter?: boolean
}) {
  const {extensions, showFilter = true} = props;
  const [searchedExtensions, setSearchedExtensions] = useState(extensions);
  const [searchText, setSearchText] = useState('');

  const doFilter = useCallback(_.throttle((searchText) => {
    console.log("doFilter: ", searchText);
    let filteredExtensions = extensions.filter(
      ext =>
        ext.title.toLowerCase().includes(searchText.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchText.toLowerCase()) ||
        ext.nodes?.some(node => node.toLowerCase().includes(searchText.toLowerCase()))
    );
    setSearchedExtensions(filteredExtensions);
  }, 100), [extensions]);

  useEffect(() => {
    doFilter(searchText);
  }, [extensions, searchText])

  const displayedExtensions = (searchText?.trim() !== "") ? searchedExtensions : extensions;
  return (
    <div className="extension-list-wrapper">
      <Row>
        {showFilter &&
          <Col span={12} style={{ marginBottom: 16 }}>
            <Input
              placeholder={t(KEYS.searchExtensions)}
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value)
                doFilter(e.target.value);
              }}
              onPressEnter={ev => {
                doFilter(searchText)
              }}
            />
          </Col>
        }
      </Row>
      <p className="sub">
        {t(KEYS.totalExtensions)}: {displayedExtensions.length}
      </p>

      <VirtualGrid 
          className="extension-list"
          items={displayedExtensions}
          itemHeight={130}
          renderItem={(ext) => {
            return <ExtensionListItem extension={ext} />
          }}
          minItemWidth={250}
          gridGap={10}
        >
      </VirtualGrid>
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

  const title = `${extension.title}${extension.disabled ? "(disabled)" : ""}`;
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
        {extension.need_update && 
          (
            <div className="update-badge">
              Need Update
            </div>
          )
        }
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
        <a onClick={ev => {
          openExternalURL(extension.reference)
        }}>Reference</a>, Created by {extension.author}
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
      <div className="nodes">
        <h4>Extension Nodes:</h4>
        <div className="node-list">
          <pre>
            {extension.nodes?.map(node => {
              return (
                <div className="node" key={node}>{node}</div>
              )
            })}
          </pre>
        </div>
      </div>
      <div className="footer-actions">
        <Space>
          {extension.installed  === false && <InstallExtensionButton extension={extension}/>}
          {extension.installed && <RemoveExtensionButton extension={extension}/>}
          {extension.installed && extension.need_update && <UpdateExtensionButton extensions={[extension]}/>}
          {extension.installed && <DisableExtensionButton extension={extension}/>}
        </Space>
      </div>
    </Modal>
  )
}




export default ExtensionManager;
