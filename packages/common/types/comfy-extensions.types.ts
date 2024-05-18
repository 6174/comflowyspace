export type ExtensionManifest = {
  name?: string;
  version?: string;
  main?: string;
  ui?: string;
  author?: string;
  description?: string;
  thumbnail?: string;
}

export type Extension = {
  id: string;
  title: string;
  custom_extension?: boolean;
  reference: string;
  author: string;
  files: string[];
  js_path: string;
  pip: string[];
  install_type: "git-clone" | "copy" | "unzip" | "custom";
  description: string;
  installed?: boolean;
  need_update?: boolean;
  disabled?: boolean;
  manifest?: ExtensionManifest;
  readme?: string;
  [_: string]: any,
}

export type ExtensionNodeMap = {
  [key: string]: string[]
}