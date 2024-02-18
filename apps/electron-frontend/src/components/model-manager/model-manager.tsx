import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from "./model-manager.style.module.scss";
import { TutorialBanner } from '../tutorials/tutorials';
import  useTutorialStore  from '../tutorials/tutorial.store';

import { Tabs, Card} from 'antd';
import ModelMarket from './model-market';
import InstalledModels from './installed-models';
import { useModelState } from '@comflowy/common/store/model-state';
import { FolderIcon, ReloadIcon } from 'ui/icons';
import { openDirectory, useIsElectron } from '@/lib/electron-bridge';
import { ModelSettings } from './model-settings';
import ModelCards from './model-recommend';

const ModelManagement = () => {
  const { onInit, modelPath, loading} = useModelState();
  const { tutorials, fetchTutorials } = useTutorialStore();
  const isElectronEnv = useIsElectron();
  useEffect(() => {
    onInit();
    fetchTutorials();
  }, [fetchTutorials]);

  const getstartedTutorials = tutorials.filter(tutorial => tutorial.tag === 'model suggestion');

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
              <ReloadIcon /> Refresh
            </Button>
          </div>
        </div>
      </div>
      <div className="tutorial-banner-list">
        {getstartedTutorials.map((card, index) => (
          <TutorialBanner key={index} {...card} />
        ))}
      </div>
      <Tabs defaultActiveKey="available" >
        <Tabs.TabPane tab="Available" key="available">
          <ModelCards/>
        </Tabs.TabPane> 
        <Tabs.TabPane tab="Installed" key="installed">
          <InstalledModels/>
        </Tabs.TabPane> 
      </Tabs>
    </div>
  );
};

export default ModelManagement;

