import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchTransactions, setPage } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { formatCurrency, formatDate } from '@/utils/helpers';
import EmptyState from '@/components/ui/EmptyState';
import { Search, Filter, ArrowUpRight, ArrowDownRight, ArrowLeftRight, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';

export default function Transactions() {
  const dispatch = useDispatch();
  const { items, total, page, limit, loading } = useSelector((s) => s.transactions);
  const { list: banks } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);

  const todayDate = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ type: '', bankId: '', startDate: todayDate, endDate: todayDate, monthYear: '' });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayDate);

  useEffect(() => {
    // Only fetch data after auth is initialized
    if (isInitialized) {
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (filters.type) params.type = filters.type;
    if (filters.bankId) params.bankId = filters.bankId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.monthYear) {
      const [year, month] = filters.monthYear.split('-');
      params.month = month;
      params.year = year;
    }
    dispatch(fetchTransactions(params));
  }, [dispatch, page, filters]);

  const totalPages = Math.ceil(total / limit) || 1;

  const typeIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (type === 'expense') return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <ArrowLeftRight className="w-4 h-4 text-blue-400" />;
  };

  const filteredItems = search
    ? items.filter(t => t.note?.toLowerCase().includes(search.toLowerCase()))
    : items;

  const inputClass = 'px-3 py-2 rounded-lg bg-card border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border border-white/5 flex-1 sm:flex-initial sm:w-64">
            <Search className="w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border transition ${showFilters ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'border-white/10 text-slate-400 hover:text-white'}`} title="Filters">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition" title="Export">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); dispatch(setPage(1)); }} className={inputClass}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
            <select value={filters.bankId} onChange={(e) => { setFilters({ ...filters, bankId: e.target.value }); dispatch(setPage(1)); }} className={inputClass}>
              <option value="">All Banks</option>
              {banks.map(b => <option key={b._id} value={b._id}>{b.bankName}</option>)}
            </select>
            <input type="month" value={filters.monthYear} onChange={(e) => { setFilters({ ...filters, monthYear: e.target.value }); dispatch(setPage(1)); }} className={inputClass} placeholder="Select Month" />
            <button 
              onClick={() => setShowDateRange(!showDateRange)} 
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${showDateRange ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'border-white/10 text-slate-400 hover:text-white'}`}
            >
              {filters.startDate || filters.endDate ? 'Range ✓' : 'Range'}
            </button>
          </div>

          {/* Date Range Picker */}
          {showDateRange && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Start Date</label>
                <input type="date" value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); dispatch(setPage(1)); }} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">End Date</label>
                <input type="date" value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); dispatch(setPage(1)); }} className={inputClass} />
              </div>
            </motion.div>
          )}

          {/* Calendar View - Specific Date Selector */}
          <div className="pt-2 border-t border-white/10">
            <label className="text-xs text-slate-400 mb-2 block">📆 View Specific Date</label>
            <div className="flex gap-2">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`flex-1 ${inputClass}`} />
              <button 
                onClick={() => { setFilters({ ...filters, startDate: selectedDate, endDate: selectedDate, monthYear: '' }); dispatch(setPage(1)); }} 
                className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm transition font-medium"
              >
                View
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Bank</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((tx) => (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {typeIcon(tx.type)}
                          <span className={`capitalize text-xs font-medium ${tx.type === 'income' ? 'text-emerald-400' : tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{tx.categoryId?.name || '-'}</td>
                      <td className="px-4 py-3 text-slate-400">{tx.bankId?.bankName || (tx.paymentMethod === 'cash' ? 'Cash' : '-')}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-400' : tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(tx.date)}</td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{tx.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-xs text-slate-500">Showing {items.length} of {total} transactions</p>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))} className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition" title="Previous">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 px-2">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => dispatch(setPage(page + 1))} className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition" title="Next">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon={FileText} title="No transactions" description="Start adding transactions to see them here." />
        )}
      </div>
    </motion.div>
  );
}
