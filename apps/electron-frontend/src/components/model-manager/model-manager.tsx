import { Button, Col, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import styles from "./model-manager.style.module.scss";

import { Tabs, Card} from 'antd';
import ModelMarket from './model-market';
import InstalledModels from './installed-models';

const ModelManagement = () => {
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

