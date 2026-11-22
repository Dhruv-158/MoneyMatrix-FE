import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, CreditCard, FileText, UserCheck } from 'lucide-react';
import { createTransaction } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { fetchCategories } from '@/redux/slices/categorySlice';
import { transactionSchema, transactionDefaults } from '@/schemas/transaction';
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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: transactionDefaults,
  });

  const formType = watch('type');
  const paymentMethod = watch('paymentMethod');
  const transferType = watch('transferType');
  const categoryId = watch('categoryId');

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const isFriendCategory = selectedCategory?.name
    ? selectedCategory.name.toLowerCase().includes('friend') ||
      selectedCategory.name.toLowerCase().includes('lend') ||
      selectedCategory.name.toLowerCase().includes('borrow')
    : false;

  useEffect(() => {
    if (open) {
      dispatch(fetchBanks());
      dispatch(fetchCategories());
      reset({ ...transactionDefaults, date: new Date().toISOString().split('T')[0] });
    }
  }, [open, dispatch, reset]);

  useEffect(() => {
    setValue('requireFriendName', Boolean(isFriendCategory && formType !== 'transfer'));
  }, [isFriendCategory, formType, setValue]);

  const onSubmit = async (form) => {
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
      reset({ ...transactionDefaults, date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      toastService.error(err?.errorMessage || err || 'Failed to create transaction');
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
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="w-full max-w-5xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 shrink-0 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Add New Transaction</h2>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-wider border ${typeColor[formType]}`}>
                      {formType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Record a new financial transaction by completing the required information below.
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-border">
                    {['income', 'expense', 'transfer'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setValue('type', t, { shouldValidate: true })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          formType === t
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

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden" noValidate>
                <div className="p-8 overflow-y-auto space-y-8 flex-1 scrollbar-thin">
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Transaction Financial Details
                    </h3>

                    {formType === 'transfer' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                          <Controller
                            name="transferType"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Transfer Route *"
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                error={errors.transferType?.message}
                              >
                                <option value="bank_to_cash" className="bg-card text-foreground">Bank Account → Cash Wallet</option>
                                <option value="cash_to_bank" className="bg-card text-foreground">Cash Wallet → Bank Account</option>
                                <option value="bank_to_bank" className="bg-card text-foreground">Bank Account → Bank Account</option>
                              </Select>
                            )}
                          />
                        </div>

                        {(transferType === 'bank_to_cash' || transferType === 'bank_to_bank') && (
                          <Controller
                            name="fromBankId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Source Bank Account *"
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                error={errors.fromBankId?.message}
                              >
                                <option value="" className="bg-card text-foreground">Select source bank account</option>
                                {banks.map((b) => <option key={b._id} value={b._id} className="bg-card text-foreground">{b.bankName}</option>)}
                              </Select>
                            )}
                          />
                        )}

                        {(transferType === 'cash_to_bank' || transferType === 'bank_to_bank') && (
                          <Controller
                            name="toBankId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Destination Bank Account *"
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                error={errors.toBankId?.message}
                              >
                                <option value="" className="bg-card text-foreground">Select destination bank account</option>
                                {banks.map((b) => <option key={b._id} value={b._id} className="bg-card text-foreground">{b.bankName}</option>)}
                              </Select>
                            )}
                          />
                        )}

                        <Input
                          label="Transfer Amount (₹) *"
                          type="number"
                          placeholder="0.00"
                          icon={DollarSign}
                          min="1"
                          error={errors.amount?.message}
                          {...register('amount')}
                        />

                        <Input
                          label="Transaction Date *"
                          type="date"
                          icon={Calendar}
                          error={errors.date?.message}
                          {...register('date')}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                          label="Amount (₹) *"
                          type="number"
                          placeholder="0.00"
                          icon={DollarSign}
                          min="1"
                          error={errors.amount?.message}
                          {...register('amount')}
                        />

                        <Input
                          label="Transaction Date *"
                          type="date"
                          icon={Calendar}
                          error={errors.date?.message}
                          {...register('date')}
                        />

                        <Controller
                          name="paymentMethod"
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Payment Source *"
                              name={field.name}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              error={errors.paymentMethod?.message}
                            >
                              <option value="bank" className="bg-card text-foreground">Bank Account</option>
                              <option value="cash" className="bg-card text-foreground">Cash Wallet</option>
                            </Select>
                          )}
                        />

                        {paymentMethod === 'bank' && (
                          <Controller
                            name="bankId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Select Bank Account *"
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                error={errors.bankId?.message}
                              >
                                <option value="" className="bg-card text-foreground">Select bank account</option>
                                {banks.map((b) => <option key={b._id} value={b._id} className="bg-card text-foreground">{b.bankName}</option>)}
                              </Select>
                            )}
                          />
                        )}

                        <Controller
                          name="categoryId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Category Classification"
                              name={field.name}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            >
                              <option value="" className="bg-card text-foreground">Select category (optional)</option>
                              {categories.map((c) => <option key={c._id} value={c._id} className="bg-card text-foreground">{c.name}</option>)}
                            </Select>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isFriendCategory && formType !== 'transfer' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" /> Friend Information
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                This transaction is associated with another person. Provide the friend's details to keep your financial records organized.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Friend Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                {...register('friendName')}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full pl-4 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-blue-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition"
                              />
                              {errors.friendName && (
                                <p className="text-xs text-red-500 font-medium">{errors.friendName.message}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                WhatsApp / Mobile Number
                              </label>
                              <input
                                type="text"
                                {...register('friendPhone')}
                                placeholder="+91 9999999999"
                                className="w-full pl-4 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-blue-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition"
                              />
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                Email Address
                              </label>
                              <input
                                type="email"
                                {...register('friendEmail')}
                                placeholder="rahul@example.com"
                                className="w-full pl-4 pr-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-blue-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition"
                              />
                              {errors.friendEmail && (
                                <p className="text-xs text-red-500 font-medium">{errors.friendEmail.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-border cursor-pointer hover:border-blue-500/40 transition">
                              <input type="checkbox" {...register('sendNotification')} className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500/50" />
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Email Notification</p>
                                <p className="text-[10px] text-slate-500">Send immediate debt confirmation email</p>
                              </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-border cursor-pointer hover:border-blue-500/40 transition">
                              <input type="checkbox" {...register('autoReminder')} className="w-4 h-4 rounded border-border bg-background text-blue-600 focus:ring-blue-500/50" />
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

                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Additional Information & Description
                    </h3>
                    <Textarea
                      label="Transaction Note / Description"
                      placeholder="Add optional notes, invoice references, or merchant description..."
                      rows={3}
                      {...register('note')}
                    />
                  </div>
                </div>

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
                      disabled={isSubmitting}
                      className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Processing...' : 'Save Transaction'}
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
