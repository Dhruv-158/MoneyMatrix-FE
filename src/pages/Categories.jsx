import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/redux/slices/categorySlice';
import EmptyState from '@/components/ui/EmptyState';
import { Tags, Plus, Pencil, Trash2, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Categories() {
  const dispatch = useDispatch();
  const { list: cats, loading } = useSelector((s) => s.categories);
  const { isInitialized } = useSelector((s) => s.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => { if (isInitialized) dispatch(fetchCategories()); }, [dispatch, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await dispatch(updateCategory({ id: editing._id, name })).unwrap(); toast.success('Updated'); }
      else { await dispatch(createCategory({ name })).unwrap(); toast.success('Created'); }
      setModalOpen(false); setEditing(null); setName('');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async (cat) => {
    if (cat.isBuiltin) { toast.error('Built-in categories cannot be deleted'); return; }
    if (!confirm('Delete?')) return;
    try { await dispatch(deleteCategory(cat._id)).unwrap(); toast.success('Deleted'); } catch (err) { toast.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Categories</h2>
        <button onClick={() => { setEditing(null); setName(''); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {loading ? <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      : cats.length ? (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5"><th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th><th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {cats.map(cat => (
                <tr key={cat._id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 text-white font-medium">{cat.name}</td>
                  <td className="px-4 py-3">{cat.isBuiltin ? <span className="flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3 h-3" /> Built-in</span> : <span className="text-xs text-blue-400">Custom</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(cat); setName(cat.name); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      {!cat.isBuiltin && <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-500/5 text-slate-400 hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon={Tags} title="No categories" description="Add categories to organize transactions." />}

      {modalOpen && (<><div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} /><div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-card border border-white/10 rounded-2xl"><div className="flex items-center justify-between p-5 border-b border-white/5"><h2 className="text-lg font-semibold text-white">{editing ? 'Edit' : 'Add'} Category</h2><button onClick={() => setModalOpen(false)} title="Close" className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" required />
          <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm">{editing ? 'Update' : 'Create'}</button>
        </form></motion.div></div></>)}
    </motion.div>
  );
}
