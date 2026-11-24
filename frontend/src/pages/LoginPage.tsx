import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#050507] text-[#E5E5EA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient optical refraction meshes */}
      <div className="fixed -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-[#8C7BFF]/10 blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-[36rem] h-[36rem] rounded-full bg-[#70D7FF]/10 blur-[150px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-[#36D67E]/05 blur-[140px] pointer-events-none" />

      {/* Header Shard */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8C7BFF] to-[#70D7FF] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(140,123,255,0.4)] text-white font-bold mb-4">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          NetEvidence AI
        </h1>
        <p className="mt-1.5 text-xs font-mono text-[#8C7BFF] tracking-wider uppercase font-semibold">
          Evidence-Based IP Network Intelligence
        </p>
        <p className="mt-2 text-xs text-[#A0A0AA] max-w-sm mx-auto leading-relaxed">
          Investigate IP addresses through multi-source network evidence, explainable classification, and transparent intelligence.
        </p>
      </div>

      {/* Form Glass Shard */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-[#17171B]/85 border border-white/[0.10] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_0_rgba(0,0,0,0.7),inset_0_1px_2px_0_rgba(255,255,255,0.18)] hover:border-[#8C7BFF]/40 transition-all duration-300">
          {/* Quick Demo Fill Pill */}
          <div className="mb-6 p-3.5 rounded-2xl backdrop-blur-md bg-[#202027]/70 border border-white/[0.08] text-xs flex items-center justify-between shadow-xs">
            <div>
              <span className="font-semibold text-white block text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#8C7BFF]" />
                Demo Evaluator Access
              </span>
              <span className="text-[10px] text-[#A0A0AA] font-mono block mt-0.5">
                demo@netevidence.ai • Password123!
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3 py-1.5 rounded-xl bg-[#8C7BFF]/20 hover:bg-[#8C7BFF]/30 text-[#B9ABFF] border border-[#8C7BFF]/40 font-mono text-xs transition-all shadow-xs"
            >
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FF626E]/10 border border-[#FF626E]/30 text-[#FF626E] text-xs font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#E5E5EA] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono placeholder-[#777782]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#E5E5EA]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs font-mono placeholder-[#777782]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777782] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-gradient-to-r from-[#8C7BFF] to-[#70D7FF] hover:opacity-95 text-white shadow-[0_4px_24px_rgba(140,123,255,0.35)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 font-mono tracking-wide"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Laboratory'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#A0A0AA] border-t border-white/[0.08] pt-4">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[#8C7BFF] hover:text-[#B9ABFF] underline">
              Create Analyst Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
