import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import pt, { type TranslationDict } from "./locales/pt";
import en from "./locales/en";
import es from "./locales/es";

export type Language = "pt" | "en" | "es";

export const LOCALE_MAP: Record<Language, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

const DICTIONARIES: Record<Language, TranslationDict> = { pt, en, es };

const STORAGE_KEY = "devboard-language";

export type TFunction = (
  selector: (dict: TranslationDict) => string,
  params?: Record<string, string | number>
) => string;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TFunction;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectDefaultLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "pt" || stored === "en" || stored === "es") return stored;

  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("es")) return "es";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => detectDefaultLanguage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = DICTIONARIES[language];
    const t: TFunction = (selector, params) => {
      let text = selector(dict);
      if (params) {
        for (const [key, paramValue] of Object.entries(params)) {
          text = text.split(`{{${key}}}`).join(String(paramValue));
        }
      }
      return text;
    };
    return { language, setLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation deve ser usado dentro de um LanguageProvider");
  }
  return context;
}
