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
        {/* Enhanced Admin Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <KizunaAdminStatCard
            icon={FileText}
            label="総レポート数"
            value={stats.totalReports}
            subtext="全システム"
            color="blue"
            bgColor="bg-blue-50/80"
            iconColor="bg-blue-500"
          />
          <KizunaAdminStatCard
            icon={Users}
            label="総ユーザー数"
            value={stats.totalUsers}
            subtext="全役割"
            color="green"
            bgColor="bg-emerald-50/80"
            iconColor="bg-emerald-500"
          />
          <KizunaAdminStatCard
            icon={CheckCircle2}
            label="解決済み"
            value={stats.resolved}
            subtext="完了案件"
            color="green"
            bgColor="bg-emerald-50/80"
            iconColor="bg-emerald-500"
          />
          <KizunaAdminStatCard
            icon={Brain}
            label="AI分析済み"
            value={stats.analyzed}
            subtext="処理完了"
            color="purple"
            bgColor="bg-purple-50/80"
            iconColor="bg-purple-500"
          />
        </div>

        {/* Enhanced Analytics and Management Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resolution Rate & AI Confidence */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 relative overflow-hidden">
                {/* Success pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                  <svg viewBox="0 0 40 40" className="w-full h-full text-emerald-300">
                    <path d="M10 20 L18 28 L30 12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                  </svg>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      解決率 <span className="text-sm">📈</span>
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{resolutionRate}%</div>
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${resolutionRate}%` }} />
                  </div>
                  <div className="text-xs text-slate-500">{stats.resolved} / {stats.totalReports} 件が解決済み</div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 relative overflow-hidden">
                {/* AI brain pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                  <svg viewBox="0 0 40 40" className="w-full h-full text-purple-300">
                    <path d="M20 8 Q12 12 12 20 Q12 28 20 32 Q28 28 28 20 Q28 12 20 8" fill="currentColor" opacity="0.8"/>
                    <circle cx="16" cy="18" r="2" fill="white" opacity="0.9"/>
                    <circle cx="24" cy="18" r="2" fill="white" opacity="0.9"/>
                    <circle cx="20" cy="24" r="1.5" fill="white" opacity="0.8"/>
                  </svg>
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      AI信頼度 <span className="text-sm">🤖</span>
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{avgConfidence}%</div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${avgConfidence}%` }} />
                  </div>
                  <div className="text-xs text-slate-500">{stats.analyzed} 件の分析結果</div>
                </div>
              </Card>
            </div>

            {/* Category Analytics */}
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-100 relative overflow-hidden">
              {/* Category chart pattern */}
              <div className="absolute top-0 right-0 w-20 h-12 opacity-8">
                <svg viewBox="0 0 50 30" className="w-full h-full text-blue-300">
                  <rect x="5" y="15" width="6" height="15" fill="currentColor" opacity="0.8"/>
                  <rect x="15" y="10" width="6" height="20" fill="currentColor" opacity="0.6"/>
                  <rect x="25" y="5" width="6" height="25" fill="currentColor" opacity="0.9"/>
                  <rect x="35" y="12" width="6" height="18" fill="currentColor" opacity="0.7"/>
                </svg>
              </div>
              
              <div className="relative">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-400" /> 
                  カテゴリ別統計 <span className="text-sm">📊</span>
                </h3>
                <div className="space-y-4">
                  {byCategory.map((cat) => {
                    const max = Math.max(...byCategory.map((c) => c.count), 1);
                    const pct = (cat.count / max) * 100;
                    const colors: Record<string, string> = { 
                      blue: 'bg-blue-500', 
                      amber: 'bg-amber-500', 
                      green: 'bg-emerald-500' 
                    };
                    return (
                      <div key={cat.name} className="relative">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">{cat.name}</span>
                          <span className="text-slate-500 font-semibold">{cat.count}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${colors[cat.color] || 'bg-slate-400'}`} 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Status Overview */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50/30 border-indigo-100 relative overflow-hidden">
              {/* Status icons pattern */}
              <div className="absolute top-2 right-2 w-12 h-8 opacity-10">
                <svg viewBox="0 0 30 20" className="w-full h-full text-indigo-300">
                  <circle cx="7" cy="10" r="3" fill="currentColor" opacity="0.8"/>
                  <rect x="12" y="7" width="6" height="6" fill="currentColor" opacity="0.6"/>
                  <polygon points="23,7 26,13 20,13" fill="currentColor" opacity="0.9"/>
                </svg>
              </div>
              
              <div className="relative">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-400" /> 
                  ステータス別統計 <span className="text-sm">⚡</span>
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {byStatus.map((s) => (
                    <div key={s.label} className="text-center p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${s.color}`} />
                      <div className="text-xl font-bold text-slate-900">{s.count}</div>
                      <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Reports Section */}
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50/20 border-purple-100 relative overflow-hidden">
              {/* Reports pattern */}
              <div className="absolute top-2 right-2 w-10 h-8 opacity-10">
                <svg viewBox="0 0 25 20" className="w-full h-full text-purple-300">
                  <rect x="3" y="3" width="15" height="12" rx="2" fill="currentColor" opacity="0.8"/>
                  <rect x="6" y="6" width="9" height="1" fill="white" opacity="0.9"/>
                  <rect x="6" y="8" width="7" height="1" fill="white" opacity="0.8"/>
                  <rect x="6" y="10" width="8" height="1" fill="white" opacity="0.7"/>
                </svg>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    最新レポート <span className="text-sm">📄</span>
                  </h3>
                  <Link to="/admin/reports" className="text-sm text-purple-600 font-medium hover:text-purple-700">
                    すべて表示
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentReports.map((r) => (
                    <Link key={r.id} to={`/reports/${r.id}`}>
                      <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/80 transition-colors border border-purple-100/50">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <StatusBadge status={r.status} />
                          <span className="text-sm text-slate-700 truncate font-medium">{r.title || '無題'}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {new Date(r.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {recentReports.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">まだレポートがありません。</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Management */}
          <div className="space-y-6">
            {/* User Management */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 relative overflow-hidden">
              {/* Users pattern */}
              <div className="absolute top-2 right-2 w-10 h-8 opacity-10">
                <svg viewBox="0 0 25 20" className="w-full h-full text-blue-300">
                  <circle cx="7" cy="6" r="3" fill="currentColor" opacity="0.8"/>
                  <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.6"/>
                  <path d="M2 15 Q2 12 7 12 Q12 12 12 15 L12 18 L2 18 Z" fill="currentColor" opacity="0.7"/>
                  <path d="M13 15 Q13 12 18 12 Q23 12 23 15 L23 18 L13 18 Z" fill="currentColor" opacity="0.5"/>
                </svg>
              </div>
              
              <div className="relative">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-400" /> 
                  ユーザー構成 <span className="text-sm">👥</span>
                </h3>
                <div className="space-y-4">
                  <UserRow label="市民" count={roleCounts.citizens} total={stats.totalUsers} color="bg-blue-500" />
                  <UserRow label="部門職員" count={roleCounts.officials} total={stats.totalUsers} color="bg-emerald-500" />
                  <UserRow label="管理者" count={roleCounts.admins} total={stats.totalUsers} color="bg-purple-500" />
                </div>
                <Link to="/admin/users" className="block mt-4 text-sm text-purple-600 font-medium hover:text-purple-700">
                  ユーザー管理 →
                </Link>
              </div>
            </Card>

            {/* Department Management */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 relative overflow-hidden">
              {/* Buildings pattern */}
              <div className="absolute top-2 right-2 w-12 h-8 opacity-10">
                <svg viewBox="0 0 30 20" className="w-full h-full text-green-300">
                  <rect x="2" y="8" width="8" height="12" fill="currentColor" opacity="0.8"/>
                  <rect x="12" y="5" width="6" height="15" fill="currentColor" opacity="0.6"/>
                  <rect x="20" y="10" width="8" height="10" fill="currentColor" opacity="0.9"/>
                  <rect x="4" y="12" width="2" height="3" fill="white" opacity="0.7"/>
                  <rect x="7" y="12" width="2" height="3" fill="white" opacity="0.8"/>
                  <rect x="14" y="9" width="2" height="3" fill="white" opacity="0.6"/>
                  <rect x="22" y="13" width="2" height="3" fill="white" opacity="0.7"/>
                </svg>
              </div>
              
              <div className="relative">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-slate-400" /> 
                  部門管理 <span className="text-sm">🏢</span>
                </h3>
                <div className="space-y-3">
                  {departments.map((dept) => {
                    const count = reports.filter((r) => r.department_id === dept.id).length;
                    return (
                      <div key={dept.id} className="flex items-center justify-between text-sm py-2 px-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors">
                        <span className="text-slate-700 font-medium">{dept.name}</span>
                        <Badge color="slate">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
                <Link to="/admin/departments" className="block mt-4 text-sm text-purple-600 font-medium hover:text-purple-700">
                  部門管理 →
                </Link>
              </div>
            </Card>

            {/* System Map */}
            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 relative overflow-hidden">
              {/* Map pattern */}
              <div className="absolute top-2 right-2 w-8 h-6 opacity-15">
                <svg viewBox="0 0 20 15" className="w-full h-full text-amber-400">
                  <circle cx="5" cy="5" r="2" fill="currentColor"/>
                  <circle cx="15" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="11" r="1" fill="currentColor"/>
                  <path d="M5 5 L15 8 M15 8 L8 11" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
                </svg>
              </div>
              
              <div className="relative">
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  システムマップ <span className="text-sm">🗾</span>
                </h3>
                <MapView 
                  reports={reports.slice(0, 50)} 
                  categories={categories} 
                  height="220px"
                  centerLat={reports[0]?.latitude || 13.0827}
                  centerLng={reports[0]?.longitude || 80.2707}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function KizunaAdminStatCard({ icon: Icon, label, value, subtext, color, bgColor, iconColor }: { 
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
    green: {
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
      accent: 'text-emerald-400',
      dot: 'bg-emerald-400',
      pattern: 'text-emerald-200'
    },
    purple: {
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      accent: 'text-purple-400',
      dot: 'bg-purple-400',
      pattern: 'text-purple-200'
    },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  // Admin-specific decorative patterns
  const getCardDecoration = () => {
    switch (color) {
      case 'blue': // Total reports - Global network pattern
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-60 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Global network nodes */}
              <circle cx="130" cy="40" r="8" fill="currentColor" opacity="0.8"/>
              <circle cx="160" cy="60" r="6" fill="currentColor" opacity="0.7"/>
              <circle cx="180" cy="80" r="7" fill="currentColor" opacity="0.6"/>
              <circle cx="150" cy="90" r="5" fill="currentColor" opacity="0.9"/>
              <circle cx="110" cy="70" r="6" fill="currentColor" opacity="0.5"/>
              
              {/* Network connections */}
              <path d="M130 40 L160 60 L180 80 L150 90 L110 70 L130 40" stroke="currentColor" strokeWidth="2" opacity="0.6" fill="none"/>
              <path d="M160 60 L110 70" stroke="currentColor" strokeWidth="1.5" opacity="0.5" fill="none"/>
              <path d="M150 90 L160 60" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none"/>
              
              {/* Data flow indicators */}
              <circle cx="140" cy="50" r="2" fill="white" opacity="0.9">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="165" cy="75" r="2" fill="white" opacity="0.8">
                <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
        );
      
      case 'green': // Users/Resolved - Crown and achievement pattern
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-55 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Crown pattern */}
              <path d="M130 60 L140 45 L150 60 L160 45 L170 60 L165 70 L135 70 Z" fill="currentColor" opacity="0.7"/>
              <circle cx="140" cy="52" r="2" fill="white" opacity="0.9"/>
              <circle cx="150" cy="48" r="2.5" fill="white" opacity="0.8"/>
              <circle cx="160" cy="52" r="2" fill="white" opacity="0.9"/>
              
              {/* Achievement medals */}
              <circle cx="120" cy="85" r="8" fill="currentColor" opacity="0.6"/>
              <circle cx="180" cy="90" r="6" fill="currentColor" opacity="0.8"/>
              
              {/* Medal ribbons */}
              <rect x="117" y="93" width="6" height="15" fill="currentColor" opacity="0.5"/>
              <rect x="178" y="96" width="4" height="10" fill="currentColor" opacity="0.7"/>
              
              {/* Success stars */}
              <path d="M110 50 L112 55 L117 55 L113 58 L115 63 L110 60 L105 63 L107 58 L103 55 L108 55 Z" fill="currentColor" opacity="0.6"/>
              <path d="M185 70 L186 72 L188 72 L187 74 L187.5 76 L185 75 L182.5 76 L183 74 L182 72 L184 72 Z" fill="currentColor" opacity="0.8"/>
            </svg>
          </div>
        );
      
      case 'purple': // AI Analysis - Brain circuits pattern
        return (
          <div className="absolute bottom-0 right-0 w-full h-full opacity-65 overflow-hidden">
            <svg viewBox="0 0 200 120" className={`w-full h-full ${config.pattern}`}>
              {/* Brain outline */}
              <path d="M130 50 Q120 40 130 35 Q140 30 150 35 Q170 30 180 40 Q185 50 180 65 Q175 80 160 85 Q145 80 135 70 Q125 60 130 50" fill="currentColor" opacity="0.6"/>
              
              {/* Neural pathways */}
              <path d="M135 50 L155 55 L175 50" stroke="white" strokeWidth="2" opacity="0.8"/>
              <path d="M140 60 L150 65 L165 60" stroke="white" strokeWidth="1.5" opacity="0.7"/>
              <path d="M145 70 L160 70" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              
              {/* Processing nodes */}
              <circle cx="145" cy="50" r="3" fill="white" opacity="0.9"/>
              <circle cx="155" cy="55" r="2.5" fill="white" opacity="0.8"/>
              <circle cx="165" cy="50" r="3" fill="white" opacity="0.7"/>
              <circle cx="150" cy="65" r="2" fill="white" opacity="0.9"/>
              
              {/* Data pulse animations */}
              <circle cx="140" cy="45" r="1.5" fill="#fbbf24" opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="170" cy="55" r="1.5" fill="#fbbf24" opacity="0.7">
                <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.8s" repeatCount="indefinite"/>
              </circle>
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
    <div className="p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500 font-semibold">{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
