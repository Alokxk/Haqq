import en from "./locales/en.json";
import hi from "./locales/hi.json";
import type { Language } from "./App";

const translations = { en, hi };

export function useT(language: Language) {
  return translations[language];
}
