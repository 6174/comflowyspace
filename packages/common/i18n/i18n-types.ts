export enum KEYS {
  appName = "appName",
  myWorkflows = "myWorkflows",
}

export type i18nKey = keyof typeof KEYS;
export type i18nLang = {
  [key in KEYS]: string
};

export type i18nAllLang = {
  [key in KEYS]: {
    en_US: string,
    zh_CN: string,
    jp: string
  }
};