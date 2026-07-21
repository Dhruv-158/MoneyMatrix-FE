// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Currency
export const DEFAULT_CURRENCY = '₹';
export const CURRENCY_LOCALE = 'en-IN';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Transaction Types
export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income', color: '#22c55e' },
  { value: 'expense', label: 'Expense', color: '#ef4444' },
  { value: 'transfer', label: 'Transfer', color: '#3b82f6' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
];

// Account Types
export const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings' },
  { value: 'current', label: 'Current' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'wallet', label: 'Digital Wallet' },
];

// EMI Status
export const EMI_STATUS = [
  { value: 'active', label: 'Active', color: '#3b82f6' },
  { value: 'paid', label: 'Paid', color: '#22c55e' },
  { value: 'overdue', label: 'Overdue', color: '#ef4444' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
];

// Subscription Status
export const SUBSCRIPTION_STATUS = [
  { value: 'active', label: 'Active', color: '#22c55e' },
  { value: 'inactive', label: 'Inactive', color: '#6b7280' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

// Category Icons
export const CATEGORY_ICONS = [
  'ShoppingCart', 'Utensils', 'Car', 'Home', 'Zap', 'Heart',
  'Briefcase', 'GraduationCap', 'Plane', 'Gamepad2', 'Music',
  'Film', 'Gift', 'CreditCard', 'Smartphone', 'Wifi',
  'Coffee', 'Shirt', 'Dumbbell', 'Pill', 'Baby', 'Dog',
];

// Default Categories
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b' },
  { name: 'Shopping', icon: 'ShoppingCart', color: '#8b5cf6' },
  { name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { name: 'Housing', icon: 'Home', color: '#22c55e' },
  { name: 'Utilities', icon: 'Zap', color: '#ef4444' },
  { name: 'Healthcare', icon: 'Heart', color: '#ec4899' },
  { name: 'Entertainment', icon: 'Gamepad2', color: '#06b6d4' },
  { name: 'Education', icon: 'GraduationCap', color: '#14b8a6' },
  { name: 'Travel', icon: 'Plane', color: '#f97316' },
  { name: 'Salary', icon: 'Briefcase', color: '#22c55e' },
  { name: 'Freelance', icon: 'Briefcase', color: '#10b981' },
  { name: 'Investment', icon: 'CreditCard', color: '#6366f1' },
];

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e11d48',
];

// Months
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Sidebar Navigation
export const SIDEBAR_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
      { path: '/banks', label: 'Banks', icon: 'Building2' },
      { path: '/cash-wallet', label: 'Cash Wallet', icon: 'Wallet' },
    ],
  },
  {
    title: 'MANAGE',
    items: [
      { path: '/emis', label: 'EMIs', icon: 'CalendarClock' },
      { path: '/subscriptions', label: 'Subscriptions', icon: 'RefreshCw' },
      { path: '/categories', label: 'Categories', icon: 'Tags' },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { path: '/reports', label: 'Reports', icon: 'FileBarChart' },
      { path: '/analytics', label: 'Analytics', icon: 'TrendingUp' },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { path: '/settings', label: 'Settings', icon: 'Settings' },
    ],
  },
];
