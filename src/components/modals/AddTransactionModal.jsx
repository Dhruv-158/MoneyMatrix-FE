import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createTransaction } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { fetchCategories } from '@/redux/slices/categorySlice';
import toast from 'react-hot-toast';

export default function AddTransactionModal({ open, onClose }) {
  const dispatch = useDispatch();
  const { list: banks } = useSelector((s) => s.banks);
  const { list: categories } = useSelector((s) => s.categories);

  const [form, setForm] = useState({
    type: 'expense',
    paymentMethod: 'bank',
    bankId: '',
    categoryId: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    transferType: 'bank_to_cash',
    fromBankId: '',
    toBankId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchBanks());
      dispatch(fetchCategories());
    }
  }, [open, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        note: form.note,
        date: form.date,
      };

      if (form.type === 'transfer') {
        payload.transferType = form.transferType;
        if (form.transferType === 'bank_to_cash') payload.fromBankId = form.fromBankId;
        if (form.transferType === 'cash_to_bank') payload.toBankId = form.toBankId;
        if (form.transferType === 'bank_to_bank') {
          payload.fromBankId = form.fromBankId;
          payload.toBankId = form.toBankId;
        }
      } else {
        payload.paymentMethod = form.paymentMethod;
        if (form.paymentMethod === 'bank') payload.bankId = form.bankId;
        if (form.categoryId) payload.categoryId = form.categoryId;
      }

      await dispatch(createTransaction(payload)).unwrap();
      toast.success('Transaction created!');
      onClose();
      setForm({
        type: 'expense', paymentMethod: 'bank', bankId: '', categoryId: '',
        amount: '', note: '', date: new Date().toISOString().split('T')[0],
        transferType: 'bank_to_cash', fromBankId: '', toBankId: '',
      });
    } catch (err) {
      toast.error(err || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition';
  const labelClass = 'text-xs font-medium text-slate-400 mb-1.5 block';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-card border border-white/10 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-thin">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">Add Transaction</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Type selector */}
                <div className="flex gap-2">
                  {['expense', 'income', 'transfer'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
                        form.type === t
                          ? t === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t === 'expense' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-background text-slate-400 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Amount */}
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={inputClass}
                    required
                    min="1"
                  />
                </div>

                {/* Transfer fields */}
                {form.type === 'transfer' && (
                  <>
                    <div>
                      <label className={labelClass}>Transfer Type</label>
                      <select name="transferType" value={form.transferType} onChange={handleChange} className={inputClass}>
                        <option value="bank_to_cash">Bank → Cash</option>
                        <option value="cash_to_bank">Cash → Bank</option>
                        <option value="bank_to_bank">Bank → Bank</option>
                      </select>
                    </div>
                    {(form.transferType === 'bank_to_cash' || form.transferType === 'bank_to_bank') && (
                      <div>
                        <label className={labelClass}>From Bank</label>
                        <select name="fromBankId" value={form.fromBankId} onChange={handleChange} className={inputClass} required>
                          <option value="">Select bank</option>
                          {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                        </select>
                      </div>
                    )}
                    {(form.transferType === 'cash_to_bank' || form.transferType === 'bank_to_bank') && (
                      <div>
                        <label className={labelClass}>To Bank</label>
                        <select name="toBankId" value={form.toBankId} onChange={handleChange} className={inputClass} required>
                          <option value="">Select bank</option>
                          {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Income/Expense fields */}
                {form.type !== 'transfer' && (
                  <>
                    <div>
                      <label className={labelClass}>Payment Method</label>
                      <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputClass}>
                        <option value="bank">Bank</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                    {form.paymentMethod === 'bank' && (
                      <div>
                        <label className={labelClass}>Bank</label>
                        <select name="bankId" value={form.bankId} onChange={handleChange} className={inputClass} required>
                          <option value="">Select bank</option>
                          {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={labelClass}>Category</label>
                      <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
                        <option value="">Select category</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* Date */}
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} required />
                </div>

                {/* Note */}
                <div>
                  <label className={labelClass}>Note</label>
                  <input type="text" name="note" value={form.note} onChange={handleChange} placeholder="Optional note" className={inputClass} />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Transaction'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
