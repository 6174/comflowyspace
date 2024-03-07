import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Input, Space, Alert, message } from 'antd';
import { SettingsIcon } from 'ui/icons';
import { comfyElectronApi, isElectron, useIsElectron } from '@/lib/electron-bridge';
import { getBackendUrl } from '@comflowy/common/config';
import { isWindow } from 'ui/utils/is-window';
import {KEYS, t} from "@comflowy/common/i18n";

export const ModelSettings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sdwebuiPath, setSdwebuiPath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSettingIconClick = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = useCallback(async () => {
    // setIsModalVisible(false);
    const api = getBackendUrl('/api/update_sdwebui');
    try {
      const config = {
        stableDiffusionDir: sdwebuiPath.trim()
      };
      setLoading(true);
      const ret = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: config
        })
      });
      const data = await ret.json();
      if (data.success) {
        message.success("success: " + data.error);
        setIsModalVisible(false);
      } else {
        message.error("Failed: " + data.error);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      message.error(err);
    }
  }, [sdwebuiPath]);

  const selectFolder = useCallback(async () => {
    try {
      const ret = await comfyElectronApi.selectDirectory();
      const folder = ret[0];
      setSdwebuiPath(folder);
    } catch (err) {
      console.log(err);
      message.error(err);
    }
  }, []);

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const electronEnv = useIsElectron();

  return (
    <div className='setting-button'>
      <Button size="small" onClick={handleSettingIconClick}>
        <SettingsIcon /> {t(KEYS.settings)} 
      </Button>
      <Modal
        title="Settings"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <div className="field">
          <Alert style={{ fontSize: 12 }} message="If you already installed Stable Diffusion WebUI, you can choose the sd path to reuse models" type="info" showIcon />
          <br />
          <div className="field-label" style={{
            marginBottom: "10px"
          }}>SD WebUI Path:</div>
          <Space>
            <Input value={sdwebuiPath} placeholder="Input sdwebui path if exists" style={{ width: 300 }} />
            {electronEnv && <Button type="link" onClick={selectFolder}>Select folder</Button>}
          </Space>
        </div>
        <br />
        <div className="field">
          <Button onClick={handleModalOk} size='small' type="primary" loading={loading} disabled={loading}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

