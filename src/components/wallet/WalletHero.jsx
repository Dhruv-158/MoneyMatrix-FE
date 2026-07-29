import React from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowLeftRight, Download, Edit3, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function WalletHero({ balance = 0, onSetBalance, onTransfer, onExport }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-white/10">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Main Cash Wallet</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-medium">Physical Cash & On-Hand Wallet</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">Wallet Account</span>
            <span className="text-xs font-mono font-bold text-white/90">Primary Cash</span>
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-1 pt-2">
          <span className="text-xs font-bold text-blue-200/90 uppercase tracking-wider">Available Cash Balance</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {formatCurrency(balance)}
          </h1>
        </div>

        {/* Hero Actions */}
        <div className="pt-4 flex items-center gap-3 flex-wrap border-t border-white/10">
          <button
            onClick={onSetBalance}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-extrabold text-xs hover:bg-blue-50 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Set Balance</span>
          </button>

          {onTransfer && (
            <button
              onClick={onTransfer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-200" />
              <span>Transfer Funds</span>
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>Export Statement</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
