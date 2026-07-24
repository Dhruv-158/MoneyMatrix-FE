import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/helpers';
import { Building2, MoreVertical, Pencil, Trash2, CreditCard } from 'lucide-react';
import { useState } from 'react';

const metallicCardClasses = [
  'mercury-card-dark text-white border border-slate-700/50',
  'mercury-card-blue text-white border border-blue-700/50',
  'mercury-card-purple text-white border border-purple-700/50',
];

export default function BankCard({ bank, index = 0, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardStyle = metallicCardClasses[index % metallicCardClasses.length];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative p-6 rounded-3xl ${cardStyle} overflow-hidden min-h-[200px] flex flex-col justify-between shadow-xl`}
    >
      {/* Decorative Metallic Chip & Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-inner">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-white">{bank.bankName}</p>
            <p className="text-[11px] text-slate-300/80 capitalize font-medium">{bank.accountType || 'checking'} account</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl py-1.5 z-20">
              <button
                onClick={() => { setMenuOpen(false); onEdit?.(bank); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" /> Edit Bank
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete?.(bank._id); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center SIM Chip visual */}
      <div className="flex items-center gap-3 my-2 opacity-80">
        <div className="w-9 h-7 rounded-md bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 border border-amber-500/50 shadow-inner flex items-center justify-center">
          <div className="w-6 h-4 border border-amber-600/40 rounded-sm" />
        </div>
        <CreditCard className="w-5 h-5 text-white/40" />
      </div>

      {/* Bottom row */}
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-widest text-slate-300/60 font-bold">Current Balance</p>
        <div className="flex items-baseline justify-between mt-0.5">
          <p className="text-2xl font-black tracking-tight text-white">{formatCurrency(bank.currentBalance)}</p>
          <p className="text-xs font-mono tracking-widest text-white/70">•••• {bank.accountNumberLast4 || '4242'}</p>
        </div>
      </div>
    </motion.div>
  );
}
