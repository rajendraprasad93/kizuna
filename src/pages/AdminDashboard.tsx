import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Users, Building2, Brain, TrendingUp, CheckCircle2, Activity, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
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
    { label: 'Submitted', count: reports.filter((r) => r.status === 'submitted').length, color: 'bg-slate-400' },
    { label: 'Analyzing', count: reports.filter((r) => r.status === 'analyzing').length, color: 'bg-amber-400' },
    { label: 'Analyzed', count: reports.filter((r) => r.status === 'analyzed').length, color: 'bg-blue-400' },
    { label: 'Assigned', count: reports.filter((r) => r.status === 'assigned').length, color: 'bg-blue-500' },
    { label: 'In Progress', count: reports.filter((r) => r.status === 'in_progress').length, color: 'bg-orange-400' },
    { label: 'Resolved', count: reports.filter((r) => r.status === 'resolved').length, color: 'bg-emerald-500' },
  ];

  const recentReports = reports.slice(0, 5);
  const roleCounts = {
    citizens: users.filter((u) => u.role === 'citizen').length,
    officials: users.filter((u) => u.role === 'department').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  if (loading) {
    return <DashboardShell title={t('overview')}><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div></DashboardShell>;
  }

  return (
    <DashboardShell title={t('overview')} subtitle="System-wide analytics and metrics">
      <div className="space-y-6">
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
