import React, { ReactNode, useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import {KEYS, t} from "@comflowy/common/i18n";
type Props = {
  children: ReactNode
  title?: string
}
import styles from "./layout.style.module.scss";
import SettingsModal from '../setting-modal/setting-modal'; 
import { openExternalURL } from '@/lib/electron-bridge';
import { Divider, Tooltip } from 'antd';
import { useRouter } from 'next/router'
import LogoIcon from 'ui/icons/logo'
import { BulbIcon, ExtensionIcon, ModelIcon, TutorialIcon, WorkflowIcon, SettingsIcon, TerminalIcon, QuestionIcon } from 'ui/icons'
import { useDashboardState } from '@comflowy/common/store/dashboard-state'
import { useAppStore } from '@comflowy/common/store'
import Bootstrap from '../bootstrap/bootstrap'
import { GlobalEvents, SlotGlobalEvent } from '@comflowy/common/utils/slot-event';
import { NotificationModalEntry } from '../my-workflows/notification-modal';
import { getComfyUIBackendUrl } from '@comflowy/common/config';
import { ComfyUIRunPreviewMode } from '@comflowy/common/types';

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  const { bootstraped } = useDashboardState();
  const route = useRouter();
  const path = route.pathname;
  const onInit = useAppStore(st => st.onInit);
  useEffect(() => {
    if (typeof window !== 'undefined' && bootstraped) {
      onInit();
    }
  }, [bootstraped]);

  const previewMode = useDashboardState(state => state.appConfigs?.runConfig?.previewMode || ComfyUIRunPreviewMode.Latent2RGB);
  useEffect(() => {
    const changePreviewValue = async () => {
      try {
        const api = getComfyUIBackendUrl('/manager/preview_method?value=' + previewMode);
        await fetch(api);
      } catch (err) {
        console.log(err);
      }
    }
    changePreviewValue();
  }, [previewMode]);

  return (
    <>
      {!bootstraped ? (
        <Bootstrap />
      ) : (
        <>
          <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          </Head>
          <div id="app" className={styles.app}>
            <WorkspaceNav/>
            <div className="workspace-main" style={{
              overflow: ['/models', '/extensions'].indexOf(path) !== -1 ? 'hidden' : 'auto',
            }}>
              <div className='main-inner'>
                {children}
              </div>
            </div>
          </div>
        </>
      )}
  </>
  )
}

const WorkspaceNav = () => {
  const route = useRouter();
  const path = route.pathname;
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const showSettingsModal = () => {
    setIsSettingsModalVisible(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalVisible(false);
  };
  const changeRoute = useCallback((url) => {
    route.push(url);
  }, [route])

  return (
    <div className="workspace-nav">
      <div className="nav-main">
        <div className="logo">
          <LogoIcon/>
          <div className="text">Comflowy</div>
        </div>
        <div className="sub">{t(KEYS.menu)}</div>
        <div className="nav-list">
          <div className={`workspace-nav-item ${path === "/" ? "active" : ""}`} onClick={ev => {
            changeRoute("/")
          }}>
            <div className="icon">
              <WorkflowIcon/>
            </div>
            <a>
              {t(KEYS.workflows)}
            </a>
          </div>
          <div className={`workspace-nav-item ${path === "/templates" ? "active" : ""}`} onClick={ev => {
            changeRoute("/templates")
          }}>
            <div className="icon">
              <BulbIcon/>
            </div>
            <a>
              {t(KEYS.templates)}
            </a>
          </div>
          <div className={`workspace-nav-item ${path === "/models" ? "active" : ""}`} onClick={ev => {
            changeRoute("/models")
          }}>
            <div className="icon">
              <ModelIcon/>
            </div>
            <a>
              {t(KEYS.models)}
            </a>
          </div>
          <div className={`workspace-nav-item ${path === "/extensions" ? "active" : ""}`} onClick={ev => {
            changeRoute("/extensions")
          }}>
            <div className="icon">
              <ExtensionIcon/>
            </div>
            <a>
              {t(KEYS.extensions)}
            </a>
          </div>
          <div className={`workspace-nav-item ${path === "/tutorials" ? "active" : ""}`} onClick={ev => {
            changeRoute("/tutorials")
          }}>
            <div className="icon">
              <TutorialIcon/>
            </div>
            <a>
              {t(KEYS.tutorials)}
            </a>
          </div>
        </div>
      </div>
      <div className='nav-footer'>
        <div className="workspace-nav-bottom-item">
          <div className="item">
            <Tooltip title={t(KEYS.appSettings)}>
              <div className="action" onClick={showSettingsModal}>
                <div className="icon"><SettingsIcon /></div>
              </div>
            </Tooltip>
          </div>
          
          <div className="item">
            <Tooltip title={t(KEYS.comfyUIProcessTerminal)}>
              <div className="action" onClick={ev => {
                SlotGlobalEvent.emit({
                  type: GlobalEvents.show_comfyprocess_manager,
                  data: null
                })
              }}>
                <div className="icon">
                  <TerminalIcon />
                </div>
              </div>
            </Tooltip>
          </div>
          <div className="item">
            <NotificationModalEntry/>
            {/* <Tooltip title="Get help from Discord Server">
              <div className="action" onClick={() => openExternalURL("https://discord.com/invite/cj623WvcVx")} >
                <div className="icon">
                  <QuestionIcon />
                </div>
              </div>
            </Tooltip> */}
          </div>
        </div>
        <SettingsModal
          isVisible={isSettingsModalVisible}
          handleClose={closeSettingsModal}
        />
      </div>
  </div>)
}

export default Layout
