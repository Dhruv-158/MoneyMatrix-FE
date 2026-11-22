import { DEFAULT_CURRENCY, CURRENCY_LOCALE } from '@/constants';

const LANG_LOCALE = {
  en: 'en-IN',
  hi: 'hi-IN',
};

export const localeFromLanguage = (language = 'en') =>
  LANG_LOCALE[language] || CURRENCY_LOCALE || 'en-IN';

export const resolveMediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = api.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * @param {number} amount
 * @param {string} [currencyCode] ISO code e.g. INR
 * @param {{ symbol?: string, locale?: string, language?: string }} [opts]
 */
export const formatCurrency = (amount, currencyCode = 'INR', opts = {}) => {
  if (amount === null || amount === undefined) {
    const sym = opts.symbol || DEFAULT_CURRENCY;
    return `${sym}0`;
  }

  const locale = opts.locale || localeFromLanguage(opts.language) || CURRENCY_LOCALE;
  const code = currencyCode || 'INR';
  const customSymbol = (opts.symbol || '').trim();

  if (customSymbol) {
    const num = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount));
    return `${customSymbol}${num}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${DEFAULT_CURRENCY}${Number(amount).toLocaleString(locale)}`;
  }
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatDate = (date, language = 'en') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(localeFromLanguage(language), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date, language = 'en') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(localeFromLanguage(language), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}…` : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
