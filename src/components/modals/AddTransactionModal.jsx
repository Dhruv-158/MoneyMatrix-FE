import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, CreditCard, ArrowRightLeft } from 'lucide-react';
import { createTransaction } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { fetchCategories } from '@/redux/slices/categorySlice';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

export default function AddTransactionModal({ open, onClose }) {
  const dispatch = useDispatch();
  const bankSlice = useSelector((s) => s.banks);
  const categorySlice = useSelector((s) => s.categories);

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
      toast.success('Transaction created successfully!');
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

  const typeColor = {
    income: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    expense: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    transfer: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          >
            <div className="w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Add New Transaction</h2>
                  <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase border ${typeColor[form.type]}`}>
                    {form.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Type Selector Pills */}
                  <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                    {['income', 'expense', 'transfer'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                          form.type === t
                            ? t === 'income' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                              : t === 'expense' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                              : 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition" title="Close">
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
                          <Select
                            label="Transfer Type"
                            name="transferType"
                            value={form.transferType}
                            onChange={handleChange}
                          >
                            <option value="bank_to_cash">Bank Account → Cash Wallet</option>
                            <option value="cash_to_bank">Cash Wallet → Bank Account</option>
                            <option value="bank_to_bank">Bank Account → Bank Account</option>
                          </Select>
                        </div>

                        {(form.transferType === 'bank_to_cash' || form.transferType === 'bank_to_bank') && (
                          <Select
                            label="From Bank Account"
                            name="fromBankId"
                            value={form.fromBankId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select source bank</option>
                            {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                          </Select>
                        )}

                        {(form.transferType === 'cash_to_bank' || form.transferType === 'bank_to_bank') && (
                          <Select
                            label="To Bank Account"
                            name="toBankId"
                            value={form.toBankId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select destination bank</option>
                            {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                          </Select>
                        )}

                        <Input
                          label="Amount"
                          type="number"
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          icon={DollarSign}
                          required
                          min="1"
                        />

                        <Input
                          label="Date"
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          icon={Calendar}
                          required
                        />

                        <div className="sm:col-span-2">
                          <Textarea
                            label="Description / Note"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Add optional note or description..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}

                    {/* Income/Expense fields */}
                    {form.type !== 'transfer' && (
                      <>
                        <Select
                          label="Payment Method"
                          name="paymentMethod"
                          value={form.paymentMethod}
                          onChange={handleChange}
                        >
                          <option value="bank">Bank Account</option>
                          <option value="cash">Cash Wallet</option>
                        </Select>

                        {form.paymentMethod === 'bank' && (
                          <Select
                            label="Bank Account"
                            name="bankId"
                            value={form.bankId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select bank account</option>
                            {banks.map((b) => <option key={b._id} value={b._id}>{b.bankName}</option>)}
                          </Select>
                        )}

                        <Input
                          label="Amount"
                          type="number"
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          icon={DollarSign}
                          required
                          min="1"
                        />

                        <Select
                          label="Category"
                          name="categoryId"
                          value={form.categoryId}
                          onChange={handleChange}
                        >
                          <option value="">Select category (optional)</option>
                          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </Select>

                        <Input
                          label="Date"
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          icon={Calendar}
                          required
                        />
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
                          <Textarea
                            label="Description / Note"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            placeholder="Add optional note or description..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50"
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