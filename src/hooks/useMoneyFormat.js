import { useSelector } from 'react-redux';
import { formatCurrency as formatCurrencyRaw, formatDate as formatDateRaw } from '@/utils/helpers';

export function useMoneyFormat() {
  const settings = useSelector((s) => s.auth.user?.settings) || {};
  const currency = settings.currency || 'INR';
  const symbol = settings.currencySymbol || '';
  const language = settings.language || 'en';
  const maskBalances = Boolean(settings.privacy?.maskBalances);
  const hideFriendEmails = Boolean(settings.privacy?.hideFriendEmails);

  const formatMoney = (amount) => {
    if (maskBalances) return '••••';
    return formatCurrencyRaw(amount, currency, { symbol, language });
  };

  const formatDate = (date) => formatDateRaw(date, language);

  return {
    currency,
    symbol,
    language,
    maskBalances,
    hideFriendEmails,
    formatMoney,
    formatDate,
  };
}
