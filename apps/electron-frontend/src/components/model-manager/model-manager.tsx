import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from "./model-manager.style.module.scss";

import { Tabs, Card} from 'antd';
import ModelMarket from './model-market';
import InstalledModels from './installed-models';
import { useModelState } from '@comflowy/common/store/model-state';
import { FolderIcon } from 'ui/icons';
import { openDirectory, useIsElectron } from '@/lib/electron-bridge';
import { ModelSettings } from './model-settings';

const ModelManagement = () => {
  const { onInit, modelPath, loading} = useModelState();
  const isElectronEnv = useIsElectron();
  useEffect(() => {
    onInit();
  }, []);
  return (
    <div className={styles.modelManagement}>
      <div style={{
        display: 'flex'
      }}>
        <h2> Model Management </h2>
        <div className="actions">
          {isElectronEnv  && 
            <div className="open-button">
              <Button size='small' onClick={() => {
                openDirectory(modelPath);
              }}> 
                <FolderIcon/> Model Folder
              </Button>
            </div>
          }
          <ModelSettings />
          <div className="refresh-button">
            <Button size='small' loading={loading} disabled={loading} onClick={() => {
              onInit();
            }}> 
              Refresh
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultActiveKey="installed">
        <Tabs.TabPane tab="Installed" key="installed">
          <InstalledModels/>
        </Tabs.TabPane> 
        <Tabs.TabPane tab="Available" key="available">
          <ModelMarket/>
        </Tabs.TabPane> 
      </Tabs>
    </div>
  );
};

export default ModelManagement;

