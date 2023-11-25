import { Button, Space, theme } from "antd"
import ConfigProvider from "antd/es/config-provider"
import type { ReactNode } from "react";

export const ThemeProvider = (props: { 
  children: ReactNode,
  dark?: boolean,
  getPopupContainer?: () => HTMLDivElement
}) => (
  <ConfigProvider
    getPopupContainer={props.getPopupContainer}
    theme={{
      algorithm: props.dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        // colorPrimary: '#00b96b',
        colorPrimary: "#765AFD"
      }
    }}>
    {props.children}
  </ConfigProvider>
)