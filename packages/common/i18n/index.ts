import ALLLang from "./ALL_LANG";
import type { LanguageType, i18nKey, i18nLang } from "./i18n-types";
export * from "./i18n-types";
export const isWindow = typeof window !== 'undefined';

export let currentLang: LanguageType = "en-US";

if (isWindow) {
  const storedLang = localStorage.getItem('i18n') || "en-US";
  currentLang = storedLang as LanguageType;
  document.body.setAttribute("data-locale", currentLang);
}

export function changeLaunguage(lang: LanguageType) {
  document.body.setAttribute("data-locale", lang);
  currentLang = lang;
  localStorage.setItem('i18n', lang);
}
/**
 * Tool for translation
 * @param key 
 * @returns 
 */
export function t(key: i18nKey): string {
  const allLang = ALLLang[key];
  if (allLang) {
    return allLang[currentLang] || allLang['en-US'] || key;
  }
  return key;
}