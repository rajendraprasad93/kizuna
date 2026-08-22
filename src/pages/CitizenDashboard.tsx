import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory } from '@/types';

export function CitizenDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [repRes, catRes] = await Promise.all([
        supabase.from('reports').select('*, category:problem_categories(*)').eq('user_id', profile?.id).order('created_at', { ascending: false }),
        supabase.from('problem_categories').select('*').eq('is_active', true),
      ]);
      setReports((repRes.data as unknown as Report[]) || []);
      setCategories((catRes.data as ProblemCategory[]) || []);
      setLoading(false);
    }
    if (profile?.id) loadData();
  }, [profile?.id]);

  const stats = {
    total: reports.length,
    active: reports.filter((r) => ['submitted', 'analyzing', 'analyzed', 'assigned', 'in_progress'].includes(r.status)).length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    pending: reports.filter((r) => ['submitted', 'analyzing', 'analyzed'].includes(r.status)).length,
  };

  const recentReports = reports.slice(0, 5);

  return (
    <DashboardShell title="Dashboard" subtitle="Your problem reports at a glance">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Hello, {profile?.full_name?.split(' ')[0]}</h2>
            <p className="text-sm text-slate-500 mt-1">Track your reports and see AI insights in real time.</p>
          </div>
          <Link to="/report/new">
            <Button size="lg"><Plus className="h-5 w-5" /> Report a Problem</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Reports" value={stats.total} color="blue" />
          <StatCard icon={Clock} label="Active" value={stats.active} color="amber" />
          <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} color="emerald" />
          <StatCard icon={AlertCircle} label="Awaiting AI" value={stats.pending} color="slate" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent reports */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Reports</h3>
              <Link to="/dashboard/my-reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
            </div>
            {loading ? (
              <Card className="p-8 text-center text-sm text-slate-400">Loading...</Card>
            ) : recentReports.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">You haven't reported any problems yet.</p>
                <Link to="/report/new"><Button><Plus className="h-4 w-4" /> Create your first report</Button></Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <Link key={report.id} to={`/reports/${report.id}`}>
                    <Card hover className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={report.status} />
                            {report.category && (
                              <Badge color={report.category.color as 'blue' | 'amber' | 'green'}>
                                {report.category.display_name.split(' / ')[0]}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{report.title || 'Untitled report'}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.description || 'No description'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {report.image_urls && report.image_urls.length > 0 && (
                          <img src={report.image_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Your Reports Map</h3>
            <MapView reports={reports} categories={categories} height="300px" centerLat={reports[0]?.latitude || 13.0827} centerLng={reports[0]?.longitude || 80.2707} />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-900">AI Impact</span>
              </div>
              <p className="text-xs text-slate-500">
                Your reports contribute to the city's problem intelligence. Each report helps the AI learn patterns and improve recommendations.
              </p>
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
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    slate: 'text-slate-600 bg-slate-100',
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
