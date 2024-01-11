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

export enum ExtensionEventTypes {
  execute = "execute",
  executeError = "executeError",
  showUI = "showUI",
  uiMessage = "uiMessage",
  editorMessage = "editorMessage"
}