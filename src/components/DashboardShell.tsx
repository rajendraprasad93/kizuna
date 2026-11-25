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
  const isKizunaTheme = true; // Apply Kizuna theme to all dashboards

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = getNavItems(role, t);

  const roleLabel = role === 'admin' ? '管理者' : role === 'department' ? '部門職員' : '市民';
  
  // Role-specific colors for Kizuna theme
  const roleColors = {
    admin: 'text-violet-700 bg-violet-50 border-violet-200',
    department: 'text-indigo-700 bg-indigo-50 border-indigo-200', 
    citizen: 'text-purple-700 bg-purple-50 border-purple-200'
  };
  const roleColor = roleColors[role];

  // Kizuna theme colors - role-specific variations
  const themeColors = {
    admin: {
      sidebarBg: 'bg-white border-r border-violet-100',
      brandGradient: 'from-violet-500 to-purple-500',
      activeNav: 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-r-2 border-violet-400',
      hoverNav: 'text-slate-600 hover:bg-violet-50/50',
      searchBg: 'bg-violet-50/70 border-violet-100',
      searchText: 'placeholder-violet-400',
      profileBg: 'from-violet-200 to-purple-200',
      bellColor: 'text-violet-500 hover:bg-violet-50',
      buttonGradient: 'from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600'
    },
    department: {
      sidebarBg: 'bg-white border-r border-indigo-100',
      brandGradient: 'from-indigo-500 to-purple-500',
      activeNav: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-r-2 border-indigo-400',
      hoverNav: 'text-slate-600 hover:bg-indigo-50/50',
      searchBg: 'bg-indigo-50/70 border-indigo-100',
      searchText: 'placeholder-indigo-400',
      profileBg: 'from-indigo-200 to-purple-200',
      bellColor: 'text-indigo-500 hover:bg-indigo-50',
      buttonGradient: 'from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
    },
    citizen: {
      sidebarBg: 'bg-white border-r border-pink-100',
      brandGradient: 'from-purple-500 to-pink-500',
      activeNav: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-r-2 border-purple-400',
      hoverNav: 'text-slate-600 hover:bg-purple-50/50',
      searchBg: 'bg-purple-50/70 border-purple-100',
      searchText: 'placeholder-purple-400',
      profileBg: 'from-purple-200 to-pink-200',
      bellColor: 'text-purple-500 hover:bg-purple-50',
      buttonGradient: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    }
  };
  
  const theme = themeColors[role];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sakura decorative elements for all dashboards */}
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

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 ${theme.sidebarBg} flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-purple-50">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.brandGradient} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-lg">絆</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-slate-900">Kizuna</span>
              <span className="text-xs text-slate-500">きずなのために</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            const activeStyles = active ? theme.activeNav : theme.hoverNav;
            
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

        <div className="p-3 border-t border-purple-50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.profileBg} flex items-center justify-center text-slate-600 font-semibold text-sm`}>
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</div>
              <div className={`text-xs font-medium inline-block px-2 py-1 rounded-lg border ${roleColor}`}>{roleLabel}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-purple-50 transition-colors">
            <LogOut className="h-4 w-4" /> サインアウト
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-purple-100/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-20">
            <div className="flex items-center gap-6">
              <button className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-purple-50" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div className={`hidden md:flex items-center gap-3 ${theme.searchBg} rounded-2xl px-6 py-3 max-w-md border`}>
                <Search className="h-5 w-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="レポートを検索..."
                  className={`bg-transparent border-none outline-none text-sm flex-1 text-slate-700 ${theme.searchText} font-medium`}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">EN</button>
                <button className="px-3 py-2 text-sm font-medium bg-white text-slate-900 rounded-lg shadow-sm">日本語</button>
              </div>
              <Link to="/notifications" className={`p-3 rounded-xl transition-colors relative ${theme.bellColor}`}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full"></span>
              </Link>
              {role === 'citizen' && (
                <Link to="/report/new" className={`flex items-center gap-2 bg-gradient-to-r ${theme.buttonGradient} text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl`}>
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
      { label: 'システム概要', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'すべてのレポート', href: '/admin/reports', icon: BarChart3 },
      { label: '部門管理', href: '/admin/departments', icon: Building2 },
      { label: 'ユーザー管理', href: '/admin/users', icon: Users },
    ];
  }
  if (role === 'department') {
    return [
      { label: 'ダッシュボード', href: '/department/dashboard', icon: LayoutDashboard },
      { label: '担当ケース', href: '/department/reports', icon: ShieldCheck },
      { label: 'マップビュー', href: '/department/map', icon: Map },
    ];
  }
  return [
    { label: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
    { label: '新しい報告', href: '/report/new', icon: Plus },
    { label: 'マイレポート', href: '/dashboard/my-reports', icon: BarChart3 },
    { label: 'マップビュー', href: '/dashboard/map', icon: Map },
    { label: 'お知らせ', href: '/notifications', icon: Bell },
    { label: 'プロフィール', href: '/profile', icon: UserIcon },
    { label: 'ヘルプ＆サポート', href: '/help', icon: HelpCircle },
  ];
}
