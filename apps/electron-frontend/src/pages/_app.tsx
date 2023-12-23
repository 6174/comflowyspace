import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import theme from "../lib/theme-config";
import "../styles/global.scss";
import {useDashboardState} from "@comflowy/common/store/dashboard-state";
import { useAppStore } from "@comflowy/common/store";

const App = ({ Component, pageProps }: AppProps) => {
  const JSXCO = Component as any;
  const {onInit} = useDashboardState();
  const {onInit: onInit2} = useAppStore();

  useEffect(()=> {
    onInit();
    onInit2();
  }, [])

  return (
    <ConfigProvider theme={theme}>
      <JSXCO {...pageProps} />
    </ConfigProvider>
  );
}

export default App;
