import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchEmis, createEmi, updateEmi, deleteEmi, toggleEmiStatus } from '@/redux/slices/emiSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { formatCurrency, formatDate } from '@/utils/helpers';
import EmptyState from '@/components/ui/EmptyState';
import { CalendarClock, Plus, Pencil, Trash2, X, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Emis() {
  const dispatch = useDispatch();
  const { list: emis, loading } = useSelector((s) => s.emis);
  const { list: banks } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [form, setForm] = useState({ title: '', amount: '', frequency: 'monthly', startDate: '', nextDueDate: '', paymentMethod: 'bank', bankId: '', note: '' });

  useEffect(() => { if (isInitialized) { dispatch(fetchEmis()); dispatch(fetchBanks()); } }, [dispatch, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) { await dispatch(updateEmi({ id: editing._id, ...payload })).unwrap(); toast.success('Updated'); }
      else { await dispatch(createEmi(payload)).unwrap(); toast.success('Created'); }
      setModalOpen(false); setEditing(null);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await dispatch(deleteEmi(id)).unwrap(); toast.success('Deleted'); } catch (err) { toast.error(err); } };
  const handleToggle = async (emi) => { try { await dispatch(toggleEmiStatus({ id: emi._id, isActive: !emi.isActive })).unwrap(); toast.success('Toggled'); } catch (err) { toast.error(err); } };

  const ic = 'w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white tracking-wide">EMI & Auto Payments</h2>
        
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

          <button onClick={() => { setEditing(null); setForm({ title: '', amount: '', frequency: 'monthly', startDate: '', nextDueDate: '', paymentMethod: 'bank', bankId: '', note: '' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20 active:scale-95">
            <Plus className="w-4 h-4" /> Add EMI
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : emis.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emis.map(emi => (
              <motion.div key={emi._id} whileHover={{ y: -2 }} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${emi.isActive ? 'bg-blue-500/10' : 'bg-slate-500/10'}`}><CalendarClock className={`w-5 h-5 ${emi.isActive ? 'text-blue-400' : 'text-slate-500'}`} /></div>
                    <div><p className="text-sm font-semibold text-white">{emi.title}</p><p className="text-xs text-slate-500 capitalize">{emi.frequency}</p></div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(emi); setForm({ title: emi.title, amount: emi.amount, frequency: emi.frequency, startDate: emi.startDate?.split('T')[0], nextDueDate: emi.nextDueDate?.split('T')[0], paymentMethod: emi.paymentMethod, bankId: emi.bankId || '', note: emi.note || '' }); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(emi._id)} className="p-1.5 rounded-lg hover:bg-red-500/5 text-slate-400 hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Amount</span><span className="text-sm font-semibold text-white">{formatCurrency(emi.amount)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Next Due</span><span className="text-xs text-slate-300">{formatDate(emi.nextDueDate)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Status</span>
                    <button onClick={() => handleToggle(emi)} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${emi.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{emi.isActive ? 'Active' : 'Inactive'}</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Frequency</th>
                    <th className="px-5 py-3">Next Due</th>
                    <th className="px-5 py-3">Payment Method</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emis.map((emi) => {
                    const linkedBank = banks.find((b) => b._id === emi.bankId);
                    return (
                      <tr key={emi._id} className="hover:bg-white/[0.02] transition">
                        <td className="px-5 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${emi.isActive ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-500'}`}>
                              <CalendarClock className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{emi.title}</p>
                              {emi.note && <p className="text-xs text-slate-500 truncate max-w-[160px]">{emi.note}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300 capitalize">{emi.frequency}</td>
                        <td className="px-5 py-4 text-slate-300">{formatDate(emi.nextDueDate)}</td>
                        <td className="px-5 py-4 text-slate-400 capitalize">
                          {emi.paymentMethod === 'bank' ? (linkedBank?.bankName || 'Bank') : 'Cash Wallet'}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-red-400">{formatCurrency(emi.amount)}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleToggle(emi)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                              emi.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                            }`}
                          >
                            {emi.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditing(emi);
                                setForm({
                                  title: emi.title,
                                  amount: emi.amount,
                                  frequency: emi.frequency,
                                  startDate: emi.startDate?.split('T')[0],
                                  nextDueDate: emi.nextDueDate?.split('T')[0],
                                  paymentMethod: emi.paymentMethod,
                                  bankId: emi.bankId || '',
                                  note: emi.note || '',
                                });
                                setModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                              title="Edit EMI"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emi._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete EMI"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : <EmptyState icon={CalendarClock} title="No EMIs" description="Add your EMI payments." />}

      {modalOpen && (<><div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} /><div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md bg-card border border-white/10 rounded-2xl max-h-[85vh] overflow-y-auto"><div className="flex items-center justify-between p-5 border-b border-white/5"><h2 className="text-lg font-semibold text-white">{editing ? 'Edit' : 'Add'} EMI</h2><button onClick={() => setModalOpen(false)} title="Close" className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Amount</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Frequency</label><select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className={ic}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option></select></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Next Due Date</label><input type="date" value={form.nextDueDate} onChange={e => setForm({...form, nextDueDate: e.target.value})} className={ic} required /></div>
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Payment Method</label><select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className={ic}><option value="bank">Bank</option><option value="cash">Cash</option></select></div>
          {form.paymentMethod === 'bank' && <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Bank</label><select value={form.bankId} onChange={e => setForm({...form, bankId: e.target.value})} className={ic} required>{banks.map(b => <option key={b._id} value={b._id}>{b.bankName}</option>)}</select></div>}
          <div><label className="text-xs font-medium text-slate-400 mb-1.5 block">Note</label><input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className={ic} /></div>
          <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm">{editing ? 'Update' : 'Create'}</button>
        </form></motion.div></div></>)}
    </motion.div>
  );
}
