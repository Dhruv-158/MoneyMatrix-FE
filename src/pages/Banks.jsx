import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchBanks, createBank, updateBank, deleteBank } from '@/redux/slices/bankSlice';
import BankCard from '@/components/cards/BankCard';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Building2, X, LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/helpers';

export default function Banks() {
  const dispatch = useDispatch();
  const { list: banks, loading } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [form, setForm] = useState({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });

  useEffect(() => { if (isInitialized) dispatch(fetchBanks()); }, [dispatch, isInitialized, lastUpdated]);

  const totalBalance = banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0);

  const openEdit = (bank) => {
    setEditing(bank);
    setForm({ bankName: bank.bankName, accountType: bank.accountType, currentBalance: bank.currentBalance, accountNumberLast4: bank.accountNumberLast4, color: bank.color || '#3b82f6' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await dispatch(updateBank({ id: editing._id, ...form, currentBalance: Number(form.currentBalance) })).unwrap();
        toast.success('Bank updated!');
      } else {
        await dispatch(createBank({ ...form, currentBalance: Number(form.currentBalance) })).unwrap();
        toast.success('Bank added!');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bank?')) return;
    try {
      await dispatch(deleteBank(id)).unwrap();
      toast.success('Bank deleted');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Bank Balance</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button onClick={() => { setEditing(null); setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus className="w-4 h-4" /> Add Bank
          </button>
        </div>
      </div>

      {/* Bank Cards or Table */}
      {loading ? (
        <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : banks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {banks.map((bank, i) => (
              <BankCard key={bank._id} bank={bank} index={i} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3">Bank Name</th>
                    <th className="px-5 py-3">Account Type</th>
                    <th className="px-5 py-3">Last 4 Digits</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {banks.map((bank) => (
                    <tr key={bank._id} className="hover:bg-white/[0.02] transition">
                      <td className="px-5 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm"
                            style={{ backgroundColor: bank.color || '#3b82f6' }}
                          >
                            {bank.bankName?.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{bank.bankName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 capitalize">{bank.accountType}</td>
                      <td className="px-5 py-4 text-slate-400 font-mono">•••• {bank.accountNumberLast4 || '----'}</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-400">{formatCurrency(bank.currentBalance)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(bank)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                            title="Edit Bank"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bank._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete Bank"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <EmptyState icon={Building2} title="No banks added" description="Add your bank accounts to start tracking." action={
          <button onClick={() => setModalOpen(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">Add Bank</button>
        } />
      )}

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md bg-card border border-white/10 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Bank' : 'Add Bank'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white" title="Close"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Bank Name</label>
                  <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className={inputClass} required placeholder="e.g. HDFC Bank" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Account Type</label>
                  <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} className={inputClass}>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Current Balance</label>
                  <input type="number" value={form.currentBalance} onChange={(e) => setForm({ ...form, currentBalance: e.target.value })} className={inputClass} required placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Last 4 Digits</label>
                  <input type="text" value={form.accountNumberLast4} onChange={(e) => setForm({ ...form, accountNumberLast4: e.target.value })} className={inputClass} required maxLength={4} minLength={4} placeholder="1234" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition">{editing ? 'Update' : 'Add'} Bank</button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
