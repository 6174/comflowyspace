export enum KEYS {
  appName = "appName",
  myWorkflows = "myWorkflows",
  templates = "templates",
  tutorials = "tutorials",
  models = "models",
  extensions = "extensions"
}

export type i18nKey = keyof typeof KEYS;
export type i18nLang = {
  [key in KEYS]: string
};

export type LanguageType = "zh-CN" | "en-US" | "ja";
export type i18nAllLang = {
  [key in KEYS]: {
    'en-US': string,
    'zh-CN': string,
    'ja': string
  }
};