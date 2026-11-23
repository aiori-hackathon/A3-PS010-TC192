import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('demo@netevidence.ai');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-[#0A0E1A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden">
      {/* Ambient background light meshes for glassmorphic depth & refraction */}
      <div className="fixed -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-[32rem] h-[32rem] rounded-full bg-indigo-300/20 dark:bg-indigo-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-teal-300/15 dark:bg-cyan-600/10 blur-[130px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-sm text-white font-bold">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          NetEvidence AI
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Evidence-Based IP Network-Type Classification Platform
        </p>
        <div className="mt-2 text-[11px] text-slate-400 font-medium">
          Team Evolve • A3-PS010-TC192 • GNITC
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/75 dark:bg-[#111827]/75 border border-white/70 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* 1-Click Demo Login Box */}
          <div className="mb-5 p-3.5 rounded-xl backdrop-blur-md bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 text-xs flex items-center justify-between shadow-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                Demo Evaluator Account:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                demo@netevidence.ai • Password123!
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
            >
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-900 dark:text-white text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-900 dark:text-white text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">Bcrypt Protected</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-white/40 dark:border-white/10 pt-4">
            Don't have an analyst account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> RFC Guard Active
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Immutable Audit Ledger
          </span>
        </div>
      </div>
    </div>
  );
};
