import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchTransactions, setPage, deleteTransaction } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { openModal } from '@/redux/slices/modalSlice';

// Icons & Utilities
import { formatCurrency, formatDate } from '@/utils/helpers';
import { transactionService } from '@/services/endpoints';
import toastService from '@/services/toastService';
import EmptyState from '@/components/ui/EmptyState';
import DateFilter from '@/components/ui/DateFilter';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import ActiveFilterChip from '@/components/transactions/ActiveFilterChip';
import BulkActionToolbar from '@/components/transactions/BulkActionToolbar';
import TransactionSkeleton from '@/components/transactions/TransactionSkeleton';

import {
  Search, Filter, ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  ChevronLeft, ChevronRight, Download, FileText, CheckCircle2,
  Clock, XCircle, MoreVertical, Trash2, Check, RefreshCw
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Transactions() {
  const dispatch = useDispatch();
  const { items, total, page, limit, loading } = useSelector((s) => s.transactions);
  const { list: banks } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);

  const [filters, setFilters] = useState({ type: '', bankId: '', startDate: '', endDate: '', year: '', month: '' });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (filters.type) params.type = filters.type;
    if (filters.bankId) params.bankId = filters.bankId;
    if (filters.year) params.year = filters.year;
    if (filters.month) params.month = filters.month;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    dispatch(fetchTransactions(params));
  }, [dispatch, page, filters]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handleSettleFriend = async (txId) => {
    try {
      const { data: res } = await transactionService.settleFriend(txId);
      toastService.success(res?.message || 'Marked as Settled!');
      dispatch(fetchTransactions({ page, limit: 10, ...filters }));
    } catch (err) {
      toastService.error(err.errorMessage || 'Failed to settle transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await dispatch(deleteTransaction(id)).unwrap();
      toastService.success('Transaction deleted');
      dispatch(fetchTransactions({ page, limit: 10, ...filters }));
    } catch (err) {
      toastService.error(err || 'Failed to delete transaction');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} selected transactions?`)) return;
    try {
      for (const id of selectedIds) {
        await dispatch(deleteTransaction(id)).unwrap();
      }
      toastService.success(`${selectedIds.length} transactions deleted`);
      setSelectedIds([]);
      dispatch(fetchTransactions({ page, limit: 10, ...filters }));
    } catch (err) {
      toastService.error('Failed to delete selected transactions');
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((t) => t._id));
    }
  };

  const typeIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (type === 'expense') return <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    return <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  const filteredItems = search
    ? items.filter((t) =>
        t.note?.toLowerCase().includes(search.toLowerCase()) ||
        t.categoryId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.bankId?.bankName?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  // Calculate quick KPIs for Summary
  const moneyIn = items.filter((t) => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const moneyOut = items.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingCount = items.filter((t) => t.friendDetails?.status === 'pending').length;

  const inputClass = 'px-3 py-2 rounded-xl bg-card border border-border text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition';

  const handleDateApply = (dateFilterData) => {
    setFilters((prev) => ({
      ...prev,
      year: dateFilterData.year || '',
      month: dateFilterData.month || '',
      startDate: dateFilterData.startDate || '',
      endDate: dateFilterData.endDate || '',
    }));
    dispatch(setPage(1));
  };

  const handleResetFilters = () => {
    setFilters({ type: '', bankId: '', startDate: '', endDate: '', year: '', month: '' });
    setSearch('');
    dispatch(setPage(1));
  };

  const activeFilterList = [
    filters.type && { key: 'type', label: `Type: ${filters.type}` },
    filters.bankId && {
      key: 'bankId',
      label: `Account: ${banks.find((b) => b._id === filters.bankId)?.bankName || 'Selected'}`,
    },
    filters.year && { key: 'year', label: `Year: ${filters.year}` },
    filters.month && { key: 'month', label: `Month: ${filters.month}` },
    (filters.startDate || filters.endDate) && {
      key: 'dateRange',
      label: `Date: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`,
    },
  ].filter(Boolean);

  if (loading && !items.length) {
    return <TransactionSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Transactions Ledger"
          subtitle="View, search, filter and manage every financial transaction across your accounts."
          onAddTransaction={() => dispatch(openModal('addTransaction'))}
          onExport={() => toast.success('CSV Export initiated')}
        />
      </motion.div>

      {/* 2. TRANSACTION SUMMARY KPI CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Count"
          value={total}
          icon={FileText}
          color="blue"
          subtitle="Total recorded ledger records"
        />
        <StatCard
          title="Money In"
          value={moneyIn}
          icon={ArrowUpRight}
          color="emerald"
          subtitle="Total income on current view"
        />
        <StatCard
          title="Money Out"
          value={moneyOut}
          icon={ArrowDownRight}
          color="rose"
          subtitle="Total expenses on current view"
        />
        <StatCard
          title="Pending Settlements"
          value={pendingCount}
          icon={Clock}
          color="amber"
          subtitle="Friend debts awaiting payoff"
        />
      </motion.div>

      {/* 3. SEARCH AND FILTERS TOOLBAR */}
      <motion.div variants={itemVariants} className="space-y-3 relative z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Prominent Search Bar */}
          <div className="flex items-center gap-2.5 bg-card rounded-2xl px-4 py-2.5 border border-border flex-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/40 transition">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by merchant, note, category or bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition shadow-sm ${
              showFilters
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                : 'bg-card border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Filter Drawer Panel */}
        {showFilters && (
          <div className="relative z-50 p-4 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Filter Parameters
              </h3>
              <button onClick={handleResetFilters} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Reset All Filters
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters({ ...filters, type: e.target.value });
                  dispatch(setPage(1));
                }}
                className={inputClass}
              >
                <option value="" className="bg-card text-foreground">All Transaction Types</option>
                <option value="income" className="bg-card text-foreground">Income</option>
                <option value="expense" className="bg-card text-foreground">Expense</option>
                <option value="transfer" className="bg-card text-foreground">Transfer</option>
              </select>

              {/* Bank Account Filter */}
              <select
                value={filters.bankId}
                onChange={(e) => {
                  setFilters({ ...filters, bankId: e.target.value });
                  dispatch(setPage(1));
                }}
                className={inputClass}
              >
                <option value="" className="bg-card text-foreground">All Accounts</option>
                {banks.map((b) => (
                  <option key={b._id} value={b._id} className="bg-card text-foreground">
                    {b.bankName}
                  </option>
                ))}
              </select>

              {/* Date Presets */}
              <DateFilter
                onApply={handleDateApply}
                onReset={handleResetFilters}
                initialYear={filters.year}
                initialMonth={filters.month}
                initialStartDate={filters.startDate}
                initialEndDate={filters.endDate}
              />
            </div>
          </div>
        )}

        {/* 4. ACTIVE FILTER CHIPS */}
        {activeFilterList.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Filters:</span>
            {activeFilterList.map((f) => (
              <ActiveFilterChip
                key={f.key}
                label={f.label}
                onRemove={() => {
                  if (f.key === 'dateRange') {
                    setFilters((prev) => ({ ...prev, startDate: '', endDate: '' }));
                  } else {
                    setFilters((prev) => ({ ...prev, [f.key]: '' }));
                  }
                }}
              />
            ))}
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-500 font-bold hover:underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </motion.div>

      {/* 5. TRANSACTION TABLE WORKSPACE */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden border border-border bg-card shadow-sm relative z-0">
        {filteredItems.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="px-4 py-3.5">Type & Source</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Account / Transfer</th>
                    <th className="px-4 py-3.5 text-right">Amount</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Note & Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((tx) => {
                    const isSelected = selectedIds.includes(tx._id);
                    return (
                      <tr
                        key={tx._id}
                        className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                          isSelected ? 'bg-blue-500/5 dark:bg-blue-500/10' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(tx._id)}
                            className="rounded border-border"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                tx.type === 'income'
                                  ? 'bg-emerald-500/10 border-emerald-500/20'
                                  : tx.type === 'expense'
                                  ? 'bg-rose-500/10 border-rose-500/20'
                                  : 'bg-blue-500/10 border-blue-500/20'
                              }`}
                            >
                              {typeIcon(tx.type)}
                            </div>
                            <div>
                              <span
                                className={`capitalize text-xs font-bold block ${
                                  tx.type === 'income'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : tx.type === 'expense'
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}
                              >
                                {tx.type}
                              </span>
                              {tx.type === 'transfer' && tx.transferType && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  {tx.transferType === 'bank_to_cash'
                                    ? 'Bank → Cash'
                                    : tx.transferType === 'cash_to_bank'
                                    ? 'Cash → Bank'
                                    : 'Bank → Bank'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-900 dark:text-white">
                          {tx.categoryId?.name || (tx.type === 'transfer' ? 'Transfer' : '-')}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-700 dark:text-slate-300">
                          {tx.type === 'transfer' ? (
                            <div className="text-[11px] font-medium">
                              {tx.transferType === 'bank_to_cash' && (
                                <span>
                                  <strong className="text-rose-600 dark:text-rose-400">{tx.fromBankId?.bankName || 'Bank'}</strong> →{' '}
                                  <span className="text-emerald-600 dark:text-emerald-400">Cash</span>
                                </span>
                              )}
                              {tx.transferType === 'cash_to_bank' && (
                                <span>
                                  <span className="text-rose-600 dark:text-rose-400">Cash</span> →{' '}
                                  <strong className="text-emerald-600 dark:text-emerald-400">{tx.toBankId?.bankName || 'Bank'}</strong>
                                </span>
                              )}
                              {tx.transferType === 'bank_to_bank' && (
                                <span>
                                  <strong className="text-rose-600 dark:text-rose-400">{tx.fromBankId?.bankName || 'Bank'}</strong> →{' '}
                                  <strong className="text-emerald-600 dark:text-emerald-400">{tx.toBankId?.bankName || 'Bank'}</strong>
                                </span>
                              )}
                            </div>
                          ) : (
                            tx.bankId?.bankName || (tx.paymentMethod === 'cash' ? 'Cash Wallet' : '-')
                          )}
                        </td>
                        <td
                          className={`px-4 py-4 text-right font-extrabold text-xs ${
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : tx.type === 'expense'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄ '}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-4 text-xs max-w-[240px]">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{tx.note || '-'}</p>
                          {tx.friendDetails?.name && (
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                                Friend: {tx.friendDetails.name}
                              </span>
                              {tx.friendDetails.status === 'settled' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                                  Settled
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSettleFriend(tx._id)}
                                  className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold transition"
                                  title="Mark debt as paid"
                                >
                                  Pending (Settle)
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === tx._id ? null : tx._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Row Overflow Menu */}
                          {openMenuId === tx._id && (
                            <div className="absolute right-4 top-12 z-30 w-36 rounded-xl bg-card border border-border shadow-xl py-1 text-left text-xs font-semibold">
                              <button
                                onClick={() => {
                                  handleDelete(tx._id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 7. PAGINATION FOOTER */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-slate-50/50 dark:bg-slate-900/30">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <strong className="text-slate-900 dark:text-white">{filteredItems.length}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{total}</strong> transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => dispatch(setPage(page - 1))}
                  className="p-1.5 rounded-xl border border-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => dispatch(setPage(page + 1))}
                  className="p-1.5 rounded-xl border border-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No transactions found"
              description="No matching financial transactions found for your current search or filter parameters."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          </div>
        )}
      </motion.div>

      {/* 6. BULK ACTIONS TOOLBAR */}
      <BulkActionToolbar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onExport={() => toast.success(`Exporting ${selectedIds.length} transactions`)}
      />
    </motion.div>
  );
}
