import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from "./model-manager.style.module.scss";

import { Tabs, Card} from 'antd';
import ModelMarket from './model-market';
import InstalledModels from './installed-models';
import { useModelState } from '@comflowy/common/store/model-state';

const ModelManagement = () => {
  const { onInit} = useModelState();
  useEffect(() => {
      onInit();
  }, []);
  return (
    <div className={styles.modelManagement}>
      <h1>Model Management</h1>
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

