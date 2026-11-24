import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="lg:hidden sticky top-3 z-40 mx-3 mb-4 h-14 rounded-2xl backdrop-blur-2xl bg-[#17171B]/90 border border-white/[0.10] shadow-[0_12px_40px_0_rgba(0,0,0,0.65)] px-4 flex items-center justify-between">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#A0A0AA] hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8C7BFF] to-[#70D7FF] flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">NetEvidence AI</span>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#202027] text-white flex items-center justify-center text-xs font-semibold border border-white/[0.12]">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded-lg text-[#777782] hover:text-[#FF626E] hover:bg-white/[0.05] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
