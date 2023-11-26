export enum KEYS {
  appName = "appName",
}

export type i18nKey = keyof typeof KEYS;
export type i18nLang = {
  [key in KEYS]: string
};