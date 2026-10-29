import { useState, useEffect } from 'react';
import { Menu, X, Building2, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { PUBLIC_NAV, RESIDENT_NAV, ADMIN_NAV } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { PageId } from '@/types';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : [...PUBLIC_NAV, ...RESIDENT_NAV];

  const handleNav = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-neutral-900/5'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">
          <span className="opacity-90">Official Portal of Barangay Lumangbayan</span>
          <div className="flex items-center gap-3 opacity-90">
            <span>Republic of the Philippines</span>
            <span className="opacity-50">|</span>
            <span>Oriental Mindoro</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => handleNav(isAdmin ? 'admin-dashboard' : 'home')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <Building2 className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold text-neutral-900 text-base lg:text-lg leading-tight">
                Barangay Lumangbayan
              </div>
              <div className="text-[10px] lg:text-xs text-neutral-500 font-medium tracking-wide">
                {isAdmin ? 'Admin Panel' : 'Official Community Portal'}
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:text-primary-700 hover:bg-neutral-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User menu / login */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-neutral-700">{user.full_name}</div>
                    <div className="text-xs text-neutral-400 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <div className="text-sm font-medium text-neutral-700 truncate">{user.full_name}</div>
                      <div className="text-xs text-neutral-400 truncate">{user.email}</div>
                    </div>
                    {!isAdmin && (
                      <button
                        onClick={() => handleNav('track')}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Requests
                      </button>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        handleNav('home');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="lg:hidden bg-white border-t border-neutral-100 animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {user && (
              <div className="px-4 py-3 mb-2 bg-neutral-50 rounded-xl">
                <div className="text-sm font-medium text-neutral-700">{user.full_name}</div>
                <div className="text-xs text-neutral-400">{user.email}</div>
                <div className="text-xs text-primary-600 capitalize mt-1">{user.role} account</div>
              </div>
            )}
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  handleNav('home');
                }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
