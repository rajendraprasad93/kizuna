import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory } from '@/types';

export function CitizenDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profile?.id) return;
      try {
        const [reps, cats] = await Promise.all([
          api.reports.list({ user_id: profile.id }),
          api.categories.list(),
        ]);
        setReports(reps || []);
        setCategories(cats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
    <DashboardShell title={t('dashboardTitle')} subtitle={t('dashboardSubtitle')}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">{t('hello')}, {profile?.full_name?.split(' ')[0]}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('trackReports')}</p>
          </div>
          <Link to="/report/new">
            <Button size="lg"><Plus className="h-5 w-5" /> {t('reportAProblem')}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label={t('totalReports')} value={stats.total} color="blue" />
          <StatCard icon={Clock} label={t('active')} value={stats.active} color="amber" />
          <StatCard icon={CheckCircle2} label={t('resolved')} value={stats.resolved} color="emerald" />
          <StatCard icon={AlertCircle} label={t('awaitingAI')} value={stats.pending} color="slate" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{t('recentReports')}</h3>
              <Link to="/dashboard/my-reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium">{t('viewAll')}</Link>
            </div>
            {loading ? (
              <Card className="p-8 text-center text-sm text-slate-400">{t('loading')}</Card>
            ) : recentReports.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">{t('noReportsYet')}</p>
                <Link to="/report/new"><Button><Plus className="h-4 w-4" /> {t('submitFirstReport')}</Button></Link>
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
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{report.title || t('untitledReport')}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.description || t('noDescription')}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {parseFloat(String(report.latitude)).toFixed(4)}, {parseFloat(String(report.longitude)).toFixed(4)}</span>
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

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">{t('mapView')}</h3>
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
