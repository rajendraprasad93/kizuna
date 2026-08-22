import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LogOut, Menu, X, Bell, LayoutDashboard, Map, Plus, BarChart3, User as UserIcon, Users, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardShell({ children, title, subtitle, actions }: DashboardShellProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = profile?.role || 'citizen';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = getNavItems(role);

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'department' ? 'Department Official' : 'Citizen';
  const roleColor = role === 'admin' ? 'text-purple-600 bg-purple-50' : role === 'department' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';
  const dashLink = role === 'admin' ? '/admin/dashboard' : role === 'department' ? '/department/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">CivicEye</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-semibold text-sm">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</div>
              <div className={`text-xs font-medium inline-block px-1.5 py-0.5 rounded ${roleColor}`}>{roleLabel}</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-display text-lg font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Link to="/notifications" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative">
                <Bell className="h-5 w-5" />
              </Link>
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

function getNavItems(role: UserRole) {
  if (role === 'admin') {
    return [
      { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'All Reports', href: '/admin/reports', icon: BarChart3 },
      { label: 'Departments', href: '/admin/departments', icon: Building2 },
      { label: 'Users', href: '/admin/users', icon: Users },
    ];
  }
  if (role === 'department') {
    return [
      { label: 'Dashboard', href: '/department/dashboard', icon: LayoutDashboard },
      { label: 'Assigned Cases', href: '/department/reports', icon: ShieldCheck },
      { label: 'Map View', href: '/department/map', icon: Map },
    ];
  }
  return [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'New Report', href: '/report/new', icon: Plus },
    { label: 'My Reports', href: '/dashboard/my-reports', icon: BarChart3 },
    { label: 'Map View', href: '/dashboard/map', icon: Map },
    { label: 'Profile', href: '/profile', icon: UserIcon },
  ];
}
