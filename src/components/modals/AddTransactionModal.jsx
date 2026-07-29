import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, CreditCard, ArrowRightLeft, FileText, UserCheck, ShieldCheck } from 'lucide-react';
import { createTransaction } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { fetchCategories } from '@/redux/slices/categorySlice';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import toastService from '@/services/toastService';

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
      toastService.error('Amount must be greater than 0');
      return;
    }

    if (isFriendCategory && !form.friendName.trim()) {
      toastService.error("Please enter friend's name");
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
      toastService.success('Transaction created successfully!');
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Enterprise Size: max-w-5xl (1024px wide) */}
            <div className="w-full max-w-5xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* 1. MODAL HEADER */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 shrink-0 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Add New Transaction</h2>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-wider border ${typeColor[form.type]}`}>
                      {form.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Record a new financial transaction by completing the required information below.
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Type Selector Pills */}
                  <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-border">
                    {['income', 'expense', 'transfer'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          form.type === t
                            ? t === 'income' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                              : t === 'expense' ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                              : 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Close Dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 2. MODAL BODY (FORM SECTIONS IN TWO-COLUMN GRID) */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 overflow-y-auto space-y-8 flex-1 scrollbar-thin">
                  
                  {/* SECTION A: TRANSACTION DETAILS */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Transaction Financial Details
                    </h3>

                    {form.type === 'transfer' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                          <Select
                            label="Transfer Route *"
                            name="transferType"
                            value={form.transferType}
                            onChange={handleChange}
                          >
                            <option value="bank_to_cash" className="bg-card text-foreground">Bank Account → Cash Wallet</option>
                            <option value="cash_to_bank" className="bg-card text-foreground">Cash Wallet → Bank Account</option>
                            <option value="bank_to_bank" className="bg-card text-foreground">Bank Account → Bank Account</option>
                          </Select>
                        </div>

                        {(form.transferType === 'bank_to_cash' || form.transferType === 'bank_to_bank') && (
                          <Select
                            label="Source Bank Account *"
                            name="fromBankId"
                            value={form.fromBankId}
                            onChange={handleChange}
                            required
                          >
                            <option value="" className="bg-card text-foreground">Select source bank account</option>
                            {banks.map((b) => <option key={b._id} value={b._id} className="bg-card text-foreground">{b.bankName}</option>)}
                          </Select>
                        )}

                        {(form.transferType === 'cash_to_bank' || form.transferType === 'bank_to_bank') && (
                          <Select
                            label="Destination Bank Account *"
                            name="toBankId"
                            value={form.toBankId}
                            onChange={handleChange}
                            required
                          >
                            <option value="" className="bg-card text-foreground">Select destination bank account</option>
                            {banks.map((b) => <option key={b._id} value={b._id} className="bg-card text-foreground">{b.bankName}</option>)}
                          </Select>
                        )}

                        <Input
                          label="Transfer Amount (₹) *"
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
                          label="Transaction Date *"
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          icon={Calendar}
                          required
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                          label="Amount (₹) *"
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
                          label="Transaction Date *"
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          icon={Calendar}
                          required
                        />

                        <Select
                          label="Payment Source *"
                          name="paymentMethod"
                          value={form.paymentMethod}
                          onChange={handleChange}
                        >
                          <option value="bank" className="bg-card text-foreground">Bank Account</option>
                          <option value="cash" className="bg-card text-foreground">Cash Wallet</option>
                        </Select>

                        {form.paymentMethod === 'bank' && (
                          <Select
                            label="Select Bank Account *"
                            name="bankId"
                            value={form.bankId}
                            onChange={handleChange}
                            required
                          >
                            <option value="" className="bg-card text-foreground">Select bank account</option>
                            {banks.map((b) => <option key={b._id} value={b._id} className="bg-card text-foreground">{b.bankName}</option>)}
                          </Select>
                        )}

                        <Select
                          label="Category Classification"
                          name="categoryId"
                          value={form.categoryId}
                          onChange={handleChange}
                        >
                          <option value="" className="bg-card text-foreground">Select category (optional)</option>
                          {categories.map((c) => <option key={c._id} value={c._id} className="bg-card text-foreground">{c.name}</option>)}
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* SECTION B: FRIEND INFORMATION CARD */}
                  <AnimatePresence>
                    {isFriendCategory && form.type !== 'transfer' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" /> Friend Information
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                This transaction is associated with another person. Provide the friend's details to keep your financial records organized.
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
                              Step 2: Contact Info
                            </span>
                          </div>

                          {/* 2-Column Responsive Input Grid with Custom Styled Inputs & Icons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Friend Name <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 flex items-center justify-center font-bold">
                                  👤
                                </div>
                                <input
                                  type="text"
                                  name="friendName"
                                  value={form.friendName}
                                  onChange={handleChange}
                                  placeholder="e.g. Rahul Sharma"
                                  required={isFriendCategory}
                                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-blue-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                WhatsApp / Mobile Number
                              </label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 flex items-center justify-center font-bold">
                                  📱
                                </div>
                                <input
                                  type="text"
                                  name="friendPhone"
                                  value={form.friendPhone}
                                  onChange={handleChange}
                                  placeholder="+91 9999999999"
                                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-blue-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Email Address
                              </label>
                              <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 flex items-center justify-center font-bold">
                                  ✉️
                                </div>
                                <input
                                  type="email"
                                  name="friendEmail"
                                  value={form.friendEmail}
                                  onChange={handleChange}
                                  placeholder="rahul@example.com"
                                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-blue-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Automated Reminders & Notifications - Card Badges */}
                          <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-border cursor-pointer hover:border-blue-500/40 transition">
                              <input
                                type="checkbox"
                                name="sendNotification"
                                checked={form.sendNotification}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500/50"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Email Notification</p>
                                <p className="text-[10px] text-slate-500">Send immediate debt confirmation email</p>
                              </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-border cursor-pointer hover:border-blue-500/40 transition">
                              <input
                                type="checkbox"
                                name="autoReminder"
                                checked={form.autoReminder}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500/50"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Automated Monthly Reminder</p>
                                <p className="text-[10px] text-slate-500">Auto-remind on the 1st of every month</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SECTION C: ADDITIONAL INFORMATION / NOTE */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Additional Information & Description
                    </h3>
                    <Textarea
                      label="Transaction Note / Description"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Add optional notes, invoice references, or merchant description..."
                      rows={3}
                    />
                  </div>

                </div>

                {/* 3. FIXED MODAL FOOTER */}
                <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Fields marked with <span className="text-rose-500">*</span> are required.
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl border border-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Processing...' : 'Save Transaction'}
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}