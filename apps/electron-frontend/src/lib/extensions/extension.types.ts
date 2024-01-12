export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  main: string;
  ui: string;
}

export type ExtensionManagerEvent = {
  type: string;
  data: {
    extension?: ExtensionManifest;
    [_: string]: any
  }
}

export type ExtensionUIEvent = {
  extensionId: string;
  srcEvent: {
    type: string,
    data: any
  }
}

export type ExtensionEditorEvent = {
  type: string;
  data: any;
}

export enum ExtensionEventTypes {
  execute = "execute",
  executeError = "executeError",
  showUI = "showUI",
  uiMessage = "uiMessage",
  editorMessage = "editorMessage",
  rpcCall = "rpcCall",
  rpcCallResult = "rpcCallResult",
  rpcCallError = "rpcCallError"
}

export interface ExtensionCustomRenderElement {
  id: string;
  name: string;
  type: "button";
  icon?: string;
}

export interface ExtensionNodeCustomRenderConfig {
  extensionId: string;
  elements: {
  }[]
}

export interface ExtensionNodeCustomContextMenuConfig {
  extensionId: string;
  menuItems: {
    id: string;
    name: string;
    icon?: string;
  }[]
}