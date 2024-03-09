import React, { useState } from 'react';
import { Modal, Menu, Layout, Divider, Select, Space} from 'antd';
import type { MenuProps } from 'antd';
import { openExternalURL } from '@/lib/electron-bridge';
import styles from './setting-modal.style.module.scss'; 
import { changeLaunguage , currentLang} from '@comflowy/common/i18n';
import LogoIcon from 'ui/icons/logo';
import { BulbIcon, ExtensionIcon, ModelIcon, TutorialIcon, WorkflowIcon, SettingsIcon } from 'ui/icons'

const SettingsModal = ({ isVisible, handleClose }) => {
  const [activeMenuKey, setActiveMenuKey] = useState('general');
  const { Header, Content, Footer, Sider } = Layout;

  const onMenuItemClick = ({ key }) => {
    setActiveMenuKey(key);
  };

  const languageMap = {
    'en-US': 'English',
    'zh-CN': 'Chinese',
    'ja-JP': 'Japanese'
  };

  const currentLanguage = languageMap[currentLang] || 'English';

  const handleChange = (value: string) => {
    localStorage.setItem('i18n', value);
    changeLaunguage(value);
    window.location.reload();
  };

  return (
    <Modal
      title="Settings"
      visible={isVisible}
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
                <WorkflowIcon/>
                <a>General</a>
              </Menu.Item>
              <Menu.Item key="about" className='sider-menu-item'>
                <BulbIcon/>
                <a>About</a>
              </Menu.Item>
            </Menu>
        </Sider>
        <Content >
          <div className="settings-content">
            {activeMenuKey === 'general' && 
              <div>
                <div className='general-language'>
                  <div className='general-language-title'>Language</div>
                  <Select
                    defaultValue={currentLanguage}
                    style={{ width: 120 }}
                    onChange={handleChange}
                    options={[
                      { value: 'en-US', label: 'English' },
                      { value: 'zh-CN', label: 'Chinese' },
                      { value: 'ja-JP', label: 'Japanese' },
                    ]}
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
                    <div>Version 0.1.1</div>
                  </div>
                </div>
                <Divider/>
                <div className='about-link'>
                  <div className='about-link-title'>Links</div>
                  <div className='about-link-list'>
                    <a onClick={() => openExternalURL("https://www.comflowy.com/change-log")} target="_blank">• Product change log</a>
                    <a onClick={() => openExternalURL("https://github.com/6174/comflowyspace")} target="_blank">• Github</a>
                  </div> 
                </div>
                <div className='about-community'>
                  <div className='about-community-title'>Community</div>
                  <div>
                    <p>Have an idea, feature request or found a bug? Let us know, and we'll take a look at it!</p>
                  </div>
                  <div onClick={() => openExternalURL("https://discord.com/invite/cj623WvcVx")} target="_blank" className='about-community-button'>
                    Join Discord Community
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