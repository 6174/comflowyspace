import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import theme from "../lib/theme-config";
import "../styles/global.scss";
import {useDashboardState} from "@comflowy/common/store/dashboard-state";
import { DraggableModalProvider } from "ui/antd/draggable-modal";
import { JSONDBClient } from "@comflowy/common/jsondb/jsondb.client";

const App = ({ Component, pageProps }: AppProps) => {
  const JSXCO = Component as any;
  const {onInit} = useDashboardState();
  useEffect(()=> {
    onInit();
    JSONDBClient.listen();
  }, [])

  return (
    <ConfigProvider theme={theme}>
      <DraggableModalProvider>
        <JSXCO {...pageProps} />
      </DraggableModalProvider>
    </ConfigProvider>
  );
}

export default App;
