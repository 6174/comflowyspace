import React from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

import theme from "../lib/theme-config";

const App = ({ Component, pageProps }: AppProps) => {
  const JSXCO = Component as any;
  return (
    <ConfigProvider theme={theme}>
      <JSXCO {...pageProps} />
    </ConfigProvider>
  );
}

export default App;
