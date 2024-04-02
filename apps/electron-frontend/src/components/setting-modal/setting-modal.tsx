import React, { useState, useCallback, use, useEffect } from 'react';
import { Modal, Menu, Layout, Divider, Select, Space, Input, Button, message, Segmented, Alert } from 'antd';
import type { MenuProps } from 'antd';
import { comfyElectronApi, openExternalURL, useIsElectron } from '@/lib/electron-bridge';
import styles from './setting-modal.style.module.scss';
import { LanguageType, changeLaunguage, currentLang } from '@comflowy/common/i18n';
import { getBackendUrl, getComfyUIBackendUrl } from '@comflowy/common/config';
import LogoIcon from 'ui/icons/logo';
import { SettingsIcon, InfoIcon, PersonIcon } from 'ui/icons';
import { KEYS, t } from "@comflowy/common/i18n";
import { useDashboardState } from '@comflowy/common/store/dashboard-state';
import { updateComflowyRunConfig } from '@comflowy/common/comfyui-bridge/bridge';
import { AppConfigs, ComfyUIRunFPMode, ComfyUIRunPreviewMode, ComfyUIRunVAEMode } from '@comflowy/common/types';

const { Header, Content, Footer, Sider } = Layout;

const SettingsModal = ({ isVisible, handleClose }) => {
  const onLoadAppConfig = useDashboardState(state => state.onLoadAppConfig);
  useEffect(() => {
    onLoadAppConfig();
  }, []);
  const [activeMenuKey, setActiveMenuKey] = useState('general');
  const onMenuItemClick = ({ key }) => {
    setActiveMenuKey(key);
  };
  return (
    <Modal
      title={t(KEYS.settings)}
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      className={styles.settingsModal}
    >
      <Divider style={{ margin: '16px 0 0 0' }} />
      <Layout className='settings-layout' >
        <Sider className='sider'>
          <Menu mode="inline" selectedKeys={[activeMenuKey]} onClick={onMenuItemClick} className='sider-menu' >
            <Menu.Item key="general" className='sider-menu-item'>
              <div className='sider-menu-item-icon'>
                <PersonIcon />
              </div>
              <a>{t(KEYS.general)}</a>
            </Menu.Item>
            <Menu.Item key="about" className='sider-menu-item'>
              <div className='sider-menu-item-icon'>
                <InfoIcon />
              </div>
              <a>{t(KEYS.about)}</a>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content>
          <div className="settings-content">
            {activeMenuKey === 'general' &&
              <>
                <SelectLanguage/>
                <SelectExecutionPrecisionMode />
                <SelectSDPath/>
              </>
            }
            {activeMenuKey === 'about' && <AboutComflowySpace />}
          </div>
        </Content>
      </Layout>
    </Modal>
  );
};

function SelectSDPath() {
  const onLoadAppConfig = useDashboardState(state => state.onLoadAppConfig);
  const savedSdwebuiPath = useDashboardState(state => state.appConfigs?.appSetupConfig?.stableDiffusionDir || '');
  const [sdwebuiPath, setSdwebuiPath] = useState(savedSdwebuiPath);
  useEffect(() => {
    setSdwebuiPath(savedSdwebuiPath);
  }, [savedSdwebuiPath]);

  const [loading, setLoading] = useState(false);

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
            onLoadAppConfig();
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
  return (
    <div className='general-sdpath section'>
      <div className='gerneral-sdpath-title section-title'>{t(KEYS.sdWebUIPath)}</div>
      <div className='general-sdpath-content'>{t(KEYS.sdWebUIPathDesc)}</div>
      <Input value={sdwebuiPath} placeholder="Input SD WebUI path if exists" disabled={true} style={{ width: 400, height: 40 }} />
      <div className="row" style={{marginTop: 10}}>
        {electronEnv && <Button onClick={selectFolder} >{t(KEYS.changeLocation)}</Button>}
      </div>
    </div>
  )
}

