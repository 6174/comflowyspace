import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import theme from "../lib/theme-config";
import "../styles/global.scss";
import {useDashboardState} from "@comflowy/common/store/dashboard-state";
import { DraggableModalProvider } from "ui/antd/draggable-modal";
import { JSONDBClient } from "@comflowy/common/jsondb/jsondb.client";
import { AsyncComfyUIProcessManager } from "@/components/comfyui-process-manager/comfyui-process-manager-async";
import { AptabaseProvider } from '@aptabase/react';

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
    <AptabaseProvider appKey="A-US-4906357803" options={{
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
      isDebug: process.env.NODE_ENV === "development",
    }}>
      <ConfigProvider theme={theme}>
        <DraggableModalProvider>
          <AsyncComfyUIProcessManager />
          <JSXCO {...pageProps} />
        </DraggableModalProvider>
      </ConfigProvider>
    </AptabaseProvider>
  );
}

export default App;
