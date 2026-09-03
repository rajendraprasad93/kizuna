import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LogOut, Menu, Bell, LayoutDashboard, Map, Plus, BarChart3, User as UserIcon, Users, Building2, ShieldCheck, Search, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, type TranslationKey } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import type { UserRole } from '@/types';

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardShell({ children, title, subtitle, actions }: DashboardShellProps) {
  const { profile, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = profile?.role || 'citizen';
  const isKizunaTheme = role === 'citizen'; // Only apply Kizuna theme to citizen dashboard

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = getNavItems(role, t);

  const roleLabel = role === 'admin' ? t('administrator') : role === 'department' ? t('departmentOfficial') : t('citizen');
  const roleColor = role === 'admin' ? 'text-purple-600 bg-purple-50' : role === 'department' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';

  // Kizuna theme colors
  const sidebarBg = isKizunaTheme ? 'bg-white border-r border-pink-100' : 'bg-white border-r border-slate-200';
  const brandGradient = isKizunaTheme ? 'from-purple-500 to-pink-500' : 'from-brand-500 to-brand-700';
  const brandText = isKizunaTheme ? '絆' : 'CivicEye';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sakura decorative elements for Kizuna theme */}
      {isKizunaTheme && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 right-10 w-16 h-16 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400">
              <path d="M50 10 L60 30 L80 25 L65 45 L85 60 L60 55 L50 75 L40 55 L15 60 L35 45 L20 25 L40 30 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute bottom-32 left-20 w-12 h-12 opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400">
              <path d="M50 10 L60 30 L80 25 L65 45 L85 60 L60 55 L50 75 L40 55 L15 60 L35 45 L20 25 L40 30 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 ${sidebarBg} flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-pink-50">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${brandGradient} flex items-center justify-center shadow-lg`}>
              {isKizunaTheme ? (
                <span className="text-white font-bold text-lg">絆</span>
              ) : (
                <Brain className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-slate-900">{brandText}</span>
              {isKizunaTheme && (
                <span className="text-xs text-slate-500">きずなのために</span>
              )}
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            const activeStyles = isKizunaTheme
              ? active ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-r-2 border-purple-400' : 'text-slate-600 hover:bg-purple-50/50'
              : active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100';
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeStyles}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-pink-50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isKizunaTheme ? 'from-purple-200 to-pink-200' : 'from-slate-200 to-slate-300'} flex items-center justify-center text-slate-600 font-semibold text-sm`}>
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</div>
              <div className={`text-xs font-medium inline-block px-1.5 py-0.5 rounded ${roleColor}`}>{roleLabel}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-purple-50 transition-colors">
            <LogOut className="h-4 w-4" /> {t('signOut')}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-pink-100/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-purple-50" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              {isKizunaTheme && (
                <div className="hidden md:flex items-center gap-3 bg-purple-50/50 rounded-xl px-4 py-2 max-w-md">
                  <Search className="h-4 w-4 text-purple-400" />
                  <input
                    type="text"
                    placeholder="レポートを検索..."
                    className="bg-transparent border-none outline-none text-sm flex-1 text-slate-700 placeholder-purple-400"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <LanguageToggle />
              <Link to="/notifications" className={`p-2 rounded-lg transition-colors relative ${isKizunaTheme ? 'text-purple-500 hover:bg-purple-50' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Bell className="h-5 w-5" />
              </Link>
              {isKizunaTheme && (
                <Link to="/report/new" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
                  <Plus className="h-4 w-4" />
                  新しい報告をする
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function getNavItems(role: UserRole, t: (key: TranslationKey) => string) {
  if (role === 'admin') {
    return [
      { label: t('overview'), href: '/admin/dashboard', icon: LayoutDashboard },
      { label: t('allReports'), href: '/admin/reports', icon: BarChart3 },
      { label: t('departments'), href: '/admin/departments', icon: Building2 },
      { label: t('users'), href: '/admin/users', icon: Users },
    ];
  }
  if (role === 'department') {
    return [
      { label: t('dashboard'), href: '/department/dashboard', icon: LayoutDashboard },
      { label: t('assignedCases'), href: '/department/reports', icon: ShieldCheck },
      { label: t('mapView'), href: '/department/map', icon: Map },
    ];
  }
  return [
    { label: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('newReport'), href: '/report/new', icon: Plus },
    { label: t('myReports'), href: '/dashboard/my-reports', icon: BarChart3 },
    { label: t('mapView'), href: '/dashboard/map', icon: Map },
    { label: t('notifications'), href: '/notifications', icon: Bell },
    { label: t('profile'), href: '/profile', icon: UserIcon },
    { label: t('helpSupport'), href: '/help', icon: HelpCircle },
  ];
}
