import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/helpers';
import { Building2, MoreVertical, Pencil, Trash2, Wifi, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

// Premium Bank Card Themes (Apple Wallet / Revolut / Visa Signature aesthetics)
const cardThemes = [
  {
    bg: 'from-slate-900 via-slate-800 to-black text-white border-slate-700/60 shadow-slate-950/50',
    accent: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
    chip: 'from-amber-200 via-yellow-400 to-amber-300 border-amber-600/40',
  },
  {
    bg: 'from-blue-900 via-indigo-900 to-slate-950 text-white border-blue-600/40 shadow-blue-950/50',
    accent: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    chip: 'from-amber-200 via-yellow-400 to-amber-300 border-amber-600/40',
  },
  {
    bg: 'from-purple-900 via-slate-900 to-black text-white border-purple-600/40 shadow-purple-950/50',
    accent: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
    chip: 'from-amber-200 via-yellow-400 to-amber-300 border-amber-600/40',
  },
  {
    bg: 'from-emerald-950 via-slate-900 to-black text-white border-emerald-600/40 shadow-emerald-950/50',
    accent: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
    chip: 'from-amber-200 via-yellow-400 to-amber-300 border-amber-600/40',
  },
];

export default function BankCard({ bank, index = 0, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = cardThemes[index % cardThemes.length];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative w-full aspect-[1.586/1] p-6 rounded-3xl bg-gradient-to-br ${theme.bg} border overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-xl group cursor-pointer`}
    >
      {/* Subtle Metallic Specular Lighting Overlay */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none group-hover:bg-white/15 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-52 h-52 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Decorative Geometric Patterns */}
      <div className="absolute right-4 bottom-4 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute right-8 bottom-8 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />

      {/* TOP ROW: Dynamic Bank Header & Overflow Menu */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-white leading-tight">
              {bank.bankName || 'Bank Account'}
            </h3>
            <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize border ${theme.accent}`}>
              <ShieldCheck className="w-2.5 h-2.5" />
              {bank.accountType || 'Savings'}
            </span>
          </div>
        </div>

        {/* Action Overflow Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-2 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition cursor-pointer"
            title="Card Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 w-40 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit?.(bank);
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" /> Edit Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete?.(bank._id);
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE ROW: EMV Chip & Contactless Symbol */}
      <div className="flex items-center justify-between relative z-10 my-auto">
        <div className={`w-10 h-7 rounded-lg bg-gradient-to-r ${theme.chip} border shadow-inner flex items-center justify-center`}>
          <div className="w-7 h-4 border border-amber-700/40 rounded-xs" />
        </div>
        <Wifi className="w-5 h-5 text-white/60 rotate-90" />
      </div>

      {/* BOTTOM ROW: Dynamic Balance & Masked Card Number */}
      <div className="relative z-10 space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold block">
          Available Balance
        </span>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {formatCurrency(bank.currentBalance || 0)}
          </p>
          <p className="text-xs font-mono font-bold tracking-widest text-white/80">
            •••• {bank.accountNumberLast4 || '----'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
