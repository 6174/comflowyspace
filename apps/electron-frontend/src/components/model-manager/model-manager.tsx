import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from "./model-manager.style.module.scss";

import { Tabs, Card} from 'antd';
import ModelMarket from './model-market';
import InstalledModels from './installed-models';
import { useModelState } from '@comflowy/common/store/model-state';
import { FolderIcon } from 'ui/icons';
import { comfyElectronApi, isElectron, openDirectory } from '@/lib/electron-bridge';

const ModelManagement = () => {
  const { onInit, modelPath, loading} = useModelState();
  const isElectronEnv = isElectron();
  useEffect(() => {
      onInit();
  }, []);
  return (
    <div className={styles.modelManagement}>
      <h2>
        Model Management

        {isElectronEnv  && 
          <div className="open-button">
            <Button size='small' onClick={() => {
              openDirectory(modelPath);
            }}> 
              <FolderIcon/> Model Folder
            </Button>
          </div>
        }
        <div className="refresh-button">
          <Button size='small' loading={loading} disabled={loading} onClick={() => {
            onInit();
          }}> 
            Refresh
          </Button>
        </div>
      </h2>
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

