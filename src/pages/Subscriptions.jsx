import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription, toggleSubscriptionStatus } from '@/redux/slices/subscriptionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { formatCurrency, formatDate } from '@/utils/helpers';
import EmptyState from '@/components/ui/EmptyState';
import { RefreshCw, Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const dispatch = useDispatch();
  const { list: subs, loading } = useSelector((s) => s.subscriptions);
  const { list: banks } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', frequency: 'monthly', startDate: '', nextDueDate: '', paymentMethod: 'bank', bankId: '', note: '' });

  useEffect(() => { if (isInitialized) { dispatch(fetchSubscriptions()); dispatch(fetchBanks()); } }, [dispatch, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) { await dispatch(updateSubscription({ id: editing._id, ...payload })).unwrap(); toast.success('Updated'); }
      else { await dispatch(createSubscription(payload)).unwrap(); toast.success('Created'); }
      setModalOpen(false); setEditing(null);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await dispatch(deleteSubscription(id)).unwrap(); toast.success('Deleted'); } catch (err) { toast.error(err); } };
  const handleToggle = async (sub) => { try { await dispatch(toggleSubscriptionStatus({ id: sub._id, isActive: !sub.isActive })).unwrap(); toast.success('Toggled'); } catch (err) { toast.error(err); } };

  const ic = 'w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', amount: '', frequency: 'monthly', startDate: '', nextDueDate: '', paymentMethod: 'bank', bankId: '', note: '' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {loading ? <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      : subs.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.map(sub => (
            <motion.div key={sub._id} whileHover={{ y: -2 }} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub.isActive ? 'bg-purple-500/10' : 'bg-slate-500/10'}`}><RefreshCw className={`w-5 h-5 ${sub.isActive ? 'text-purple-400' : 'text-slate-500'}`} /></div>
                  <div><p className="text-sm font-semibold text-white">{sub.title}</p><p className="text-xs text-slate-500 capitalize">{sub.frequency}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(sub); setForm({ title: sub.title, amount: sub.amount, frequency: sub.frequency, startDate: sub.startDate?.split('T')[0], nextDueDate: sub.nextDueDate?.split('T')[0], paymentMethod: sub.paymentMethod, bankId: sub.bankId || '', note: sub.note || '' }); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(sub._id)} className="p-1.5 rounded-lg hover:bg-red-500/5 text-slate-400 hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between"><span className="text-xs text-slate-500">Amount</span><span className="text-sm font-semibold text-white">{formatCurrency(sub.amount)}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500">Next Billing</span><span className="text-xs text-slate-300">{formatDate(sub.nextDueDate)}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Status</span>
                  <button onClick={() => handleToggle(sub)} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${sub.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{sub.isActive ? 'Active' : 'Inactive'}</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : <EmptyState icon={RefreshCw} title="No subscriptions" description="Add your subscriptions." />}

      {modalOpen && (<><div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} /><div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md bg-card border border-white/10 rounded-2xl max-h-[85vh] overflow-y-auto"><div className="flex items-center justify-between p-5 border-b border-white/5"><h2 className="text-lg font-semibold text-white">{editing ? 'Edit' : 'Add'} Subscription</h2><button onClick={() => setModalOpen(false)} title="Close" className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Amount</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Frequency</label><select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className={ic}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option></select></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Next Due</label><input type="date" value={form.nextDueDate} onChange={e => setForm({...form, nextDueDate: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Payment</label><select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className={ic}><option value="bank">Bank</option><option value="cash">Cash</option></select></div>
          {form.paymentMethod === 'bank' && <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Bank</label><select value={form.bankId} onChange={e => setForm({...form, bankId: e.target.value})} className={ic} required>{banks.map(b => <option key={b._id} value={b._id}>{b.bankName}</option>)}</select></div>}
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Note</label><input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className={ic} /></div>
          <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm">{editing ? 'Update' : 'Create'}</button>
        </form></motion.div></div></>)}
    </motion.div>
  );
}
