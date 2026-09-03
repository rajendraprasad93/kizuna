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
    { icon: Network, label: t('relationshipDiscoveryStep'), color: 'from-purple-400 to-purple-500' },
    { icon: GitBranch, label: t('causeAnalysisStep'), color: 'from-pink-400 to-pink-500' },
    { icon: Target, label: t('actionRecommendationStep'), color: 'from-orange-400 to-orange-500' },
    { icon: Cpu, label: t('departmentRouting'), color: 'from-green-400 to-green-500' },
  ];

  return (
    <DashboardShell title="" subtitle="">
      <div className="space-y-8">
        {/* Hero Section with Japanese Greeting */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-8 lg:p-12">
          {/* Enhanced Japanese Cultural Background */}
          <div className="absolute inset-0">
            {/* Sakura petals floating animation */}
            <div className="absolute top-4 right-8 w-20 h-20 opacity-8 animate-float">
              <svg viewBox="0 0 100 100" className="w-full h-full text-pink-300">
                <path d="M50 10 L60 30 L80 25 L65 45 L85 60 L60 55 L50 75 L40 55 L15 60 L35 45 L20 25 L40 30 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="absolute bottom-8 right-20 w-16 h-16 opacity-8 animate-pulse">
              <svg viewBox="0 0 100 100" className="w-full h-full text-purple-300">
                <path d="M50 10 L60 30 L80 25 L65 45 L85 60 L60 55 L50 75 L40 55 L15 60 L35 45 L20 25 L40 30 Z" fill="currentColor" />
              </svg>
            </div>
            
            {/* Traditional Japanese Wave Pattern (Seigaiha) */}
            <div className="absolute top-0 left-0 w-full h-32 opacity-5">
              <svg viewBox="0 0 400 100" className="w-full h-full text-purple-400">
                <defs>
                  <pattern id="seigaiha" patternUnits="userSpaceOnUse" width="40" height="20">
                    <circle cx="20" cy="20" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="0" cy="20" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="40" cy="20" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="400" height="100" fill="url(#seigaiha)"/>
              </svg>
            </div>
            
            {/* Mount Fuji silhouette */}
            <div className="absolute bottom-0 right-4 w-32 h-20 opacity-6">
              <svg viewBox="0 0 120 60" className="w-full h-full text-purple-200">
                <path d="M0 60 L30 60 L60 20 L90 60 L120 60 L120 60 L0 60 Z" fill="currentColor"/>
                <path d="M45 35 L60 20 L75 35 L75 40 L45 40 Z" fill="white" opacity="0.3"/>
              </svg>
            </div>
            
            {/* Bamboo leaves on left */}
            <div className="absolute top-8 left-4 w-24 h-32 opacity-6">
              <svg viewBox="0 0 60 80" className="w-full h-full text-green-300">
                <path d="M10 10 Q15 5 25 10 Q30 15 25 25 Q20 30 10 25 Q5 20 10 10" fill="currentColor"/>
                <path d="M15 30 Q20 25 30 30 Q35 35 30 45 Q25 50 15 45 Q10 40 15 30" fill="currentColor"/>
                <path d="M20 50 Q25 45 35 50 Q40 55 35 65 Q30 70 20 65 Q15 60 20 50" fill="currentColor"/>
                <line x1="12" y1="15" x2="55" y2="75" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
              </svg>
            </div>
            
            {/* Torii gate silhouette */}
            <div className="absolute top-12 right-32 w-16 h-12 opacity-4">
              <svg viewBox="0 0 40 30" className="w-full h-full text-red-300">
                <rect x="8" y="0" width="2" height="30" fill="currentColor"/>
                <rect x="30" y="0" width="2" height="30" fill="currentColor"/>
                <rect x="2" y="6" width="36" height="3" rx="1" fill="currentColor"/>
                <rect x="4" y="12" width="32" height="2" fill="currentColor"/>
              </svg>
            </div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">👋</div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  {greeting}、<span className="text-purple-600">{profile?.full_name?.split(' ')[0]}</span> さん
                </h1>
              </div>
              <p className="text-slate-600 text-lg mb-6 flex items-center gap-2">
                🌸 {t('trackReports')}
              </p>
              <Link to="/report/new">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                  <Plus className="h-5 w-5" />
                  {t('reportAProblem')}
                </Button>
              </Link>
            </div>
            
            {/* Japanese calligraphy style decoration */}
            <div className="hidden lg:flex items-center justify-center w-32 h-32 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full text-purple-600">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M30 50 Q50 30 70 50 Q50 70 30 50" fill="currentColor" opacity="0.3"/>
                <text x="50" y="58" textAnchor="middle" fontSize="24" fill="currentColor" fontFamily="serif">絆</text>
              </svg>
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
        <Card className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-purple-50/30 border-purple-100 relative overflow-hidden">
          {/* Traditional Japanese cloud pattern */}
          <div className="absolute top-0 right-0 w-32 h-16 opacity-5">
            <svg viewBox="0 0 80 40" className="w-full h-full text-purple-300">
              <path d="M10 25 Q5 20 10 15 Q15 10 25 15 Q35 10 45 15 Q55 10 65 15 Q70 20 65 25 Q60 30 50 25 Q40 30 30 25 Q20 30 10 25" fill="currentColor"/>
            </svg>
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  {t('aiAnalysisInProgress')} <span className="text-sm">🧠</span>
                </h3>
                <p className="text-sm text-slate-500">5つのステップで問題を対処します</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {aiPipelineSteps.map((step, index) => (
                <div key={step.label} className="relative">
                  <div className="bg-white rounded-2xl p-4 border border-purple-100 hover:border-purple-200 transition-all group relative overflow-hidden">
                    {/* Subtle traditional pattern for each step */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 opacity-8">
                      <svg viewBox="0 0 20 20" className="w-full h-full text-purple-200">
                        {index === 0 && <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>}
                        {index === 1 && <polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="currentColor" strokeWidth="0.5"/>}
                        {index === 2 && <path d="M2 10 L10 2 L18 10 L10 18 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>}
                        {index === 3 && <rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="0.5"/>}
                        {index === 4 && <path d="M10 2 L18 6 L14 14 L6 14 L2 6 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>}
                      </svg>
                    </div>
                    
                    <div className="text-center relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-xs font-medium text-slate-600 mb-1 flex items-center justify-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 leading-tight">{step.label}</div>
                    </div>
                  </div>
                  {/* Enhanced connection line with traditional pattern */}
                  {index < aiPipelineSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 -translate-y-1/2 z-10">
                      <svg viewBox="0 0 16 2" className="w-full h-full">
                        <defs>
                          <pattern id="dashedLine" patternUnits="userSpaceOnUse" width="4" height="2">
                            <rect width="2" height="2" fill="#d8b4fe"/>
                            <rect x="2" width="2" height="2" fill="#f8bbd9"/>
                          </pattern>
                        </defs>
                        <rect width="16" height="2" fill="url(#dashedLine)"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
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

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 relative overflow-hidden">
              {/* Traditional Japanese pattern background */}
              <div className="absolute inset-0 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full text-purple-400">
                  {/* Shippo (Seven treasures) pattern */}
                  <defs>
                    <pattern id="shippo" patternUnits="userSpaceOnUse" width="25" height="25">
                      <circle cx="12.5" cy="12.5" r="12" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="25" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="0" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="25" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#shippo)"/>
                </svg>
              </div>
              
              {/* Lantern decoration */}
              <div className="absolute top-2 right-2 w-8 h-10 opacity-15">
                <svg viewBox="0 0 20 25" className="w-full h-full text-red-400">
                  <ellipse cx="10" cy="5" rx="8" ry="3" fill="currentColor"/>
                  <rect x="6" y="5" width="8" height="15" rx="4" fill="currentColor"/>
                  <rect x="8" y="8" width="4" height="8" fill="white" opacity="0.7"/>
                  <ellipse cx="10" cy="20" rx="8" ry="3" fill="currentColor"/>
                  <line x1="10" y1="2" x2="10" y2="5" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    AI Impact <span className="text-sm">🌟</span>
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  あなたの報告は都市の問題解決に貢献しています。各レポートがAIの学習を支援し、より良い推奨事項を生成します。
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/60 rounded-xl p-3 relative">
                    {/* Mini sakura decoration */}
                    <div className="absolute top-1 right-1 w-3 h-3 opacity-30">
                      <svg viewBox="0 0 10 10" className="w-full h-full text-pink-400">
                        <path d="M5 1 L6 3 L8 2.5 L6.5 4.5 L8.5 6 L6 5.5 L5 7.5 L4 5.5 L1.5 6 L3.5 4.5 L2 2.5 L4 3 Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="text-lg font-bold text-purple-600">{reports.length}</div>
                    <div className="text-xs text-slate-500">あなたの貢献</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 relative">
                    {/* Mini torii decoration */}
                    <div className="absolute top-1 right-1 w-3 h-2.5 opacity-30">
                      <svg viewBox="0 0 12 10" className="w-full h-full text-red-400">
                        <rect x="2" y="0" width="0.8" height="10" fill="currentColor"/>
                        <rect x="9.2" y="0" width="0.8" height="10" fill="currentColor"/>
                        <rect x="0" y="2" width="12" height="1" fill="currentColor"/>
                        <rect x="1" y="4" width="10" height="0.8" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="text-lg font-bold text-pink-600">94%</div>
                    <div className="text-xs text-slate-500">AI精度向上</div>
                  </div>
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
      border: 'border-blue-100',
      accent: 'text-blue-300'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100/50',
      icon: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      border: 'border-purple-100',
      accent: 'text-purple-300'
    },
    orange: {
      bg: 'from-orange-50 to-orange-100/50',
      icon: 'from-orange-500 to-orange-600',
      text: 'text-orange-600',
      border: 'border-orange-100',
      accent: 'text-orange-300'
    },
    green: {
      bg: 'from-emerald-50 to-emerald-100/50',
      icon: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      accent: 'text-emerald-300'
    },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  // Different Japanese cultural elements for each card
  const culturalElements = {
    blue: (
      <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
        <svg viewBox="0 0 40 40" className={`w-full h-full ${config.accent}`}>
          {/* Water ripples (mizu) */}
          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
    ),
    purple: (
      <div className="absolute top-2 right-2 w-10 h-8 opacity-20">
        <svg viewBox="0 0 40 32" className={`w-full h-full ${config.accent}`}>
          {/* Cherry blossom branch */}
          <path d="M5 20 Q20 10 35 20" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="15" cy="16" r="2" fill="currentColor"/>
          <circle cx="25" cy="16" r="2" fill="currentColor"/>
          <path d="M15 16 L13 14 L17 14 L15 18 L13 14" fill="currentColor" opacity="0.6"/>
          <path d="M25 16 L23 14 L27 14 L25 18 L23 14" fill="currentColor" opacity="0.6"/>
        </svg>
      </div>
    ),
    orange: (
      <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
        <svg viewBox="0 0 32 32" className={`w-full h-full ${config.accent}`}>
          {/* Traditional fan pattern */}
          <path d="M16 28 L8 16 L16 16 L24 16 Z" fill="currentColor"/>
          <path d="M16 16 L8 16" stroke="white" strokeWidth="0.5"/>
          <path d="M16 16 L12 16" stroke="white" strokeWidth="0.5"/>
          <path d="M16 16 L20 16" stroke="white" strokeWidth="0.5"/>
          <path d="M16 16 L24 16" stroke="white" strokeWidth="0.5"/>
        </svg>
      </div>
    ),
    green: (
      <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
        <svg viewBox="0 0 32 32" className={`w-full h-full ${config.accent}`}>
          {/* Bamboo pattern */}
          <rect x="14" y="4" width="4" height="24" fill="currentColor" rx="2"/>
          <rect x="12" y="10" width="8" height="1.5" fill="currentColor"/>
          <rect x="12" y="18" width="8" height="1.5" fill="currentColor"/>
          <path d="M10 8 Q12 6 14 8" stroke="currentColor" strokeWidth="1" fill="none"/>
          <path d="M18 8 Q20 6 22 8" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
      </div>
    ),
  };

  return (
    <Card className={`relative p-6 bg-gradient-to-br ${config.bg} border ${config.border} hover:shadow-lg transition-all overflow-hidden group`}>
      {/* Cultural decoration in background */}
      <div className="absolute bottom-0 left-0 w-full h-full opacity-5">
        <svg viewBox="0 0 100 100" className={`w-full h-full ${config.accent}`}>
          {/* Asanoha (hemp leaf) pattern */}
          <defs>
            <pattern id={`asanoha-${color}`} patternUnits="userSpaceOnUse" width="20" height="20">
              <polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <polygon points="10,10 14,6 18,10 14,14 10,10" fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#asanoha-${color})`}/>
        </svg>
      </div>

      {/* Main content */}
      <div className="relative">
        {culturalElements[color as keyof typeof culturalElements] || culturalElements.blue}
        
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.icon} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        <div className="text-3xl font-bold text-slate-900 mb-1 flex items-end gap-1">
          {value}
          <span className="text-lg opacity-60">件</span>
        </div>
        
        <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          {color === 'purple' && <span>🔮</span>}
          {color === 'blue' && <span>📊</span>}
          {color === 'orange' && <span>⚡</span>}
          {color === 'green' && <span>✅</span>}
          {subtext}
        </div>
      </div>
    </Card>
  );
}
