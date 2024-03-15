import React, { useState, useCallback } from 'react';
import { Modal, Menu, Layout, Divider, Select, Space, Input, Button, message, Segmented} from 'antd';
import type { MenuProps } from 'antd';
import { comfyElectronApi, openExternalURL, useIsElectron} from '@/lib/electron-bridge';
import styles from './setting-modal.style.module.scss'; 
import { LanguageType, changeLaunguage , currentLang} from '@comflowy/common/i18n';
import { getBackendUrl } from '@comflowy/common/config';
import LogoIcon from 'ui/icons/logo';
import { SettingsIcon, InfoIcon, PersonIcon, PlayCircleIcon } from 'ui/icons';
import {KEYS, t} from "@comflowy/common/i18n";

const SettingsModal = ({ isVisible, handleClose }) => {
  const [activeMenuKey, setActiveMenuKey] = useState('general');
  const { Header, Content, Footer, Sider } = Layout;
  const [sdwebuiPath, setSdwebuiPath] = useState('');
  const [loading, setLoading] = useState(false);

  const onMenuItemClick = ({ key }) => {
    setActiveMenuKey(key);
  };

  const languageMap = {
    'en-US': 'English',
    'zh-CN': '中文',
    'ja': '日本語',
    'ru': 'Русский',
  };

  const currentLanguage = languageMap[currentLang] || 'English';

  const handleChange = (value: LanguageType) => {
    localStorage.setItem('i18n', value);
    changeLaunguage(value);
    window.location.reload();
  };

  const selectFolder = useCallback(async () => {
    try {
      const ret = await comfyElectronApi.selectDirectory();
      if (ret && ret.length > 0) {
        const folder = ret[0];
        setSdwebuiPath(folder);
        const api = getBackendUrl('/api/update_sdwebui');
        try {
          const config = {
            stableDiffusionDir: folder.trim()
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
          } else {
            message.error("Failed: " + data.error);
          }
          setLoading(false);
        } catch (err) {
          console.log(err);
          message.error(err);
        } 
      }
    } catch (err) {
      console.log(err);
      message.error(err);
    }
  }, []);

  const electronEnv = useIsElectron();

  const fpModeStorageKey = 'startupFPModeValue';

  const getFPModeInitialValue = () => {
    return localStorage.getItem(fpModeStorageKey) || 'normal';
  };

  const [fpValue, setFPValue] = useState(getFPModeInitialValue);

  const onFPModeChange = async (fpValue) => {
    setFPValue(fpValue);
    localStorage.setItem(fpModeStorageKey, fpValue);
    let fpType;
    switch (fpValue) {
      case 'fp16':
        fpType = 'startComfyUIFp16';
        break;
      case 'fp32':
        fpType = 'startComfyUIFp32';
        break;
      default:
        fpType = 'startComfyUI';
    }
    try {
      const modeApi = getBackendUrl('/api/fpmode_setup_config');
      const modeResponse = await fetch(modeApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fpmode: fpValue, 
        fpType: fpType
      })
    });
    const modeResult = await modeResponse.json();
    if (modeResult.success) {
      console.log('Config update success');
      const restartApi = getBackendUrl('/api/bootstrap');
      const restartResponse = await fetch(restartApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: fpType,
          },
        }),
      });
      const restartResult = await restartResponse.json();
      if (restartResult.success) {
        console.log('ComfyUI restart success');
      } else {
        console.error('ComfyUI restart fail:', restartResult.error);
      }
    } else {
      console.error('Config update failed:', modeResult.error);
    }
  } catch (error) {
    console.error(error);
  }
};

  const vaeModeStorageKey = 'startupVAEModeValue';

  const getVAEModeInitialValue = () => {
    return localStorage.getItem(vaeModeStorageKey) || 'normal';
  };

  const [vaeValue, setVAEValue] = useState(getVAEModeInitialValue);

