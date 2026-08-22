import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, ArrowRight, Users, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/types';

const ROLES: { value: UserRole; label: string; icon: typeof Users; desc: string }[] = [
  { value: 'citizen', label: 'Citizen', icon: Users, desc: 'Report problems and track resolution' },
  { value: 'department', label: 'Official', icon: Shield, desc: 'Manage and resolve assigned cases' },
  { value: 'admin', label: 'Admin', icon: LayoutDashboard, desc: 'Oversee the entire platform' },
];

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">CivicEye</span>
          </Link>
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight text-balance">Join the platform that makes cities smarter.</h1>
            <p className="mt-4 text-slate-300 text-lg">Report problems, get AI-powered analysis, and track resolutions in real time.</p>
          </div>
          <div className="text-sm text-slate-400">Agentic AI for Smarter Cities</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900">CivicEye</span>
            </Link>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">Choose your role and get started</p>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-slate-700">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${role === r.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <r.icon className={`h-5 w-5 mx-auto mb-1.5 ${role === r.value ? 'text-brand-600' : 'text-slate-400'}`} />
                  <div className={`text-xs font-semibold ${role === r.value ? 'text-brand-700' : 'text-slate-600'}`}>{r.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">{ROLES.find((r) => r.value === role)?.desc}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              icon={<Lock className="h-4 w-4" />}
            />
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
