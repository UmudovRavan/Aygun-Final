import { createContext, useContext, useState, ReactNode } from 'react';
import i18n from '../i18n';

type Lang = 'en' | 'az' | 'ru';
interface LangCtx { lang: Lang; setLang: (l: Lang) => void; }

const LangContext = createContext<LangCtx>({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  const setLang = (l: Lang) => {
    setLangState(l);
    i18n.changeLanguage(l);
    localStorage.setItem('lang', l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLanguage = () => useContext(LangContext);
