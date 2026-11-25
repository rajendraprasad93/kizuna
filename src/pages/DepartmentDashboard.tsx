import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Clock, CheckCircle2, AlertCircle, Brain, TrendingUp, MapPin, Users, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, convertNameToJapanese } from '@/context/LanguageContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { MapView } from '@/components/MapView';
import type { Report, ProblemCategory, Department, AiAnalysis } from '@/types';
import { resolveImageSrc } from '@/lib/imageUtils';

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

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'おはようございます' : currentHour < 18 ? 'こんにちは' : 'こんばんは';

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
        {/* Enhanced Department Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100/80 via-purple-50/60 to-blue-50/40 p-8 lg:p-12 border border-white/50 shadow-lg">
          {/* Japanese Cultural Background */}
          <div className="absolute inset-0">
            {/* Department building silhouette */}
            <div className="absolute top-0 right-0 w-64 h-32 opacity-10">
              <svg viewBox="0 0 200 80" className="w-full h-full text-indigo-400">
                <rect x="20" y="20" width="40" height="60" fill="currentColor"/>
                <rect x="70" y="10" width="35" height="70" fill="currentColor"/>
                <rect x="115" y="15" width="30" height="65" fill="currentColor"/>
                <rect x="155" y="25" width="25" height="55" fill="currentColor"/>
                
                {/* Building windows */}
                <rect x="25" y="25" width="4" height="6" fill="white" opacity="0.7"/>
                <rect x="32" y="25" width="4" height="6" fill="white" opacity="0.8"/>
                <rect x="40" y="25" width="4" height="6" fill="white" opacity="0.6"/>
                <rect x="25" y="35" width="4" height="6" fill="white" opacity="0.9"/>
                <rect x="32" y="35" width="4" height="6" fill="white" opacity="0.7"/>
                <rect x="40" y="35" width="4" height="6" fill="white" opacity="0.8"/>
              </svg>
            </div>
            
            {/* Traditional Japanese wave pattern */}
            <div className="absolute bottom-0 left-8 w-40 h-20 opacity-8">
              <svg viewBox="0 0 120 60" className="w-full h-full text-blue-300">
                <path d="M0 30 Q20 20 40 30 Q60 40 80 30 Q100 20 120 30 L120 60 L0 60 Z" fill="currentColor"/>
                <path d="M10 40 Q30 30 50 40 Q70 50 90 40 Q110 30 120 40 L120 60 L10 60 Z" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🏢</div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  {greeting}、<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {convertNameToJapanese(profile?.full_name?.split(' ')[0] || '')}
                  </span>さん
                </h1>
              </div>
              <p className="text-slate-600 text-xl mb-4 flex items-center gap-3 leading-relaxed">
                <Building2 className="h-6 w-6 text-indigo-500" />
                <span className="font-semibold text-indigo-700">{myDept ? myDept.name : '全部門'}</span>
              </p>
              <p className="text-slate-600 text-lg mb-8 flex items-center gap-3 leading-relaxed">
                <span className="text-2xl">🌸</span>
                <span>部門のケース管理とAI分析をリアルタイムで確認できます。</span>
              </p>
            </div>
            
            {/* Department zen circle with department icon */}
            <div className="hidden lg:flex items-center justify-center w-40 h-40 opacity-15">
              <svg viewBox="0 0 120 120" className="w-full h-full text-indigo-600">
                <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                <Building2 className="absolute inset-0 w-12 h-12 text-current" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}/>
              </svg>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <KizunaDeptStatCard
            icon={FileText}
            label="総ケース数"
            value={stats.total}
            subtext="担当中の合計"
            color="blue"
            bgColor="bg-blue-50/80"
            iconColor="bg-blue-500"
          />
          <KizunaDeptStatCard
            icon={Clock}
            label="対応中"
            value={stats.active}
            subtext="処理中"
            color="orange"
            bgColor="bg-orange-50/80"
            iconColor="bg-orange-500"
          />
          <KizunaDeptStatCard
            icon={CheckCircle2}
            label="解決済み"
            value={stats.resolved}
            subtext="完了"
            color="green"
            bgColor="bg-emerald-50/80"
            iconColor="bg-emerald-500"
          />
          <KizunaDeptStatCard
            icon={AlertCircle}
            label="高優先度"
            value={stats.highPriority}
            subtext="緊急対応"
            color="red"
            bgColor="bg-red-50/80"
            iconColor="bg-red-500"
          />
        </div>

        {/* Enhanced Cases and Map Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                優先ケース <span className="text-sm">🎯</span>
              </h3>
              <Link to="/department/reports" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                すべて表示
              </Link>
            </div>
            
            {loading ? (
              <Card className="p-8 text-center text-sm text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
                データを読み込み中...
              </Card>
            ) : topCases.length === 0 ? (
              <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <FileText className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">現在担当中のケースはありません</p>
                <p className="text-sm text-slate-500">新しいケースが割り当てられると、ここに表示されます。</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {topCases.map((report) => {
                  const ai = analyses[report.id];
                  return (
                    <Link key={report.id} to={`/reports/${report.id}`}>
                      <Card hover className="p-5 border-purple-100 hover:border-purple-200 hover:shadow-lg transition-all relative overflow-hidden">
                        {/* Case priority decoration */}
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                          <svg viewBox="0 0 40 40" className="w-full h-full text-purple-300">
                            {report.priority <= 1 && (
                              <path d="M20 2 L25 15 L38 15 L28 25 L33 38 L20 30 L7 38 L12 25 L2 15 L15 15 Z" fill="currentColor"/>
                            )}
                            {report.priority === 2 && (
                              <circle cx="20" cy="20" r="15" fill="currentColor" opacity="0.8"/>
                            )}
                            {report.priority > 2 && (
                              <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.6"/>
                            )}
                          </svg>
                        </div>
                        
                        <div className="relative flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <StatusBadge status={report.status} />
                              {report.category && (
                                <Badge color={report.category.color as 'blue' | 'amber' | 'green'}>
                                  {report.category.display_name.split(' / ')[0]}
                                </Badge>
                              )}
                              <Badge color={report.priority <= 1 ? 'red' : report.priority <= 2 ? 'amber' : 'slate'}>
                                P{report.priority}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-slate-900 text-base mb-1">
                              {report.title || '無題のケース'}
                            </h4>
                            <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                              {report.description || '説明なし'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {parseFloat(String(report.latitude)).toFixed(4)}, {parseFloat(String(report.longitude)).toFixed(4)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(report.created_at).toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                            {ai && (
                              <div className="flex items-center gap-2 text-xs">
                                <Brain className="h-3 w-3 text-purple-500" />
                                <span className="text-slate-600 capitalize">{ai.final_problem_type}</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600">{Math.round((ai.final_confidence || 0) * 100)}% 信頼度</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600">{ai.related_incident_count} 関連</span>
                              </div>
                            )}
                          </div>
                          {report.image_urls && report.image_urls.length > 0 && (
                            <img
                              src={resolveImageSrc(report.image_urls[0]) ?? undefined}
                              alt=""
                              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Map and Analytics Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                エリア状況 <span className="text-sm">🗾</span>
              </h3>
              <Card className="overflow-hidden border-purple-100 relative">
                <MapView
                  reports={deptReports}
                  categories={categories}
                  height="300px"
                  centerLat={deptReports[0]?.latitude || 13.0827}
                  centerLng={deptReports[0]?.longitude || 80.2707}
                />
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-100 relative overflow-hidden">
              {/* Traditional Japanese cloud pattern */}
              <div className="absolute top-0 right-0 w-24 h-12 opacity-8">
                <svg viewBox="0 0 60 30" className="w-full h-full text-indigo-300">
                  <path d="M5 20 Q2 15 5 10 Q8 5 15 10 Q22 5 30 10 Q38 5 45 10 Q52 5 55 10 Q58 15 55 20 Q52 25 45 20 Q38 25 30 20 Q22 25 15 20 Q8 25 5 20" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Department lantern decoration */}
              <div className="absolute top-2 right-2 w-6 h-8 opacity-15">
                <svg viewBox="0 0 15 20" className="w-full h-full text-red-400">
                  <ellipse cx="7.5" cy="4" rx="6" ry="2" fill="currentColor"/>
                  <rect x="4" y="4" width="7" height="12" rx="3" fill="currentColor"/>
                  <rect x="5.5" y="6" width="4" height="8" fill="white" opacity="0.7"/>
                  <ellipse cx="7.5" cy="16" rx="6" ry="2" fill="currentColor"/>
                  <line x1="7.5" y1="2" x2="7.5" y2="4" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <span className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    AI 分析結果 <span className="text-sm">🤖</span>
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">分析済みケース</span>
                    <span className="font-semibold text-indigo-700 text-lg">{Object.keys(analyses).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">平均信頼度</span>
                    <span className="font-semibold text-purple-700 text-lg">
                      {Object.values(analyses).length > 0
                        ? Math.round(Object.values(analyses).reduce((sum, a) => sum + (a.final_confidence || 0), 0) / Object.values(analyses).length * 100) + '%'
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">関連インシデント</span>
                    <span className="font-semibold text-pink-700 text-lg">
                      {Object.values(analyses).reduce((sum, a) => sum + a.related_incident_count, 0)}
                    </span>
                  </div>
                </div>
                
                {/* Progress visualization */}
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>処理効率</span>
                    <span>{Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}%` }}
                    ></div>
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

function KizunaDeptStatCard({ icon: Icon, label, value, subtext, color, bgColor, iconColor }: { 
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
      dot: 'bg-blue-400',
      pattern: 'text-blue-200'
    },
    orange: {
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-500',
      accent: 'text-orange-400',
      dot: 'bg-orange-400',
      pattern: 'text-orange-200'
    },
    green: {
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
      accent: 'text-emerald-400',
      dot: 'bg-emerald-400',
      pattern: 'text-emerald-200'
    },
    red: {
      textColor: 'text-red-700',
      iconBg: 'bg-red-500',
      accent: 'text-red-400',
      dot: 'bg-red-400',
      pattern: 'text-red-200'
    },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  // Department-specific decorative patterns
  const getCardDecoration = () => {
    switch (color) {
      case 'blue': // Total cases - Document stack pattern
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-60 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Stacked documents pattern */}
              <rect x="120" y="50" width="60" height="50" rx="4" fill="currentColor" opacity="0.7"/>
              <rect x="125" y="45" width="60" height="50" rx="4" fill="currentColor" opacity="0.6"/>
              <rect x="130" y="40" width="60" height="50" rx="4" fill="currentColor" opacity="0.8"/>
              
              {/* Document lines */}
              <line x1="135" y1="50" x2="175" y2="50" stroke="white" strokeWidth="2" opacity="0.8"/>
              <line x1="135" y1="55" x2="170" y2="55" stroke="white" strokeWidth="1.5" opacity="0.7"/>
              <line x1="135" y1="60" x2="180" y2="60" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              
              {/* Filing cabinet */}
              <rect x="100" y="70" width="15" height="40" fill="currentColor" opacity="0.6"/>
              <rect x="102" y="75" width="11" height="6" fill="white" opacity="0.7"/>
              <rect x="102" y="85" width="11" height="6" fill="white" opacity="0.6"/>
              <rect x="102" y="95" width="11" height="6" fill="white" opacity="0.8"/>
            </svg>
          </div>
        );
      
      case 'orange': // Active cases - Processing gears
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-65 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Gear wheels */}
              <circle cx="150" cy="70" r="20" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.7"/>
              <circle cx="170" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
              <circle cx="130" cy="90" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8"/>
              
              {/* Gear teeth */}
              <path d="M150 50 L155 45 L160 50 L155 55 Z" fill="currentColor" opacity="0.6"/>
              <path d="M170 70 L175 65 L180 70 L175 75 Z" fill="currentColor" opacity="0.7"/>
              <path d="M130 70 L135 65 L140 70 L135 75 Z" fill="currentColor" opacity="0.5"/>
              
              {/* Processing arrows */}
              <path d="M110 60 L130 60 L125 55 M130 60 L125 65" stroke="currentColor" strokeWidth="2" opacity="0.6" fill="none"/>
              <path d="M175 80 L195 80 L190 75 M195 80 L190 85" stroke="currentColor" strokeWidth="2" opacity="0.7" fill="none"/>
            </svg>
          </div>
        );
      
      case 'green': // Resolved cases - Check marks and completion
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-55 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Large checkmarks */}
              <path d="M140 70 L150 80 L170 50" stroke="currentColor" strokeWidth="4" opacity="0.8" fill="none" strokeLinecap="round"/>
              <path d="M120 90 L125 95 L135 80" stroke="currentColor" strokeWidth="3" opacity="0.6" fill="none" strokeLinecap="round"/>
              <path d="M160 95 L165 100 L175 85" stroke="currentColor" strokeWidth="3" opacity="0.7" fill="none" strokeLinecap="round"/>
              
              {/* Success badges */}
              <circle cx="150" cy="40" r="8" fill="currentColor" opacity="0.6"/>
              <path d="M145 40 L148 43 L155 36" stroke="white" strokeWidth="1.5" fill="none"/>
              
              <circle cx="180" cy="75" r="6" fill="currentColor" opacity="0.7"/>
              <path d="M177 75 L179 77 L183 73" stroke="white" strokeWidth="1" fill="none"/>
              
              {/* Celebration confetti */}
              <rect x="125" y="30" width="3" height="3" fill="currentColor" opacity="0.5" transform="rotate(45 126.5 31.5)"/>
              <rect x="170" y="35" width="2" height="2" fill="currentColor" opacity="0.6" transform="rotate(30 171 36)"/>
              <rect x="185" y="60" width="2.5" height="2.5" fill="currentColor" opacity="0.7" transform="rotate(60 186.25 61.25)"/>
            </svg>
          </div>
        );
      
      case 'red': // High priority - Alert patterns
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-70 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Warning triangles */}
              <path d="M150 40 L170 80 L130 80 Z" fill="currentColor" opacity="0.7"/>
              <path d="M165 90 L175 110 L155 110 Z" fill="currentColor" opacity="0.6"/>
              <path d="M120 50 L135 75 L105 75 Z" fill="currentColor" opacity="0.8"/>
              
              {/* Exclamation marks */}
              <rect x="148" y="55" width="4" height="15" fill="white" opacity="0.9"/>
              <circle cx="150" cy="75" r="2" fill="white" opacity="0.9"/>
              
              <rect x="163" y="98" width="3" height="8" fill="white" opacity="0.8"/>
              <circle cx="164.5" cy="108" r="1.5" fill="white" opacity="0.8"/>
              
              {/* Alert radiating lines */}
              <line x1="140" y1="30" x2="145" y2="25" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
              <line x1="160" y1="30" x2="165" y2="25" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
              <line x1="150" y1="25" x2="150" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.7"/>
              <line x1="135" y1="35" x2="130" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
              <line x1="165" y1="35" x2="170" y2="30" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={`${bgColor} border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}>
      {getCardDecoration()}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className={`w-2 h-2 rounded-full ${config.dot} opacity-60`}></div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-300">
            {value.toLocaleString('ja-JP')}
          </div>
          <div className={`text-sm font-semibold ${config.textColor}`}>
            {label}
          </div>
          <div className="text-xs text-slate-500">
            {subtext}
          </div>
        </div>
      </div>
    </Card>
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
