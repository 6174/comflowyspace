import { Button, Col, Input, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from "./model-manager.style.module.scss";
import { TutorialBanner } from '../tutorials/tutorials';
import  useTutorialStore  from '../tutorials/tutorial.store';
import { Tabs, Card} from 'antd';
import InstalledModels from './installed-models';
import { useModelState } from '@comflowy/common/store/model.state';
import { FolderIcon, ReloadIcon } from 'ui/icons';
import { openDirectory, useIsElectron } from '@/lib/electron-bridge';
import {KEYS, t} from "@comflowy/common/i18n";
import { CivitaiModelListPage } from '../workflow-editor/reactflow-model-selector/select-civitai-models';
import { SelectFeaturedModels } from '../workflow-editor/reactflow-model-selector/select-featured-models';
import { ModelDownloadChannel } from '../workflow-editor/reactflow-model-selector/model-download-channel';
import { getMainChannel } from '@comflowy/common/utils/channel.client';
import { CHANNEL_EVENTS } from '@comflowy/common/types/channel.types';

const ModelManagement = () => {
  const { onInit, modelPath, loading} = useModelState();
  const { tutorials, fetchTutorials } = useTutorialStore();
  const isElectronEnv = useIsElectron();
  useEffect(() => {
    onInit();
    fetchTutorials();
  }, []);

  useEffect(() => {
    const channel = getMainChannel();
    const dispose = channel.on(CHANNEL_EVENTS.MODEL_META_UPDATED, () => {
      console.log("updated meta");
      onInit();
    });
    return () => {
      dispose.dispose();
    }
  }, [])

  const getstartedTutorials = tutorials.filter(tutorial => tutorial.tag === 'model suggestion');

  return (
    <div className={styles.modelManagement}>
      <div style={{
        display: 'flex'
      }}>
        <h2> {t(KEYS.modelManagement)} </h2>
        <div className="actions">
          {isElectronEnv  && 
            <div className="open-button">
              <Button size='small' onClick={() => {
                openDirectory(modelPath);
              }}> 
                <FolderIcon/> {t(KEYS.modelFolder)}
              </Button>
            </div>
          }
          <div className="refresh-button">
            <Button size='small' loading={loading} disabled={loading} onClick={() => {
              onInit();
            }}> 
              <ReloadIcon /> {t(KEYS.refresh)}
            </Button>
          </div>
        </div>
      </div>
      <div className="scroll-container" id={"ModelScrollContainer"}>
        <div className="tutorial-banner-list">
          {getstartedTutorials.map((card, index) => (
            <TutorialBanner key={index} {...card} />
          ))}
        </div>
        <Tabs defaultActiveKey="available" >
          <Tabs.TabPane
            tab={"Featured"}
            key="available"
          >
            <SelectFeaturedModels />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={'Civitai'}
            key="civitai"
          >
            <CivitaiModelListPage />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t(KEYS.installed)} key="installed">
            <InstalledModels />
          </Tabs.TabPane>
        </Tabs>
      </div>
      <ModelDownloadChannel/>
    </div>
  );
};

export default ModelManagement;

