import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout } from '@/redux/slices/authSlice';
import { User, Palette, DollarSign, Bell, Download, Trash2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const sections = [
    { icon: User, title: 'Profile', desc: 'Manage your account information', items: [{ label: 'Name', value: user?.name }, { label: 'Email', value: user?.email }] },
    { icon: Palette, title: 'Theme', desc: 'Customize appearance', items: [{ label: 'Mode', value: 'Dark' }] },
    { icon: DollarSign, title: 'Currency', desc: 'Set your default currency', items: [{ label: 'Currency', value: '₹ INR' }] },
    { icon: Bell, title: 'Notifications', desc: 'Configure alerts and reminders', items: [{ label: 'Email Notifications', value: 'Enabled' }] },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-white">Settings</h2>

      {sections.map(s => (
        <div key={s.title} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center"><s.icon className="w-4 h-4 text-blue-400" /></div>
            <div><p className="text-sm font-semibold text-white">{s.title}</p><p className="text-xs text-slate-500">{s.desc}</p></div>
          </div>
          <div className="space-y-3">
            {s.items.map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><Download className="w-4 h-4 text-amber-400" /></div>
          <div><p className="text-sm font-semibold text-white">Export Data</p><p className="text-xs text-slate-500">Download all your data</p></div>
        </div>
        <button className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white transition" onClick={() => toast.success('Export coming soon')}>Export as JSON</button>
      </div>

      <div className="glass-card p-5 border-red-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-400" /></div>
          <div><p className="text-sm font-semibold text-red-400">Danger Zone</p><p className="text-xs text-slate-500">Irreversible actions</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { dispatch(logout()); }} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
          <button className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition" onClick={() => toast.error('Account deletion coming soon')}>Delete Account</button>
        </div>
      </div>
    </motion.div>
  );
}