const onVAEModeChange = async (vaeVaule) => {
    setVAEValue(vaeVaule);
    localStorage.setItem(vaeModeStorageKey, vaeVaule);
    let VAEType;
    switch (vaeVaule) {
      case 'fp16':
        VAEType = 'startComfyUIFp16';
        break;
      case 'fp32':
        VAEType = 'startComfyUIFp32';
        break;
      default:
        VAEType = 'startComfyUI';
    }
    try {
      const vaeModeApi = getBackendUrl('/api/vaemode_setup_config');
      const modeResponse = await fetch(vaeModeApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vaemode: vaeVaule, 
        VAEType: VAEType
      })
    });
    const modeResult = await modeResponse.json();
    if (modeResult.success) {
      console.log('Config update success');
      const restartApi = getBackendUrl('/api/bootstrap');
      const restartResponse = await fetch(restartApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: VAEType,
          },
        }),
      });
      const restartResult = await restartResponse.json();
      if (restartResult.success) {
        console.log('ComfyUI restart success');
      } else {
        console.error('ComfyUI restart fail:', restartResult.error);
      }
    } else {
      console.error('Config update failed:', modeResult.error);
    }
  } catch (error) {
    console.error(error);
  }
};

  const fpOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'FP16', value: 'fp16' },
    { label: 'FP32', value: 'fp32' },
  ];
  const VAEOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'FP16', value: 'fp16' },
    { label: 'FP32', value: 'fp32' },
  ];

  return (
    <Modal
      title={t(KEYS.settings)}
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      className={styles.settingsModal}
    >
      <Divider 
        style={{
          margin: '16px 0 0 0',
        }}
      />
      <Layout
        className='settings-layout'
      >
        <Sider className='sider'>
            <Menu
            mode="inline"
            selectedKeys={[activeMenuKey]}
            onClick={onMenuItemClick}
            className='sider-menu'
            >
              <Menu.Item key="general" className='sider-menu-item'>
                <div className='sider-menu-item-icon'>
                  <PersonIcon/>
                </div>
                <a>{t(KEYS.general)}</a>
              </Menu.Item>
              <Menu.Item key="startup-settings" className='sider-menu-item'>
                <div className='sider-menu-item-icon'>
                  <PlayCircleIcon />
                </div>
                <a>{t(KEYS.startupSettings)}</a>
              </Menu.Item>
              <Menu.Item key="about" className='sider-menu-item'>
                <div className='sider-menu-item-icon'>
                  <InfoIcon/>
                </div>
                <a>{t(KEYS.about)}</a>
              </Menu.Item>
            </Menu>
        </Sider>
        <Content >
          <div className="settings-content">
            {activeMenuKey === 'general' && 
              <div>
                <div className='general-language'>
                  <div className='general-language-title'>{t(KEYS.language)}</div>
                  <Select
                    defaultValue={currentLanguage}
                    style={{ width: 120 }}
                    onChange={handleChange}
                    options={[
                      { value: 'en-US', label: 'English' },
                      { value: 'zh-CN', label: '中文' },
                      { value: 'ja', label: '日本語' },
                      { value: 'ru', label: 'Русский' },
                    ]}
                  />
                </div>
                <div className='general-sdpath'>
                  <div className='gerneral-sdpath-title'>{t(KEYS.sdWebUIPath)}</div>
                  <div className='general-sdpath-content'>{t(KEYS.sdWebUIPathDesc)}</div>
                  <Input value={sdwebuiPath} placeholder="Input SD WebUI path if exists" disabled={true} style={{ width: 400, height:40}} />
                  {electronEnv && <div onClick={selectFolder} className='general-sdpath-button'>{t(KEYS.changeLocation)}</div>}
                </div>
              </div>
            }
            {activeMenuKey === 'startup-settings' && 
              <div>
                <div className='general-startup-settings'>
                  <div className='general-startup-settings-title'>{t(KEYS.floatingPointPrecision)}</div>
                  <Segmented
                    options={fpOptions}
                    value={fpValue}
                    onChange={onFPModeChange}
                  />
                </div>
                <div className='general-startup-settings'>
                  <div className='general-startup-settings-title'>{t(KEYS.vaePrecision)}</div>
                  <Segmented
                    options={VAEOptions}
                    value={vaeValue}
                    onChange={onVAEModeChange}
                  />
                </div>
              </div>
            }
            {activeMenuKey === 'about' && 
              <div>
                <div className='about-content'>
                  <div className="logo">
                    <LogoIcon/>
                  </div>
                  <div>
                    <div className='about-content-title'>Comflowy</div>
                    <div>{t(KEYS.version)} {process.env.NEXT_PUBLIC_APP_VERSION}</div>
                  </div>
                </div>
                <Divider/>
                <div className='about-link'>
                  <div className='about-link-title'>{t(KEYS.links)}</div>
                  <div className='about-link-list'>
                    <a onClick={() => openExternalURL("https://www.comflowy.com/change-log")} target="_blank">{t(KEYS.changelog)}</a>
                    <div>
                      <a onClick={() => openExternalURL("https://github.com/6174/comflowyspace")} target="_blank">• Github </a><span>{t(KEYS.star)}</span>
                    </div>
                  </div> 
                </div>
                <div className='about-community'>
                  <div className='about-community-title'>{t(KEYS.community)}</div>
                  <div>
                    <p>{t(KEYS.communityDesc)}</p>
                  </div>
                  <div onClick={() => openExternalURL("https://discord.com/invite/cj623WvcVx")} className='about-community-button'>
                    {t(KEYS.joinDiscordCommunity)}
                  </div>
                </div>
              </div>
            }
          </div>
        </Content>
      </Layout>
    </Modal>
  );
};

export default SettingsModal;