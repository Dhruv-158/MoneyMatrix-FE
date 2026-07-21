import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchBanks, createBank, updateBank, deleteBank } from '@/redux/slices/bankSlice';
import BankCard from '@/components/cards/BankCard';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Building2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/helpers';

export default function Banks() {
  const dispatch = useDispatch();
  const { list: banks, loading } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });

  useEffect(() => { if (isInitialized) dispatch(fetchBanks()); }, [dispatch, isInitialized]);

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Bank Balance</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalBalance)}</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Bank
        </button>
      </div>

      {/* Bank cards grid */}
      {loading ? (
        <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : banks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {banks.map((bank, i) => (
            <BankCard key={bank._id} bank={bank} index={i} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
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
