import type { ReactNode } from "react"
import { StyleProvider } from "@ant-design/cssinjs"

export const AntStyleProvider = (props: { rootId: string, children: ReactNode }) => (
  <StyleProvider container={document.getElementById(props.rootId)!.shadowRoot!}>
    {props.children}
  </StyleProvider>
)