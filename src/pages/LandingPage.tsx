import { Link } from 'react-router-dom';
import { Brain, Camera, Search, Network, Wrench, CheckCircle2, ArrowRight, Activity, MapPin, Zap, ShieldCheck, Eye, TrendingDown, GitBranch, Lightbulb, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar, Footer } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';

const HERO_IMG = 'https://images.pexels.com/photos/15629500/pexels-photo-15629500.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const getPipelineSteps = (t: any) => [
  { icon: Eye, label: t('detect'), desc: t('detectDesc'), color: 'text-blue-600 bg-blue-50' },
  { icon: Brain, label: t('understand'), desc: t('understandDesc'), color: 'text-cyan-600 bg-cyan-50' },
  { icon: Network, label: t('connect'), desc: t('connectDesc'), color: 'text-teal-600 bg-teal-50' },
  { icon: Search, label: t('investigate'), desc: t('investigateDesc'), color: 'text-green-600 bg-green-50' },
  { icon: Lightbulb, label: t('recommend'), desc: t('recommendDesc'), color: 'text-amber-600 bg-amber-50' },
  { icon: Wrench, label: t('act'), desc: t('actDesc'), color: 'text-orange-600 bg-orange-50' },
  { icon: CheckCircle2, label: t('verify'), desc: t('verifyDesc'), color: 'text-emerald-600 bg-emerald-50' },
  { icon: TrendingDown, label: t('learn'), desc: t('learnDesc'), color: 'text-purple-600 bg-purple-50' },
];

const getProblemCards = (t: any) => [
  {
    title: t('floodingTitle'),
    img: 'https://images.pexels.com/photos/26202091/pexels-photo-26202091.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    desc: t('floodingDesc'),
    color: 'blue',
    stats: t('floodingStats'),
  },
  {
    title: t('roadDamageTitle'),
    img: 'https://images.pexels.com/photos/20518249/pexels-photo-20518249.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    desc: t('roadDamageDesc'),
    color: 'amber',
    stats: t('roadDamageStats'),
  },
  {
    title: t('garbageTitle'),
    img: 'https://images.pexels.com/photos/6316243/pexels-photo-6316243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    desc: t('garbageDesc'),
    color: 'green',
    stats: t('garbageStats'),
  },
];

const getAICapabilities = (t: any) => [
  { icon: Eye, title: t('visionAI'), desc: t('visionAIDesc') },
  { icon: Brain, title: t('nlpEngine'), desc: t('nlpEngineDesc') },
  { icon: ShieldCheck, title: t('verification'), desc: t('verificationDesc') },
  { icon: Network, title: t('relationshipDiscovery'), desc: t('relationshipDiscoveryDesc') },
  { icon: GitBranch, title: t('rootCauseAnalysis'), desc: t('rootCauseAnalysisDesc') },
  { icon: Target, title: t('interventionRecommender'), desc: t('interventionRecommenderDesc') },
];

export function LandingPage() {
  const { t } = useLanguage();
  const PIPELINE_STEPS = getPipelineSteps(t);
  const PROBLEM_CARDS = getProblemCards(t);
  const AI_CAPABILITIES = getAICapabilities(t);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold ring-1 ring-brand-600/20 mb-6">
                <Zap className="h-3.5 w-3.5" />
                {t('agenticAI')}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] text-balance">
                {t('dontJustReport')}
                <span className="block bg-gradient-to-r from-brand-600 to-cyan-600 bg-clip-text text-transparent">{t('understandThem')}</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                {t('civicEyeDesc')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register">
                  <Button size="lg">
                    {t('reportAProblem2')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline">
                    <Activity className="h-5 w-5" />
                    {t('seeHowItWorks')}
                  </Button>
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('aiEngineOnline')}
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {t('visionNLPAnalysis')}
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/10">
                <img src={HERO_IMG} alt={t('smartCityAerial')} className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                      <div className="text-2xl font-bold text-white">{t('reportsFiledCount')}</div>
                      <div className="text-xs text-slate-300">{t('reportsFiledLabel')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                      <div className="text-2xl font-bold text-white">{t('aiAccuracyPercent')}</div>
                      <div className="text-xs text-slate-300">{t('aiAccuracyLabel')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                      <div className="text-2xl font-bold text-white">{t('resolvedPercent')}</div>
                      <div className="text-xs text-slate-300">{t('resolvedLabel')}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-200 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">AI Analysis</div>
                    <div className="text-xs text-slate-500">Root cause found</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Pipeline */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">{t('fromDetectionToLearning')}</h2>
            <p className="mt-4 text-lg text-slate-600">
              {t('traditionalSystems')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="relative group">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 h-full transition-all duration-300 group-hover:shadow-md group-hover:border-slate-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{step.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Types */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">{t('problemsWeUnderstand')}</h2>
            <p className="mt-4 text-lg text-slate-600">{t('problemsDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PROBLEM_CARDS.map((p) => (
              <div key={p.title} className="group rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-xs font-medium bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
                    {p.stats}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-slate-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Intelligence */}
      <section id="ai-intelligence" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-brand-300 text-xs font-semibold mb-4">
              <Brain className="h-3.5 w-3.5" />
              {t('aiAgentArchitecture')}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">{t('sixSpecializedAI')}</h2>
            <p className="mt-4 text-lg text-slate-400">
              {t('orchestratorAgent')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AI_CAPABILITIES.map((cap) => (
              <div key={cap.title} className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-cyan-500/20 flex items-center justify-center mb-4 ring-1 ring-white/10">
                  <cap.icon className="h-6 w-6 text-brand-300" />
                </div>
                <h3 className="font-semibold text-white mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Officials */}
      <section id="for-officials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('forDepartmentOfficials')}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-6">{t('aiAssistedCaseManagement')}</h2>
              <div className="space-y-4">
                {[
                  { icon: Brain, title: t('aiAnalysisOnEveryCase'), desc: t('aiAnalysisDesc') },
                  { icon: CheckCircle2, title: t('acceptOrReject'), desc: t('acceptOrRejectDesc') },
                  { icon: Camera, title: t('beforeAfterVerification'), desc: t('beforeAfterDesc') },
                  { icon: MapPin, title: t('clusterAwareness'), desc: t('clusterAwarenessDesc') },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/register"><Button size="lg" variant="outline">{t('registerAsOfficial')} <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{t('aiAnalysisReport')}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">94% confidence</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">{t('detectedProblem')}</div>
                    <div className="text-sm font-semibold text-slate-900">{t('floodingStandingWater')}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <div className="text-xs font-medium text-amber-700 mb-1">{t('rootCause')}</div>
                    <div className="text-sm text-slate-900">{t('blockedDrainage')}</div>
                    <div className="text-xs text-slate-500 mt-1">{t('previousReports')}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <div className="text-xs font-medium text-emerald-700 mb-1">{t('recommendedAction')}</div>
                    <div className="text-sm text-slate-900">{t('inspectCleanDrainage')}</div>
                    <div className="text-xs text-slate-500 mt-1">{t('estDuration')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white text-balance">{t('makeYourCitySmarter')}</h2>
          <p className="mt-6 text-lg text-brand-100 max-w-2xl mx-auto">
            {t('joinThePlatform')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"><Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">{t('getStartedFree')} <ArrowRight className="h-5 w-5" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10">{t('signIn')}</Button></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
