import ALLLang from "./ALL_LANG";
import type { LanguageTranslation, LanguageType, i18nKey } from "./i18n-types";
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

const dynamicLang: Record<string, LanguageTranslation> = {}

export function registerDynamicTranslation(key: string, tranlations: LanguageTranslation) {
  dynamicLang[key] = tranlations;
}

/**
 * dynamic key translation
 * @param key 
 * @param lang 
 * @param def default value
 */
export function dt(key: string, def?: string) {
  if (dynamicLang[key]) {
    return dynamicLang[key][currentLang] || dynamicLang[key]['en-US'] || def || key;
  }
  return t(key as i18nKey, def);
}

/**
 * Tool for translation
 * @param key 
 * @returns 
 */
export function t(key: i18nKey, def?: string): string {
  const allLang = ALLLang[key];
  if (allLang) {
    return allLang[currentLang] || allLang['en-US'] || def || key;
  }
  return def || key;
}