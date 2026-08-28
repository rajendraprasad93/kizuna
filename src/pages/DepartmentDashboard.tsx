import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Clock, CheckCircle2, AlertCircle, Brain, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory, Department, AiAnalysis } from '@/types';

export function DepartmentDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, AiAnalysis>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reps, cats, depts] = await Promise.all([
          api.reports.list({ limit: 50 }),
          api.categories.list(),
          api.departments.list(),
        ]);
        setReports(reps || []);
        setCategories(cats || []);
        setDepartments(depts || []);

        // Build analyses map from report ai_analysis field if available
        const aiMap: Record<string, AiAnalysis> = {};
        (reps || []).forEach((r) => {
          if ((r as any).ai_analysis) {
            aiMap[r.id] = (r as any).ai_analysis as AiAnalysis;
          }
        });
        setAnalyses(aiMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const myDept = departments.find((d) => d.id === profile?.department_id);
  const deptReports = myDept ? reports.filter((r) => r.department_id === myDept.id) : reports;

  const stats = {
    total: deptReports.length,
    active: deptReports.filter((r) => ['assigned', 'in_progress', 'analyzed'].includes(r.status)).length,
    resolved: deptReports.filter((r) => r.status === 'resolved').length,
    highPriority: deptReports.filter((r) => r.priority <= 2).length,
  };

  const sortedByPriority = [...deptReports].sort((a, b) => a.priority - b.priority);
  const topCases = sortedByPriority.slice(0, 6);

  return (
    <DashboardShell title={t('dashboardTitle')} subtitle={myDept ? myDept.name : 'All departments'}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label={t('totalReports')} value={stats.total} color="blue" />
          <StatCard icon={Clock} label={t('active')} value={stats.active} color="amber" />
          <StatCard icon={CheckCircle2} label={t('resolved')} value={stats.resolved} color="emerald" />
          <StatCard icon={AlertCircle} label={t('highPriority')} value={stats.highPriority} color="red" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{t('topCases')}</h3>
              <Link to="/department/reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium">{t('viewAll')}</Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
            ) : topCases.length === 0 ? (
              <Card className="p-8 text-center text-sm text-slate-400">{t('noCases')}</Card>
            ) : (
              <div className="space-y-3">
                {topCases.map((report) => {
                  const ai = analyses[report.id];
                  return (
                    <Link key={report.id} to={`/reports/${report.id}`}>
                      <Card hover className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <StatusBadge status={report.status} />
                              {report.category && <Badge color={report.category.color as 'blue' | 'amber' | 'green'}>{report.category.display_name.split(' / ')[0]}</Badge>}
                              <Badge color={report.priority <= 1 ? 'red' : report.priority <= 2 ? 'amber' : 'slate'}>P{report.priority}</Badge>
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm truncate">{report.title || 'Untitled'}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.description || 'No description'}</p>
                            {ai && (
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <Brain className="h-3 w-3 text-brand-500" />
                                <span className="text-slate-600 capitalize">{ai.final_problem_type}</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600">{Math.round((ai.final_confidence || 0) * 100)}% confidence</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600">{ai.related_incident_count} related</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Cases Map</h3>
            <MapView reports={deptReports} categories={categories} height="280px" />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-semibold text-slate-900">AI Insights</span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between"><span>Analyzed cases</span><span className="font-medium text-slate-700">{Object.keys(analyses).length}</span></div>
                <div className="flex justify-between"><span>Avg confidence</span><span className="font-medium text-slate-700">
                  {Object.values(analyses).length > 0
                    ? Math.round(Object.values(analyses).reduce((sum, a) => sum + (a.final_confidence || 0), 0) / Object.values(analyses).length * 100) + '%'
                    : '—'}
                </span></div>
                <div className="flex justify-between"><span>Related incidents</span><span className="font-medium text-slate-700">
                  {Object.values(analyses).reduce((sum, a) => sum + a.related_incident_count, 0)}
                </span></div>
              </div>
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
    red: 'text-red-600 bg-red-50',
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
