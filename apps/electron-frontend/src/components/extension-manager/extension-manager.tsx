import { useCallback, useEffect, useState } from "react";
import styles from "./extension-manager.style.module.scss";
import {Extension, useExtensionsState} from "@comflowy/common/store/extension-state";
import { Button, Col, Input, Row, Space } from "antd";

function ExtensionManager() {
  return (
    <div className={styles.extensionManager}>
      <h1>Extensions</h1>
      <ExtensionList />
    </div>
  )
}

function ExtensionList() {
  const {onInit, extensions, extensionNodeMap, loading} = useExtensionsState();
  useEffect(() => {
    onInit();
  }, []);
  const [displayedExtensions, setDisplayedExtensions] = useState(extensions);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');

  const doFilter = useCallback(() => {
    let filteredExtensions = extensions.filter(
      ext =>
        ext.title.toLowerCase().includes(searchText.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filterType === 'installed') {
      filteredExtensions = filteredExtensions.filter(ext => ext.installed);
    } else if (filterType === 'uninstalled') {
      filteredExtensions = filteredExtensions.filter(ext => !ext.installed);
    }

    setDisplayedExtensions(filteredExtensions);
  }, [extensions, searchText, filterType]);

  const switchType = useCallback((type: string) => {
    setFilterType(type);
  }, [])

  useEffect(() => {
    doFilter();
  }, [extensions, filterType])

  return (
    <div className='extension-list'>
      <Row>
        <Col span={12} style={{ marginBottom: 16 }}>
          <Space>
            <Button onClick={() => switchType('all')}>All</Button>
            <Button onClick={() => switchType('installed')}>Installed</Button>
            <Button onClick={() => switchType('uninstalled')}>Uninstalled</Button>
          </Space>
        </Col>
        <Col span={12} style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search Extensions"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={doFilter}
          />
        </Col>
      </Row>
      <div className="result">
        {loading ? (
          <div> Loading....</div>
        ) : (
          <div className="meta">
            Total extensions: {displayedExtensions.length}
          </div>
        )}
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
  return (
    <div className='extension-list-item'>
      <div className="title">Title: {extension.title}</div>
      <div className="author">Author: {extension.author}</div>
      <div className="description" dangerouslySetInnerHTML={{__html: extension.description}}></div>
      <div className="actions">
        <Space>
          {extension.installed  === false && <Button>Install</Button>}
          {extension.installed && <Button>UnInstall</Button>}
          {extension.installed && extension.need_update && <Button>Update</Button>}
          {extension.installed && !!extension.disabled ? <Button>UnDisabled</Button> : <Button>Disable</Button>}
        </Space>
      </div>
    </div>
  )
}

export default ExtensionManager;
