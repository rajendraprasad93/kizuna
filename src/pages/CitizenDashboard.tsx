import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, TrendingUp, MapPin, Brain, Eye, GitBranch, Target, Network, Cpu } from 'lucide-react';
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
    processing: reports.filter((r) => ['analyzing'].includes(r.status)).length,
  };

  const recentReports = reports.slice(0, 5);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? t('goodMorning') : currentHour < 18 ? 'こんにちは' : 'こんばんは';

  const aiPipelineSteps = [
    { icon: FileText, label: t('duplicateCheck'), color: 'from-blue-400 to-blue-500' },
    { icon: Network, label: t('relationshipDiscovery'), color: 'from-purple-400 to-purple-500' },
    { icon: GitBranch, label: t('causeAnalysis'), color: 'from-pink-400 to-pink-500' },
    { icon: Target, label: t('actionRecommendation'), color: 'from-orange-400 to-orange-500' },
    { icon: Cpu, label: t('departmentRouting'), color: 'from-green-400 to-green-500' },
  ];

  return (
    <DashboardShell title="" subtitle="">
      <div className="space-y-8">
        {/* Hero Section with Japanese Greeting */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-8 lg:p-12">
          {/* Sakura Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full text-pink-300">
                <path d="M50 10 L60 30 L80 25 L65 45 L85 60 L60 55 L50 75 L40 55 L15 60 L35 45 L20 25 L40 30 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-8 right-20 w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full text-purple-300">
                <path d="M50 10 L60 30 L80 25 L65 45 L85 60 L60 55 L50 75 L40 55 L15 60 L35 45 L20 25 L40 30 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">👋</div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  {greeting}、<span className="text-purple-600">{profile?.full_name?.split(' ')[0]}</span> さん
                </h1>
              </div>
              <p className="text-slate-600 text-lg mb-6">{t('trackReports')}</p>
              <Link to="/report/new">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                  <Plus className="h-5 w-5" />
                  {t('reportAProblem')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KizunaStatCard
            icon={FileText}
            label={t('totalReports')}
            value={stats.total}
            subtext="これまでの合計"
            color="blue"
          />
          <KizunaStatCard
            icon={Cpu}
            label={t('processing')}
            value={stats.processing}
            subtext="AI分析中"
            color="purple"
          />
          <KizunaStatCard
            icon={Clock}
            label={t('active')}
            value={stats.active}
            subtext="対応中"
            color="orange"
          />
          <KizunaStatCard
            icon={CheckCircle2}
            label={t('resolved')}
            value={stats.resolved}
            subtext="解決済み"
            color="green"
          />
        </div>

        {/* AI Analysis Pipeline */}
        <Card className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-purple-50/30 border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{t('aiAnalysisInProgress')}</h3>
              <p className="text-sm text-slate-500">5つのステップで問題を対処します</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {aiPipelineSteps.map((step, index) => (
              <div key={step.label} className="relative">
                <div className="bg-white rounded-2xl p-4 border border-purple-100 hover:border-purple-200 transition-all group">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-1">{index + 1}</div>
                    <div className="text-sm font-semibold text-slate-900 leading-tight">{step.label}</div>
                  </div>
                </div>
                {/* Connection Line */}
                {index < aiPipelineSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 -translate-y-1/2 z-10" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Reports and Map Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Reports */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">{t('recentReports')}</h3>
              <Link to="/dashboard/my-reports" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                {t('viewAll')}
              </Link>
            </div>
            
            {loading ? (
              <Card className="p-8 text-center text-sm text-slate-400">{t('loading')}</Card>
            ) : recentReports.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <FileText className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">{t('noReportsYet')}</p>
                <p className="text-sm text-slate-500 mb-6">{t('beFirstReport')}</p>
                <Link to="/report/new">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Plus className="h-4 w-4" />
                    {t('submitFirstReport')}
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <Link key={report.id} to={`/reports/${report.id}`}>
                    <Card hover className="p-5 border-purple-100 hover:border-purple-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={report.status} />
                            {report.category && (
                              <Badge color={report.category.color as 'blue' | 'amber' | 'green'}>
                                {report.category.display_name.split(' / ')[0]}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-slate-900 text-base mb-1">
                            {report.title || t('untitledReport')}
                          </h4>
                          <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                            {report.description || t('noDescription')}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {parseFloat(String(report.latitude)).toFixed(4)}, {parseFloat(String(report.longitude)).toFixed(4)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {report.image_urls && report.image_urls.length > 0 && (
                          <img
                            src={report.image_urls[0]}
                            alt=""
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                          />
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Map and Area Status */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">{t('areaStatus')}</h3>
              <Card className="overflow-hidden border-purple-100">
                <MapView
                  reports={reports}
                  categories={categories}
                  height="300px"
                  centerLat={reports[0]?.latitude || 13.0827}
                  centerLng={reports[0]?.longitude || 80.2707}
                />
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-base font-semibold text-slate-900">AI Impact</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                あなたの報告は都市の問題解決に貢献しています。各レポートがAIの学習を支援し、より良い推奨事項を生成します。
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-purple-600">{reports.length}</div>
                  <div className="text-xs text-slate-500">あなたの貢献</div>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-pink-600">94%</div>
                  <div className="text-xs text-slate-500">AI精度向上</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function KizunaStatCard({ icon: Icon, label, value, subtext, color }: { 
  icon: typeof FileText; 
  label: string; 
  value: number; 
  subtext: string;
  color: string;
}) {
  const colorConfig = {
    blue: {
      bg: 'from-blue-50 to-blue-100/50',
      icon: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100/50',
      icon: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      border: 'border-purple-100'
    },
    orange: {
      bg: 'from-orange-50 to-orange-100/50',
      icon: 'from-orange-500 to-orange-600',
      text: 'text-orange-600',
      border: 'border-orange-100'
    },
    green: {
      bg: 'from-emerald-50 to-emerald-100/50',
      icon: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  return (
    <Card className={`p-6 bg-gradient-to-br ${config.bg} border ${config.border} hover:shadow-lg transition-all`}>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.icon} flex items-center justify-center mb-4 shadow-sm`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
      <div className="text-xs text-slate-500">{subtext}</div>
    </Card>
  );
}
