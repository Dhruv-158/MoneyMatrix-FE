import React from 'react';
import { formatCurrency } from '@/utils/helpers';
import { ShieldCheck, TrendingUp, TrendingDown, PiggyBank, Building2, CreditCard, Layers, FileText } from 'lucide-react';

export default function PdfReportDocument({ data, activeTab, dateParam, user }) {
  const summary = data?.summary || { income: 0, expense: 0, transfer: 0 };
  const netSavings = data?.netSavings || 0;
  const savingsRate = data?.savingsRate || (summary.income > 0 ? Math.round((netSavings / summary.income) * 100) : 0);
  const bankBalances = data?.bankBalances || [];
  const categoryWise = data?.categoryWiseExpenses || [];

  return (
    <div id="pdf-report-document" className="w-[740px] bg-slate-950 text-white font-sans p-8 space-y-6 text-xs leading-relaxed border border-slate-800 box-border">
      
      {/* 1. COVER PAGE / HEADER */}
      <div className="border-b-2 border-blue-500/50 pb-6 flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm">
              FT
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">FinTrack Enterprise</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Monthly Financial Statement</h1>
            <p className="text-[11px] text-slate-400">Official Executive Reporting & Performance Summary</p>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-3 h-3" /> AUDITED STATEMENT
          </span>
          <p className="text-[11px] font-mono text-slate-400 block pt-1">Period: <strong className="text-white uppercase">{activeTab} ({dateParam})</strong></p>
          <p className="text-[10px] text-slate-500">Prepared For: {user?.name || 'Account Holder'}</p>
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY & FINANCIAL PACE */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" /> Executive Financial Narrative
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          For the period ending <strong className="text-white">{dateParam}</strong>, total gross revenue received was <strong className="text-emerald-400">{formatCurrency(summary.income)}</strong> against operating cash outflows of <strong className="text-rose-400">{formatCurrency(summary.expense)}</strong>. Net preserved capital for the period equaled <strong className="text-blue-400">{formatCurrency(netSavings)}</strong>, representing a net savings rate of <strong className="text-white">{savingsRate}%</strong>.
        </p>
      </div>

      {/* 3. KEY PERFORMANCE METRICS */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gross Income</span>
          <p className="text-xl font-black text-emerald-400">{formatCurrency(summary.income)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Total revenue inflows</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Expenses</span>
          <p className="text-xl font-black text-rose-400">{formatCurrency(summary.expense)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Operating cash outflows</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Net Savings</span>
          <p className="text-xl font-black text-blue-400">{formatCurrency(netSavings)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Retained net balance</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Savings Rate</span>
          <p className="text-xl font-black text-purple-400">{savingsRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1">Capital retention pace</p>
        </div>
      </div>

      {/* 4. TREASURY & LIQUIDITY POSITION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> Connected Treasury & Liquidity Position
          </h3>
          <span className="text-[10px] font-mono text-slate-500">{bankBalances.length} Accounts Connected</span>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="p-3">Bank Institution</th>
                <th className="p-3">Account Type</th>
                <th className="p-3 text-right">Cleared Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bankBalances.length > 0 ? (
                bankBalances.map((b) => (
                  <tr key={b._id}>
                    <td className="p-3 font-bold text-white">{b.bankName}</td>
                    <td className="p-3 text-slate-400 capitalize">{b.accountType} Account</td>
                    <td className="p-3 text-right font-extrabold text-blue-400">{formatCurrency(b.currentBalance || b.balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-500">No connected bank accounts recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TOP EXPENSE CATEGORIES ANALYSIS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" /> Major Expense Category Outflows
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Categorized Expenditures</span>
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="p-3">Category Name</th>
                <th className="p-3 text-right">Outflow Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categoryWise.length > 0 ? (
                categoryWise.slice(0, 6).map((c, i) => (
                  <tr key={i}>
                    <td className="p-3 font-bold text-white">{c.name || c.category || 'Uncategorized'}</td>
                    <td className="p-3 text-right font-extrabold text-rose-400">{formatCurrency(c.total || c.value || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-4 text-center text-slate-500">No category outflows recorded for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. AUDIT STAMP & FOOTER */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>FinTrack Audited Report • System Verified</span>
        </div>
        <span>Page 1 of 1</span>
        <span>Generated: {new Date().toLocaleDateString()}</span>
      </div>

    </div>
  );
}
