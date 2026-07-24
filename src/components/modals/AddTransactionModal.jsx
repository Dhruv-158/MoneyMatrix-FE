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
  const bankSlice = useSelector((s) => s.banks);
  const categorySlice = useSelector((s) => s.categories);

  // Safely extract lists regardless of state wrapper shape
  const banks = Array.isArray(bankSlice?.list)
    ? bankSlice.list
    : Array.isArray(bankSlice)
    ? bankSlice
    : [];

  const categories = Array.isArray(categorySlice?.list)
    ? categorySlice.list
    : Array.isArray(categorySlice)
    ? categorySlice
    : [];

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
    friendName: '',
    friendEmail: '',
    friendPhone: '',
    sendNotification: true,
    autoReminder: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchBanks());
      dispatch(fetchCategories());
    }
  }, [open, dispatch]);

  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  const isFriendCategory = selectedCategory?.name
    ? selectedCategory.name.toLowerCase().includes('friend') ||
      selectedCategory.name.toLowerCase().includes('lend') ||
      selectedCategory.name.toLowerCase().includes('borrow')
    : false;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (isFriendCategory) {
      if (!form.friendName.trim()) {
        toast.error("Please enter friend's name");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        note: form.note,
        date: form.date,
      };

      if (isFriendCategory && form.friendName.trim()) {
        payload.friendDetails = {
          name: form.friendName.trim(),
          email: form.friendEmail.trim(),
          phone: form.friendPhone.trim(),
          sendNotification: form.sendNotification,
          autoReminder: form.autoReminder,
          status: 'pending',
        };
      }

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
        friendName: '', friendEmail: '', friendPhone: '', sendNotification: true, autoReminder: true,
      });
    } catch (err) {
      toast.error(err || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all';
  const labelClass = 'text-xs font-semibold text-slate-400 mb-1.5 block tracking-wide uppercase';

  const typeColor = {
    income: 'text-emerald-400',
    expense: 'text-red-400',
    transfer: 'text-blue-400',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          >
            <div className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white tracking-wide">Add Transaction</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-white/5 border border-white/10 ${typeColor[form.type]}`}>
                    {form.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Type Selector Pills */}
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
                    {['income', 'expense', 'transfer'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                          form.type === t
                            ? t === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                              : t === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition" title="Close">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Transfer fields */}
                    {form.type === 'transfer' && (
                      <>
                        <div className="sm:col-span-2">
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

                        <div>
                          <label className={labelClass}>Date</label>
                          <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} required />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>Note</label>
                          <textarea name="note" value={form.note} onChange={handleChange} placeholder="Add an optional description or note..." rows={2} className={inputClass} />
                        </div>
                      </>
                    )}

                    {/* Income/Expense fields */}
                    {form.type !== 'transfer' && (
                      <>
                        <div>
                          <label className={labelClass}>Payment Method</label>
                          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputClass}>
                            <option value="bank">Bank Account</option>
                            <option value="cash">Cash Wallet</option>
                          </select>
                        </div>

                        {form.paymentMethod === 'bank' && (
                          <div>
                            <label className={labelClass}>Bank Account</label>
                            <select name="bankId" value={form.bankId} onChange={handleChange} className={inputClass} required>
                              <option value="">Select bank</option>
                              {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                            </select>
                          </div>
                        )}

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

                        <div>
                          <label className={labelClass}>Category</label>
                          <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
                            <option value="">Select category</option>
                            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                          </select>
                        </div>

                        {/* Friend Information Subform Card */}
                        {isFriendCategory && (
                          <div className="sm:col-span-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                              🤝 Friend Details & Automation
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className={labelClass}>Friend Name *</label>
                                <input
                                  type="text"
                                  name="friendName"
                                  value={form.friendName}
                                  onChange={handleChange}
                                  placeholder="e.g. Rahul Sharma"
                                  className={inputClass}
                                  required={isFriendCategory}
                                />
                              </div>

                              <div>
                                <label className={labelClass}>Friend Email</label>
                                <input
                                  type="email"
                                  name="friendEmail"
                                  value={form.friendEmail}
                                  onChange={handleChange}
                                  placeholder="rahul@example.com"
                                  className={inputClass}
                                />
                              </div>

                              <div>
                                <label className={labelClass}>WhatsApp / Mobile</label>
                                <input
                                  type="text"
                                  name="friendPhone"
                                  value={form.friendPhone}
                                  onChange={handleChange}
                                  placeholder="+91 9999999999"
                                  className={inputClass}
                                />
                              </div>
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs text-slate-300">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="sendNotification"
                                  checked={form.sendNotification}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-white/10 bg-slate-900 text-blue-500 focus:ring-blue-500/50"
                                />
                                Send immediate email notification
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="autoReminder"
                                  checked={form.autoReminder}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-white/10 bg-slate-900 text-blue-500 focus:ring-blue-500/50"
                                />
                                Enable monthly automated reminder (1st of month)
                              </label>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className={labelClass}>Date</label>
                          <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} required />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>Note</label>
                          <textarea name="note" value={form.note} onChange={handleChange} placeholder="Add an optional description or note..." rows={2} className={inputClass} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons Bottom Floating */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-900/60 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}