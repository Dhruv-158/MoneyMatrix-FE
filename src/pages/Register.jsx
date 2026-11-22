import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { register as registerUser, clearError } from '@/redux/slices/authSlice';
import { registerSchema } from '@/schemas/auth';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toastService from '@/services/toastService';

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values) => {
    dispatch(clearError());
    try {
      const res = await dispatch(registerUser(values)).unwrap();
      toastService.success(res?.message || 'Account created successfully!');
    } catch (err) {
      toastService.error(err?.errorMessage || err);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-emerald-600/20 to-blue-600/10 items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center px-12 relative z-10">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-blue-500/30 bg-slate-900 mx-auto mb-6 p-1">
            <img src="/logo.png" alt="MoneyMatrix Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Join MoneyMatrix</h1>
          <p className="text-lg text-slate-300">Start managing your finances today</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold text-white">MoneyMatrix</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-sm text-slate-400 mb-8">Fill in your details to get started</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-card border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                    errors.name ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-card border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                    errors.email ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-card border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                    errors.password ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" title="Toggle password visibility">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
