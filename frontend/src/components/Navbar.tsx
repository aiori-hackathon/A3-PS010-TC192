import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShieldCheck, Sparkles, LogOut, Terminal, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGlass } from './ShatteredGlassEngine';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerShatter } = useGlass();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Analyze IP', path: '/analyze' },
    { name: 'History', path: '/history' },
    { name: 'Explorer', path: '/explorer' },
    { name: 'Benchmarks', path: '/benchmark' },
    { name: 'Audit', path: '/audit' },
  ];

  return (
    <header className="sticky top-3 sm:top-4 z-40 mx-3 sm:mx-6 mb-4 h-16 rounded-2xl backdrop-blur-2xl bg-[#17171B]/85 border border-white/[0.10] shadow-[0_12px_40px_0_rgba(0,0,0,0.65),inset_0_1px_1px_0_rgba(255,255,255,0.15)] hover:border-[#8C7BFF]/30 transition-all duration-300 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#A0A0AA] hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8C7BFF] to-[#70D7FF] flex items-center justify-center text-white shadow-[0_0_16px_rgba(140,123,255,0.35)] shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{title || 'NetEvidence AI'}</span>
            </h1>
            <p className="text-[10.5px] text-[#A0A0AA] font-normal leading-tight">
              Evidence-Based Network Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Center: Desktop Nav Links on Glass */}
      <nav className="hidden xl:flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.10] text-white border border-white/[0.15] shadow-xs'
                  : 'text-[#A0A0AA] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {link.name}
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Methodology Shatter Trigger */}
        <button
          onClick={triggerShatter}
          title="Inspect Explainable Classification Methodology (3D Shatter)"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium backdrop-blur-md bg-[#202027]/80 text-[#B9ABFF] border border-[#8C7BFF]/30 hover:bg-[#8C7BFF]/20 hover:border-[#8C7BFF]/60 hover:shadow-[0_0_20px_rgba(140,123,255,0.25)] transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8C7BFF]" />
          <span>Methodology</span>
        </button>

        {/* Quick Analyze IP Button */}
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#8C7BFF] hover:bg-[#7b68ff] text-white shadow-[0_4px_16px_rgba(140,123,255,0.35)] transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Analyze IP</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-black/25 rounded text-white/80">
            /
          </kbd>
        </button>

        {/* User profile pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.10]">
          <div className="w-8 h-8 rounded-xl backdrop-blur-md bg-[#202027] text-white flex items-center justify-center text-xs font-semibold border border-white/[0.12] shadow-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-white leading-tight">
              {user?.full_name?.split(' ')[0] || 'Analyst'}
            </span>
            <span className="block text-[10px] text-[#A0A0AA] font-mono leading-tight">
              {user?.email ? user.email.split('@')[0] : 'analyst'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-[#777782] hover:text-[#FF626E] hover:bg-white/[0.05] transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
