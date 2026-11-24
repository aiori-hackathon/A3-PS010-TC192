import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShatteredGlassCard } from '../components/ShatteredGlassCard';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-[#202027]', 'bg-[#FF626E]', 'bg-[#F0B45C]', 'bg-[#70D7FF]', 'bg-[#36D67E]'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your confirmation password.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
      });
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507]/60 text-[#E5E5EA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden backdrop-blur-xs">
      {/* Ambient optical refraction meshes */}
      <div className="fixed -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-[#8C7BFF]/15 blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-[36rem] h-[36rem] rounded-full bg-[#70D7FF]/15 blur-[150px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-[#36D67E]/10 blur-[140px] pointer-events-none" />

      {/* Header Shard */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8C7BFF] to-[#70D7FF] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(140,123,255,0.5)] text-white font-bold mb-3 border border-white/20">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          NetEvidence AI
        </h1>
        <p className="mt-1 text-xs font-mono text-[#8C7BFF] tracking-wider uppercase font-semibold">
          Evidence-Based IP Network Intelligence
        </p>
      </div>

      {/* 3D Shattered Glass Card Form */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <ShatteredGlassCard
          title="Create Account"
          subtitle="Join the NetEvidence AI Security Intelligence Platform."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FF626E]/15 border border-[#FF626E]/40 text-[#FF626E] text-xs font-mono shadow-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3.5 rounded-xl bg-[#36D67E]/15 border border-[#36D67E]/40 text-[#36D67E] text-xs font-mono flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#E5E5EA] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Security Analyst"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono placeholder-[#777782] border-white/[0.15] bg-[#121216]/90 focus:border-[#8C7BFF] focus:shadow-[0_0_15px_rgba(140,123,255,0.25)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E5E5EA] mb-1.5">
                Enter your Mail ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono placeholder-[#777782] border-white/[0.15] bg-[#121216]/90 focus:border-[#8C7BFF] focus:shadow-[0_0_15px_rgba(140,123,255,0.25)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E5E5EA] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs font-mono placeholder-[#777782] border-white/[0.15] bg-[#121216]/90 focus:border-[#8C7BFF] focus:shadow-[0_0_15px_rgba(140,123,255,0.25)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777782] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full ${
                          strength >= level ? strengthColors[strength] : 'bg-[#202027]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#A0A0AA] font-mono">
                    <span>Strength: {strengthLabels[strength]}</span>
                    <span>Min 6 chars</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E5E5EA] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777782] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono placeholder-[#777782] border-white/[0.15] bg-[#121216]/90 focus:border-[#8C7BFF] focus:shadow-[0_0_15px_rgba(140,123,255,0.25)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-gradient-to-r from-[#8C7BFF] to-[#70D7FF] hover:brightness-110 active:scale-[0.98] text-white shadow-[0_4px_24px_rgba(140,123,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4 font-mono tracking-wide cursor-pointer border border-white/20"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#A0A0AA] border-t border-white/[0.10] pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#8C7BFF] hover:text-[#B9ABFF] underline">
              Sign In
            </Link>
          </div>
        </ShatteredGlassCard>
      </div>
    </div>
  );
};
