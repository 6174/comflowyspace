import ZHCN from "./ZHCN";
import ENUS from "./ENUS";
import ALLLang from "./ALL_LANG";
import type { LanguageType, i18nKey, i18nLang } from "./i18n-types";
export * from "./i18n-types";
export const isWindow = typeof window !== 'undefined';
/**
 * All launguages
 */
export const languages: { [_: string]: Partial<i18nLang> } = {
  'zh-CN': ZHCN,
  'en-US': ENUS,
  'ja': ENUS
};

let currentLang: LanguageType = "en-US";

export function changeLaunguage(lang: LanguageType) {
  document.body.setAttribute("data-locale", lang as string);
  let defaultLanguage = localStorage.getItem('i18n') || navigator.language || navigator.languages[0];
  // If the default language is "en", then set it to "en-US"
  if (defaultLanguage.indexOf("en-") >= 0) {
    defaultLanguage = "en-US";
  }
  currentLang = defaultLanguage as LanguageType;
}

if (isWindow) {
  changeLaunguage(currentLang);
}

/**
 * Tool for translation
 * @param key 
 * @returns 
 */
export function t(key: i18nKey): string {
  const allLang = ALLLang[key];
  if (allLang) {
    return allLang[currentLang];
  }
  const lang = languages[currentLang] || {};
  return lang[key] || key;
}