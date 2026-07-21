import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/helpers';
import { Building2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const gradients = [
  'from-blue-600 to-blue-800',
  'from-emerald-600 to-emerald-800',
  'from-purple-600 to-purple-800',
  'from-amber-600 to-amber-800',
  'from-rose-600 to-rose-800',
  'from-cyan-600 to-cyan-800',
];

export default function BankCard({ bank, index = 0, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative p-5 rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden min-h-[180px] flex flex-col justify-between`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{bank.bankName}</p>
            <p className="text-xs text-white/60 capitalize">{bank.accountType} Account</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-32 bg-card border border-white/10 rounded-xl shadow-2xl py-1 z-20">
              <button
                onClick={() => { setMenuOpen(false); onEdit?.(bank); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete?.(bank._id); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="relative z-10 mt-6">
        <p className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Balance</p>
        <p className="text-2xl font-bold text-white mt-1">{formatCurrency(bank.currentBalance)}</p>
        <p className="text-xs text-white/40 mt-2">•••• •••• •••• {bank.accountNumberLast4}</p>
      </div>
    </motion.div>
  );
}
