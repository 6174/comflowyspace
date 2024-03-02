import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import theme from "../lib/theme-config";
import "../styles/global.scss";
import {useDashboardState} from "@comflowy/common/store/dashboard-state";
import { DraggableModalProvider } from "ui/antd/draggable-modal";
import { JSONDBClient } from "@comflowy/common/jsondb/jsondb.client";
import { PanelsContainerServerAdapter } from "@/components/panel/panel-container";

const App = ({ Component, pageProps }: AppProps) => {
  const JSXCO = Component as any;
  const {onInit} = useDashboardState();
  useEffect(()=> {
    onInit();
    JSONDBClient.listen();
    // Check if the platform is Windows
    if (navigator.userAgent.indexOf('Win') > -1) {
      // Add 'windows' class to the document
      document.body.className += ' windows';
    }
  }, [])

  return (
    <ConfigProvider theme={theme}>
      <DraggableModalProvider>
        <PanelsContainerServerAdapter panels={[]}>
          <JSXCO {...pageProps} />
        </PanelsContainerServerAdapter>
      </DraggableModalProvider>
    </ConfigProvider>
  );
}

export default App;
