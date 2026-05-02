export type Locale = 'en' | 'zh-TW';

export const locales = ['en', 'zh-TW'] as const;
export const defaultLocale: Locale = 'en';
export const LANG_STORAGE_KEY = 'lang';

export function isValidLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
