import { supportedLocales } from './locales';

export type Locale = (typeof supportedLocales)[number]['code'];

// Local fork preference: English. The server renders with this locale before
// the browser's stored choice is readable, so a non-matching default shows up
// as a hydration mismatch on every page. Upstream ships 'zh-CN'.
export const defaultLocale: Locale = 'en-US';
