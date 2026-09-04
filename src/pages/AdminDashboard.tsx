import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Users, Building2, Brain, TrendingUp, CheckCircle2, Activity, BarChart3, Crown, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory, Profile, Department, AiAnalysis } from '@/types';

export function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [analyses, setAnalyses] = useState<AiAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { profile } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const [reps, cats, usrs, depts] = await Promise.all([
          api.reports.list({ limit: 100 }),
          api.categories.list(),
          api.admin.getUsers(),
          api.departments.list(),
        ]);
        setReports(reps || []);
        setCategories(cats || []);
        setUsers(usrs || []);
        setDepartments(depts || []);

        // Extract AI analyses from reports
        const aiList: AiAnalysis[] = [];
        (reps || []).forEach((r) => {
          if ((r as any).ai_analysis) aiList.push((r as any).ai_analysis as AiAnalysis);
        });
        setAnalyses(aiList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = {
    totalReports: reports.length,
    totalUsers: users.length,
    totalDepartments: departments.length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    active: reports.filter((r) => !['resolved', 'closed', 'rejected'].includes(r.status)).length,
    analyzed: analyses.length,
  };

  const resolutionRate = stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : 0;
  const avgConfidence = analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + (a.final_confidence || 0), 0) / analyses.length * 100) : 0;

  const byCategory = categories.map((cat) => ({
    name: cat.display_name.split(' / ')[0],
    color: cat.color,
    count: reports.filter((r) => r.category_id === cat.id).length,
  }));

  const byStatus = [
    { label: '提出済み', count: reports.filter((r) => r.status === 'submitted').length, color: 'bg-slate-400' },
    { label: '分析中', count: reports.filter((r) => r.status === 'analyzing').length, color: 'bg-amber-400' },
    { label: '分析済み', count: reports.filter((r) => r.status === 'analyzed').length, color: 'bg-blue-400' },
    { label: '割当済み', count: reports.filter((r) => r.status === 'assigned').length, color: 'bg-blue-500' },
    { label: '対応中', count: reports.filter((r) => r.status === 'in_progress').length, color: 'bg-orange-400' },
    { label: '解決済み', count: reports.filter((r) => r.status === 'resolved').length, color: 'bg-emerald-500' },
  ];

  const recentReports = reports.slice(0, 5);
  const roleCounts = {
    citizens: users.filter((u) => u.role === 'citizen').length,
    officials: users.filter((u) => u.role === 'department').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'おはようございます' : currentHour < 18 ? 'こんにちは' : 'こんばんは';

  if (loading) {
    return (
      <DashboardShell title="">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="" subtitle="">
      {/* Falling Purple Autumn Flowers Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${12 + Math.random() * 6}s`,
              animationIterationCount: 'infinite',
              animationName: 'fallAndSway',
              animationTimingFunction: 'ease-in-out'
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className="text-purple-300 opacity-70"
              style={{
                transform: `rotate(${Math.random() * 360}deg)`,
                filter: 'drop-shadow(0 2px 4px rgba(147, 51, 234, 0.3))',
                animation: `gentleSway ${4 + Math.random() * 2}s ease-in-out infinite alternate`
              }}
            >
              {/* Beautiful purple autumn flower (sakura-style) */}
              <g fill="currentColor">
                {/* 5 petals arranged in a circle */}
                <ellipse cx="12" cy="7" rx="3.5" ry="7" opacity="0.9" transform="rotate(0 12 12)"/>
                <ellipse cx="12" cy="7" rx="3.5" ry="7" opacity="0.8" transform="rotate(72 12 12)"/>
                <ellipse cx="12" cy="7" rx="3.5" ry="7" opacity="0.95" transform="rotate(144 12 12)"/>
                <ellipse cx="12" cy="7" rx="3.5" ry="7" opacity="0.75" transform="rotate(216 12 12)"/>
                <ellipse cx="12" cy="7" rx="3.5" ry="7" opacity="0.85" transform="rotate(288 12 12)"/>
                
                {/* Flower center with gradient effect */}
                <circle cx="12" cy="12" r="2.5" fill="#fbbf24" opacity="0.9"/>
                <circle cx="12" cy="12" r="1.5" fill="#f59e0b" opacity="0.8"/>
                <circle cx="12" cy="12" r="0.8" fill="#d97706" opacity="0.9"/>
                
                {/* Small highlight for realism */}
                <circle cx="11.5" cy="11.5" r="0.4" fill="white" opacity="0.6"/>
              </g>
            </svg>
          </div>
        ))}
        
        {/* Additional smaller petals for depth */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`petal-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 8}s`,
              animationIterationCount: 'infinite',
              animationName: 'fallAndSway',
              animationTimingFunction: 'ease-in-out'
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              className="text-pink-300 opacity-50"
              style={{
                transform: `rotate(${Math.random() * 360}deg)`,
                filter: 'drop-shadow(0 1px 2px rgba(219, 39, 119, 0.2))',
                animation: `petalRotate ${8 + Math.random() * 4}s linear infinite`
              }}
            >
              {/* Single falling petal */}
              <ellipse cx="8" cy="8" rx="2" ry="6" fill="currentColor" opacity="0.8"/>
              <ellipse cx="8" cy="8" rx="1" ry="4" fill="#ec4899" opacity="0.6"/>
            </svg>
          </div>
        ))}
      </div>

      <div className="relative z-10 space-y-8">
        {/* Enhanced Admin Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100/80 via-purple-50/60 to-indigo-50/40 p-8 lg:p-12 border border-white/50 shadow-lg">
          {/* Japanese Cultural Background for Admin */}
          <div className="absolute inset-0">
            {/* Imperial castle silhouette */}
            <div className="absolute top-0 right-0 w-80 h-40 opacity-8">
              <svg viewBox="0 0 240 100" className="w-full h-full text-violet-400">
                {/* Main castle structure */}
                <rect x="60" y="40" width="120" height="60" fill="currentColor"/>
                <polygon points="60,40 120,15 180,40" fill="currentColor"/>
                
                {/* Castle towers */}
                <rect x="40" y="50" width="20" height="50" fill="currentColor"/>
                <rect x="180" y="50" width="20" height="50" fill="currentColor"/>
                <polygon points="40,50 50,35 60,50" fill="currentColor"/>
                <polygon points="180,50 190,35 200,50" fill="currentColor"/>
                
                {/* Central tower */}
                <rect x="110" y="20" width="20" height="80" fill="currentColor"/>
                <polygon points="110,20 120,5 130,20" fill="currentColor"/>
                
                {/* Windows and details */}
                <rect x="70" y="55" width="6" height="8" fill="white" opacity="0.7"/>
                <rect x="85" y="55" width="6" height="8" fill="white" opacity="0.8"/>
                <rect x="100" y="55" width="6" height="8" fill="white" opacity="0.6"/>
                <rect x="115" y="35" width="4" height="6" fill="white" opacity="0.9"/>
              </svg>
            </div>
            
            {/* Traditional Japanese imperial pattern */}
            <div className="absolute bottom-0 left-8 w-48 h-24 opacity-6">
              <svg viewBox="0 0 150 75" className="w-full h-full text-indigo-300">
                {/* Chrysanthemum imperial symbol pattern */}
                <g transform="translate(75, 37.5)">
                  <circle r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8"/>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <path key={i} d="M0,0 L0,-18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" transform={`rotate(${i * 22.5})`}/>
                  ))}
                  <circle r="8" fill="currentColor" opacity="0.4"/>
                </g>
              </svg>
            </div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">👑</div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  {greeting}、<span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0]}</span> 様
                </h1>
              </div>
              <p className="text-slate-600 text-xl mb-4 flex items-center gap-3 leading-relaxed">
                <Crown className="h-6 w-6 text-violet-500" />
                <span className="font-semibold text-violet-700">システム管理者</span>
              </p>
              <p className="text-slate-600 text-lg mb-8 flex items-center gap-3 leading-relaxed">
                <span className="text-2xl">🌸</span>
                <span>全システムの状況とAI分析を統括管理できます。</span>
              </p>
            </div>
            
            {/* Admin imperial circle with crown */}
            <div className="hidden lg:flex items-center justify-center w-40 h-40 opacity-15">
              <svg viewBox="0 0 120 120" className="w-full h-full text-violet-600">
                <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                <Crown className="absolute inset-0 w-12 h-12 text-current" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}/>
              </svg>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label={t('totalReports')} value={stats.totalReports} color="blue" />
          <StatCard icon={Users} label={t('totalUsers')} value={stats.totalUsers} color="emerald" />
          <StatCard icon={CheckCircle2} label={t('resolved')} value={stats.resolved} color="emerald" />
          <StatCard icon={Brain} label={t('aiAnalyzed')} value={stats.analyzed} color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resolution rate + AI confidence */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">{t('resolutionRate')}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{resolutionRate}%</div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${resolutionRate}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-2">{stats.resolved} of {stats.totalReports} resolved</div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-semibold text-slate-900">{t('avgConfidence')}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{avgConfidence}%</div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${avgConfidence}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-2">Across {stats.analyzed} analyses</div>
              </Card>
            </div>

            {/* By category */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" /> {t('reportsByCategory')}
              </h3>
              <div className="space-y-3">
                {byCategory.map((cat) => {
                  const max = Math.max(...byCategory.map((c) => c.count), 1);
                  const pct = (cat.count / max) * 100;
                  const colors: Record<string, string> = { blue: 'bg-blue-500', amber: 'bg-amber-500', green: 'bg-emerald-500' };
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{cat.name}</span>
                        <span className="text-slate-500">{cat.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${colors[cat.color] || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* By status */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" /> Reports by Status
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {byStatus.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1.5 ${s.color}`} />
                    <div className="text-lg font-bold text-slate-900">{s.count}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent reports */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">{t('recentReports')}</h3>
                <Link to="/admin/reports" className="text-xs text-brand-600 font-medium">{t('viewAll')}</Link>
              </div>
              <div className="space-y-2">
                {recentReports.map((r) => (
                  <Link key={r.id} to={`/reports/${r.id}`}>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusBadge status={r.status} />
                        <span className="text-sm text-slate-700 truncate">{r.title || 'Untitled'}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
                {recentReports.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No reports yet.</p>}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" /> User Breakdown
              </h3>
              <div className="space-y-3">
                <UserRow label="Citizens" count={roleCounts.citizens} total={stats.totalUsers} color="bg-blue-500" />
                <UserRow label="Officials" count={roleCounts.officials} total={stats.totalUsers} color="bg-emerald-500" />
                <UserRow label="Admins" count={roleCounts.admins} total={stats.totalUsers} color="bg-purple-500" />
              </div>
              <Link to="/admin/users" className="block mt-4 text-xs text-brand-600 font-medium">Manage users →</Link>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" /> Departments
              </h3>
              <div className="space-y-2">
                {departments.map((dept) => {
                  const count = reports.filter((r) => r.department_id === dept.id).length;
                  return (
                    <div key={dept.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{dept.name}</span>
                      <Badge color="slate">{count}</Badge>
                    </div>
                  );
                })}
              </div>
              <Link to="/admin/departments" className="block mt-4 text-xs text-brand-600 font-medium">Manage departments →</Link>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">System Map</h3>
              <MapView reports={reports.slice(0, 50)} categories={categories} height="200px" />
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  };
  return (
    <Card className="p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </Card>
  );
}

function UserRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{count} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
