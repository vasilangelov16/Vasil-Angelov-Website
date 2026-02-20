import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import mk from "./locales/mk.json";

const STORAGE_KEY = "vasil-lang";

export const languages = [
  { code: "en", label: "EN" },
  { code: "mk", label: "MK" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mk: { translation: mk },
  },
  lng: (() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "mk") return stored;
    const browser = navigator.language.slice(0, 2).toLowerCase();
    return browser === "mk" ? "mk" : "en";
  })(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  if (typeof document !== "undefined") document.documentElement.lang = lng;
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
