import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

import theme from "../lib/theme-config";
import "../styles/global.scss";
import {useDashboardState} from "@comflowy/common/store/dashboard-state";

const App = ({ Component, pageProps }: AppProps) => {
  const JSXCO = Component as any;
  const {onInit, env, loading} = useDashboardState();
  console.log("pathname", env);
  useEffect(()=> {
    onInit();
  }, [])

  return (
    <ConfigProvider theme={theme}>
      <JSXCO {...pageProps} />
    </ConfigProvider>
  );
}

export default App;
