import { z } from 'zod';

const todayIso = () => new Date().toISOString().split('T')[0];

export const transactionDefaults = {
  type: 'expense',
  paymentMethod: 'bank',
  bankId: '',
  categoryId: '',
  amount: '',
  note: '',
  date: todayIso(),
  transferType: 'bank_to_cash',
  fromBankId: '',
  toBankId: '',
  friendName: '',
  friendEmail: '',
  friendPhone: '',
  sendNotification: true,
  autoReminder: true,
  requireFriendName: false,
};

export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    paymentMethod: z.enum(['bank', 'cash']),
    bankId: z.string().optional().default(''),
    categoryId: z.string().optional().default(''),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    note: z.string().optional().default(''),
    date: z.string().min(1, 'Date is required'),
    transferType: z.enum(['bank_to_cash', 'cash_to_bank', 'bank_to_bank']),
    fromBankId: z.string().optional().default(''),
    toBankId: z.string().optional().default(''),
    friendName: z.string().optional().default(''),
    friendEmail: z.string().optional().default(''),
    friendPhone: z.string().optional().default(''),
    sendNotification: z.boolean().default(true),
    autoReminder: z.boolean().default(true),
    requireFriendName: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'transfer') {
      if (
        (data.transferType === 'bank_to_cash' || data.transferType === 'bank_to_bank') &&
        !data.fromBankId
      ) {
        ctx.addIssue({ code: 'custom', path: ['fromBankId'], message: 'Select a source bank' });
      }
      if (
        (data.transferType === 'cash_to_bank' || data.transferType === 'bank_to_bank') &&
        !data.toBankId
      ) {
        ctx.addIssue({ code: 'custom', path: ['toBankId'], message: 'Select a destination bank' });
      }
    } else if (data.paymentMethod === 'bank' && !data.bankId) {
      ctx.addIssue({ code: 'custom', path: ['bankId'], message: 'Select a bank account' });
    }

    if (data.requireFriendName && !String(data.friendName || '').trim()) {
      ctx.addIssue({ code: 'custom', path: ['friendName'], message: "Please enter friend's name" });
    }

    const email = String(data.friendEmail || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({ code: 'custom', path: ['friendEmail'], message: 'Enter a valid email' });
    }
  });
