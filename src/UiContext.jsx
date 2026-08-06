import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('voltio-language') || 'ar');
  const [theme, setTheme] = useState(() => localStorage.getItem('voltio-theme') || 'dark');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('voltio-language', language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('voltio-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ language, setLanguage, theme, setTheme, isArabic: language === 'ar' }), [language, theme]);
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export const useUi = () => useContext(UiContext);
