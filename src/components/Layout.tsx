import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, LogOut, Menu, X, Bell, LayoutDashboard, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashLink = profile
    ? profile.role === 'admin'
      ? '/admin/dashboard'
      : profile.role === 'department'
        ? '/department/dashboard'
        : '/dashboard'
    : '/login';

  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'AI Intelligence', href: '/#ai-intelligence' },
    { label: 'For Officials', href: '/#for-officials' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">CivicEye</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {profile ? (
              <>
                <Link to="/notifications" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative">
                  <Bell className="h-5 w-5" />
                </Link>
                <Link to={dashLink}>
                  <Button size="sm" variant="secondary">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              location.pathname !== '/login' && location.pathname !== '/register' && (
                <>
                  <Link to="/login"><Button size="sm" variant="ghost">Sign In</Button></Link>
                  <Link to="/register"><Button size="sm">Get Started</Button></Link>
                </>
              )
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {profile ? (
              <>
                <Link to={dashLink} onClick={() => setMobileOpen(false)}><Button size="sm" fullWidth variant="secondary">Dashboard</Button></Link>
                <Button size="sm" fullWidth variant="ghost" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}><Button size="sm" fullWidth variant="ghost">Sign In</Button></Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}><Button size="sm" fullWidth>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">CivicEye</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              An agentic AI-powered city problem intelligence system that goes beyond complaint reporting —
              understanding problems, discovering root causes, recommending interventions, and verifying solutions.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/#ai-intelligence" className="hover:text-white transition-colors">AI Intelligence</a></li>
              <li><a href="/#for-officials" className="hover:text-white transition-colors">For Officials</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Roles</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Users className="h-4 w-4" /> Citizens</li>
              <li className="flex items-center gap-2"><Shield className="h-4 w-4" /> Department Officials</li>
              <li className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Administrators</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-center">
          CivicEye — Agentic AI for Smarter Cities
        </div>
      </div>
    </footer>
  );
}
