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
        {/* Hero Section with Japanese Greeting - Enhanced */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100/80 via-purple-50/60 to-blue-50/40 p-8 lg:p-12 border border-white/50 shadow-lg">
          {/* Enhanced Japanese Cultural Background */}
          <div className="absolute inset-0">
            {/* Beautiful cherry blossom tree branch */}
            <div className="absolute top-0 right-0 w-80 h-40 opacity-15">
              <svg viewBox="0 0 200 100" className="w-full h-full text-pink-400">
                <path d="M20 80 Q60 40 100 50 Q140 60 180 30" stroke="currentColor" strokeWidth="3" fill="none"/>
                <path d="M40 70 Q50 60 60 65" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M80 55 Q90 45 100 50" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M120 65 Q130 55 140 60" stroke="currentColor" strokeWidth="2" fill="none"/>
                
                {/* Cherry blossoms */}
                <g fill="currentColor" opacity="0.8">
                  <circle cx="45" cy="65" r="4"/>
                  <circle cx="52" cy="62" r="3"/>
                  <circle cx="38" cy="68" r="3"/>
                  <circle cx="85" cy="52" r="4"/>
                  <circle cx="92" cy="48" r="3"/>
                  <circle cx="78" cy="55" r="3"/>
                  <circle cx="125" cy="62" r="4"/>
                  <circle cx="132" cy="58" r="3"/>
                  <circle cx="118" cy="65" r="3"/>
                </g>
              </svg>
            </div>
            
            {/* Mount Fuji silhouette - more prominent */}
            <div className="absolute bottom-0 right-8 w-48 h-32 opacity-8">
              <svg viewBox="0 0 150 80" className="w-full h-full text-purple-300">
                <path d="M0 80 L40 80 L75 25 L110 80 L150 80 L150 80 L0 80 Z" fill="currentColor"/>
                <path d="M60 45 L75 25 L90 45 L90 52 L60 52 Z" fill="white" opacity="0.4"/>
                <path d="M68 50 L75 40 L82 50 L82 52 L68 52 Z" fill="white" opacity="0.6"/>
              </svg>
            </div>
            
            {/* Traditional Japanese clouds */}
            <div className="absolute top-4 left-1/3 w-32 h-16 opacity-8">
              <svg viewBox="0 0 80 40" className="w-full h-full text-blue-300">
                <path d="M10 25 Q5 20 10 15 Q15 10 25 15 Q35 10 45 15 Q55 10 65 15 Q70 20 65 25 Q60 30 50 25 Q40 30 30 25 Q20 30 10 25" fill="currentColor"/>
              </svg>
            </div>
            
            {/* Torii gate - more detailed */}
            <div className="absolute top-8 right-16 w-20 h-16 opacity-6">
              <svg viewBox="0 0 50 40" className="w-full h-full text-red-400">
                <rect x="12" y="0" width="3" height="40" fill="currentColor"/>
                <rect x="35" y="0" width="3" height="40" fill="currentColor"/>
                <rect x="2" y="8" width="46" height="4" rx="2" fill="currentColor"/>
                <rect x="6" y="16" width="38" height="3" fill="currentColor"/>
              </svg>
            </div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">👋</div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  {greeting}、<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0]}</span> さん
                </h1>
              </div>
              <p className="text-slate-600 text-xl mb-8 flex items-center gap-3 leading-relaxed">
                <span className="text-2xl">🌸</span>
                <span>報告状況とAI分析をリアルタイムで確認できます。</span>
              </p>
              <Link to="/report/new">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl text-lg px-8 py-4 rounded-2xl font-semibold">
                  <Plus className="h-6 w-6" />
                  問題を報告する
                </Button>
              </Link>
            </div>
            
            {/* Japanese zen circle with kizuna character */}
            <div className="hidden lg:flex items-center justify-center w-40 h-40 opacity-15">
              <svg viewBox="0 0 120 120" className="w-full h-full text-purple-600">
                <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                <text x="60" y="75" textAnchor="middle" fontSize="36" fill="currentColor" fontFamily="serif" fontWeight="bold">絆</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Enhanced to match inspiration */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <KizunaStatCard
            icon={FileText}
            label="総報告数"
            value={stats.total}
            subtext="これまでの合計"
            color="blue"
            bgColor="bg-blue-50/80"
            iconColor="bg-blue-500"
          />
          <KizunaStatCard
            icon={Cpu}
            label="処理中"
            value={stats.processing}
            subtext="AI分析中"
            color="purple"
            bgColor="bg-purple-50/80"
            iconColor="bg-purple-500"
          />
          <KizunaStatCard
            icon={Clock}
            label="対応中"
            value={stats.active}
            subtext="対応中"
            color="orange"
            bgColor="bg-orange-50/80"
            iconColor="bg-orange-500"
          />
          <KizunaStatCard
            icon={CheckCircle2}
            label="解決済み"
            value={stats.resolved}
            subtext="解決済み"
            color="green"
            bgColor="bg-emerald-50/80"
            iconColor="bg-emerald-500"
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

function KizunaStatCard({ icon: Icon, label, value, subtext, color, bgColor, iconColor }: { 
  icon: typeof FileText; 
  label: string; 
  value: number; 
  subtext: string;
  color: string;
  bgColor: string;
  iconColor: string;
}) {
  const colorConfig = {
    blue: {
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
      accent: 'text-blue-400',
      dot: 'bg-blue-400'
    },
    purple: {
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      accent: 'text-purple-400',
      dot: 'bg-purple-400'
    },
    orange: {
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-500',
      accent: 'text-orange-400',
      dot: 'bg-orange-400'
    },
    green: {
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
      accent: 'text-emerald-400',
      dot: 'bg-emerald-400'
    },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  return (
    <div className={`relative ${bgColor} rounded-3xl p-8 border border-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 100 100" className={`w-full h-full ${config.accent}`}>
          <defs>
            <pattern id={`pattern-${color}`} patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#pattern-${color})`}/>
        </svg>
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        
        {/* Value and unit */}
        <div className="mb-4">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">{value}</span>
            <span className="text-lg font-medium text-slate-500 mb-1">件</span>
          </div>
        </div>
        
        {/* Label */}
        <div className="mb-3">
          <h3 className={`text-lg font-semibold ${config.textColor}`}>{label}</h3>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
          <span className="text-sm font-medium text-slate-600">{subtext}</span>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
    </div>
  );
}
