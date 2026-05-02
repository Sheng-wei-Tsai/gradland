'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { type Locale, defaultLocale, LANG_STORAGE_KEY, isValidLocale } from '@/lib/i18n';
import enMessages from '@/messages/en.json';
import zhTWMessages from '@/messages/zh-TW.json';

type Messages = typeof enMessages;

interface LangContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LangContext = createContext<LangContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

const messagesByLocale: Record<Locale, Messages> = {
  en: enMessages,
  'zh-TW': zhTWMessages,
};

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isValidLocale(saved)) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LANG_STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  return (
    <LangContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
        {children}
      </NextIntlClientProvider>
    </LangContext.Provider>
  );
}
