import { DEFAULT_CURRENCY, CURRENCY_LOCALE } from '@/constants';

export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  if (amount === null || amount === undefined) return `${currency}0`;
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
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
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, n = 30) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '...' : str;
};

export const getTransactionColor = (type) => {
  switch (type) {
    case 'income': return 'text-success';
    case 'expense': return 'text-danger';
    case 'transfer': return 'text-primary';
    default: return 'text-foreground';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
    case 'paid':
    case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'overdue':
    case 'cancelled':
    case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'inactive': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentMonth = () => {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
};

export const getMonthRange = (month, year) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};