function SelectLanguage() {
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

  const showNotice = ['zh-CN', 'ja'].indexOf(currentLang) >= 0;
  return (
    <div className='section'>
      <div className='section-title'>{t(KEYS.language)}</div>
      <div className="section-content">
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
        <p>
          {showNotice  && <Alert style={{fontSize: 12, wordBreak: 'break-all'}} showIcon type='info' message={t(KEYS.languageChangeNotice)}/> }
        </p>
      </div>
    </div>
  )
}

function SelectExecutionPrecisionMode() {
  const onLoadAppConfig = useDashboardState(state => state.onLoadAppConfig);
  const options = [
    { label: 'Normal', value: 'normal' },
    { label: 'FP16', value: 'fp16' },
    { label: 'FP32', value: 'fp32' },
  ];

  const runConfig = useDashboardState(state => state.appConfigs?.runConfig);

  const [FPValue, setFPValue] = useState('normal');
  const [VAEValue, setVAEValue] = useState('normal');

  useEffect(() => {
    if (runConfig) {
      setFPValue(runConfig.fpmode || 'normal');
      setVAEValue(runConfig.vaemode || 'normal');
    }
  }, [runConfig]);

  const saveConfig = async (props: Partial<AppConfigs["runConfig"]>) => {
    try {
      await updateComflowyRunConfig(props);
      message.success("Save success");
      onLoadAppConfig();
    } catch (err) {
      message.error("Save faileld:" + err.message);
    }
  }

  const [previewValue, setPreviewValue] = useState(runConfig.previewMode || ComfyUIRunPreviewMode.Latent2RGB);
  const [extraCommand, setExtraCommand] = useState(runConfig.extraCommand || "");

  return (
    <>
      <div className="precision-mode section">
        <div className='general-startup-settings-title section-title'>{t(KEYS.floatingPointPrecision)}</div>
        <Segmented
          options={options}
          value={FPValue}
          onChange={(value) => {
            const v = value.toString()
            setFPValue(v);
            saveConfig({ 
              fpmode: v as ComfyUIRunFPMode
            });
          }}
        />
      </div>
      <div className="vae-mode section">
        <div className='general-startup-settings-title section-title'>{t(KEYS.vaePrecision)}</div>
        <Segmented
          options={options}
          value={VAEValue}
          onChange={(value) => {
            const v = value.toString()
            setVAEValue(v);
            saveConfig({
              vaemode: v as ComfyUIRunVAEMode
            });
          }}
        />
      </div>

      <div className="preview-mode section">
        <div className='general-startup-settings-title section-title'>{t(KEYS.comfyui_preview_mode)}</div>
        <Segmented
          options={[{
            value: ComfyUIRunPreviewMode.Auto,
            label: "auto"
          }, {
            value: ComfyUIRunPreviewMode.Latent2RGB,
            label: "latent2rgb(fast)"
          }, {
            value: ComfyUIRunPreviewMode.TAESD,
            label: "taesd(slow)"
          }, {
            value: ComfyUIRunPreviewMode.NoPreviews,
            label: "none(very fast)"
          }]}
          value={previewValue}
          onChange={async (value) => {
            const v = value.toString() as ComfyUIRunPreviewMode;
            setPreviewValue(v);
            saveConfig({
              previewMode: v
            });
          }}
        />
      </div>

      <div className="extra-command section">
        <div className='general-startup-settings-title section-title'>{t(KEYS.comfyui_extra_commands)}</div>
        <Input value={extraCommand} placeholder={t(KEYS.comfyui_extra_commands)} onChange={(ev) => {
          const v = ev.target.value.toString().trim()
          setExtraCommand(v);
          saveConfig({
            extraCommand: v
          });
        }}/>
      </div>
    </>
  )
}

function AboutComflowySpace() {
  return (
    <div>
      <div className='about-content'>
        <div className="logo">
          <LogoIcon />
        </div>
        <div>
          <div className='about-content-title'>Comflowy</div>
          <div>{t(KEYS.version)} 0.1.4-alpha</div>
        </div>
      </div>
      <Divider />
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
  )
}

export default SettingsModal;