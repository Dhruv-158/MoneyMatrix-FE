import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchCashWallet, updateCashWallet } from '@/redux/slices/cashSlice';
import { fetchTransactions } from '@/redux/slices/transactionSlice';
import StatCard from '@/components/cards/StatCard';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Wallet, ArrowUpRight, ArrowDownRight, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CashWallet() {
  const dispatch = useDispatch();
  const { wallet } = useSelector((s) => s.cash);
  const { items: txns } = useSelector((s) => s.transactions);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);
  const [editOpen, setEditOpen] = useState(false);
  const [balance, setBalance] = useState('');

  useEffect(() => { if (isInitialized) { dispatch(fetchCashWallet()); dispatch(fetchTransactions({ limit: 50 })); } }, [dispatch, isInitialized, lastUpdated]);

  const cashTxns = txns.filter(t => t.paymentMethod === 'cash' || t.transferType?.includes('cash'));

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await dispatch(updateCashWallet(Number(balance))).unwrap(); toast.success('Updated'); setEditOpen(false); } catch (err) { toast.error(err || 'Failed'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Cash Wallet</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><StatCard title="Cash Balance" value={wallet?.balance || 0} icon={Wallet} color="green" /></div>
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5"><h3 className="text-sm font-semibold text-white">Cash Transactions</h3></div>
        <div className="divide-y divide-white/5">
          {cashTxns.length ? cashTxns.slice(0, 15).map(tx => (
            <div key={tx._id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {console.log(tx.type)}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' || tx.type === 'transfer' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {tx.type === 'income' || tx.type === 'transfer' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                </div>
                <div><p className="text-sm font-medium text-white">{tx.note || tx.type}</p><p className="text-xs text-slate-500">{formatDate(tx.date)}</p></div>
              </div>
              <p className={`text-sm font-semibold ${tx.type === 'income' || tx.type === 'transfer' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.type === 'income' || tx.type === 'transfer' ? '+' : '-'}{formatCurrency(tx.amount)}</p>
            </div>
          )) : <div className="py-12 text-center"><p className="text-sm text-slate-500">No cash transactions.</p></div>}
        </div>
      </div>
      {editOpen && (<><div className="fixed inset-0 bg-black/60 z-50" onClick={() => setEditOpen(false)} /><div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-card border border-white/10 rounded-2xl"><div className="flex items-center justify-between p-5 border-b border-white/5"><h2 className="text-lg font-semibold text-white">Set Cash Balance</h2><button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-white" title="Close"><X className="w-5 h-5" /></button></div><form onSubmit={handleUpdate} className="p-5 space-y-4"><input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-background border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" required /><button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm">Update</button></form></motion.div></div></>)}
    </motion.div>
  );
}
