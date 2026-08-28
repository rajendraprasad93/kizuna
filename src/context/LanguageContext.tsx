import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'ja';

const translations = {
  en: {
    // Nav
    howItWorks: 'How It Works',
    aiIntelligence: 'AI Intelligence',
    forOfficials: 'For Officials',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    notifications: 'Notifications',

    // Sidebar nav
    overview: 'Overview',
    allReports: 'All Reports',
    departments: 'Departments',
    users: 'Users',
    allUsers: 'All Users',
    noUsersFound: 'No users found.',
    profileTitle: 'Profile',
    assignedCases: 'Assigned Cases',
    mapView: 'Map View',
    newReport: 'New Report',
    myReports: 'My Reports',
    profile: 'Profile',

    // Roles
    administrator: 'Administrator',
    departmentOfficial: 'Department Official',
    citizen: 'Citizen',

    // Dashboard - Citizen
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Your problem reports at a glance',
    hello: 'Hello',
    trackReports: 'Track your reports and see AI insights in real time.',
    reportAProblem: 'Report a Problem',
    totalReports: 'Total Reports',
    active: 'Active',
    resolved: 'Resolved',
    awaitingAI: 'Awaiting AI',
    recentReports: 'Recent Reports',
    viewAll: 'View all',
    loading: 'Loading...',
    noReportsYet: "You haven't submitted any reports yet.",
    beFirstReport: 'Be the first to report a problem in your area.',
    submitFirstReport: 'Submit Your First Report',
    untitledReport: 'Untitled report',
    noDescription: 'No description',

    // Dashboard - Department
    highPriority: 'High Priority',
    topCases: 'Top Priority Cases',
    noCases: 'No cases assigned yet.',
    yourDepartment: 'Your Department',

    // Dashboard - Admin
    totalUsers: 'Total Users',
    totalDepts: 'Total Departments',
    resolutionRate: 'Resolution Rate',
    aiAnalyzed: 'AI Analyzed',
    avgConfidence: 'Avg Confidence',
    reportsByCategory: 'Reports by Category',
    recentActivity: 'Recent Activity',

    // Report detail
    reportDetails: 'Report Details',
    reported: 'Reported',
    backToDashboard: 'Back to Dashboard',
    back: 'Back',
    updateStatus: 'Update Status',
    recordAction: 'Record Action',
    reportNotFound: 'Report Not Found',
    couldNotFind: 'This report could not be found.',

    // New report
    newReportTitle: 'New Report',
    newReportSubtitle: 'Describe the problem and let AI do the analysis',
    titleLabel: 'Title',
    titlePlaceholder: 'Brief title for this problem',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the problem in detail...',
    categoryLabel: 'Category',
    locationLabel: 'Location',
    submitReport: 'Submit Report',
    analyzing: 'Analyzing...',
    uploadPhoto: 'Upload Photo',
    problemDetected: 'Problem Detected',
    viewFullReport: 'View Full Report',

    // Status
    submitted: 'Submitted',
    in_progress: 'In Progress',
    assigned: 'Assigned',
    analyzed: 'Analyzed',
    rejected: 'Rejected',
    closed: 'Closed',

    // Auth
    loginTitle: 'Sign in to CivicEye',
    loginSubtitle: 'Welcome back',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    loginButton: 'Sign In',
    noAccount: "Don't have an account?",
    registerLink: 'Create one',
    registerTitle: 'Create your account',
    registerButton: 'Create Account',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    selectRole: 'I am a...',

    // Landing
    heroTitle: 'AI-Powered City Problem Intelligence',
    heroSubtitle: 'Report infrastructure issues. Our AI analyzes, verifies, finds root causes, and routes them to the right department.',
    learnMore: 'Learn How It Works',
    problemsWeHandle: 'Problems We Handle',
    howItWorksTitle: 'How CivicEye Works',
    aiCapabilities: 'AI Capabilities',
    forOfficialsTitle: 'Built for City Officials',
    readyToReport: 'Ready to make your city smarter?',

    // Footer
    platform: 'Platform',
    roles: 'Roles',
    citizens: 'Citizens',
    officials: 'Department Officials',
    admins: 'Administrators',

    // My Reports
    myReportsTitle: 'My Reports',
    myReportsSubtitle: 'All reports you have submitted',
    noReportsFound: 'No reports found.',
    filterAll: 'All',

    // Notifications
    notificationsTitle: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications yet.',

    // Admin Departments
    inactive: 'Inactive',
    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    memberSince: 'Member since',
    phone: 'Phone',
    department: 'Department',
    role: 'Role',

    // Landing page
    agenticAI: 'Agentic AI for Urban Problem Intelligence',
    dontJustReport: "Don't just report problems.",
    understandThem: 'Understand them.',
    civicEyeDesc: 'CivicEye goes beyond complaint reporting. AI agents detect problems from photos, discover root causes, recommend interventions, and verify that solutions actually worked — creating a learning loop for smarter cities.',
    reportAProblem2: 'Report a Problem',
    seeHowItWorks: 'See How It Works',
    aiEngineOnline: 'AI Engine Online',
    visionNLPAnalysis: 'Vision + NLP Analysis',
    fromDetectionToLearning: 'From Detection to Learning',
    traditionalSystems: 'Traditional systems do "report → route → resolve." CivicEye does eight things — each powered by specialized AI agents working together.',
    detect: 'Detect',
    detectDesc: 'Vision AI identifies problems from photos',
    understand: 'Understand',
    understandDesc: 'NLP extracts context from descriptions',
    connect: 'Connect',
    connectDesc: 'Discover relationships between incidents',
    investigate: 'Investigate',
    investigateDesc: 'Find root causes from historical patterns',
    recommend: 'Recommend',
    recommendDesc: 'AI suggests interventions with confidence',
    act: 'Act',
    actDesc: 'Route to the right department for resolution',
    verify: 'Verify',
    verifyDesc: 'Confirm the solution actually worked',
    learn: 'Learn',
    learnDesc: 'Feedback improves future predictions',
    problemsWeUnderstand: 'Problems We Understand',
    problemsDesc: 'Three urban problem categories, each with tailored AI models and department routing.',
    floodingTitle: 'Flooding & Water Accumulation',
    floodingDesc: 'Standing water, waterlogged roads, drainage overflow',
    floodingStats: 'Avg. resolution: 24h',
    roadDamageTitle: 'Road Damage & Potholes',
    roadDamageDesc: 'Cracks, potholes, deteriorated road surfaces',
    roadDamageStats: 'Avg. resolution: 72h',
    garbageTitle: 'Garbage Accumulation',
    garbageDesc: 'Waste piles, uncollected garbage, illegal dumping',
    garbageStats: 'Avg. resolution: 48h',
    reportsFiledLabel: 'Reports Filed',
    aiAccuracyLabel: 'AI Accuracy',
    resolvedLabel: 'Resolved',
    sixSpecializedAI: 'Six Specialized AI Tools',
    orchestratorAgent: 'An orchestrator agent coordinates these tools to analyze every report end-to-end.',
    aiAgentArchitecture: 'AI Agent Architecture',
    visionAI: 'Vision AI',
    visionAIDesc: 'Detects problem type and visible conditions from photographs with bounding-box precision and confidence scoring.',
    nlpEngine: 'NLP Engine',
    nlpEngineDesc: 'Extracts problem context, severity, and location hints from citizen text descriptions in natural language.',
    verification: 'Verification',
    verificationDesc: 'Checks GPS match, timestamp validity, and image uniqueness to flag inauthentic reports.',
    relationshipDiscovery: 'Relationship Discovery',
    relationshipDiscoveryDesc: 'Builds knowledge graphs connecting problems — drainage blockage causes flooding, flooding causes road damage.',
    rootCauseAnalysis: 'Root Cause Analysis',
    rootCauseAnalysisDesc: 'Bayesian inference over historical data to surface the most likely causes with evidence and confidence.',
    interventionRecommender: 'Intervention Recommender',
    interventionRecommenderDesc: 'Suggests specific actions with cost, duration, expected impact, and step-by-step instructions.',
    forDepartmentOfficials: 'For Department Officials',
    aiAssistedCaseManagement: 'AI-assisted case management',
    aiAnalysisOnEveryCase: 'AI analysis on every case',
    aiAnalysisDesc: 'See detected problem, root causes, and recommended actions before you even open the file.',
    acceptOrReject: 'Accept or reject AI recommendations',
    acceptOrRejectDesc: 'You stay in control. The AI suggests, you decide. Your feedback trains the system.',
    beforeAfterVerification: 'Before/after verification',
    beforeAfterDesc: 'Upload repair photos and let the AI verify whether the problem is actually resolved.',
    clusterAwareness: 'Cluster awareness',
    clusterAwarenessDesc: 'See related incidents in the same area to prioritize systemic issues over one-offs.',
    registerAsOfficial: 'Register as Official',
    makeYourCitySmarter: 'Make your city smarter, one report at a time',
    joinThePlatform: 'Join the platform that turns citizen reports into intelligent action.',
    getStartedFree: 'Get Started Free',
    smartCityAerial: 'Smart city aerial view',
    aiAnalysisReport: 'AI Analysis Report',
    detectedProblem: 'Detected Problem',
    floodingStandingWater: 'Flooding — Standing Water',
    rootCause: 'Root Cause (82% confidence)',
    blockedDrainage: 'Blocked drainage system',
    previousReports: '7 previous reports within 500m',
    recommendedAction: 'Recommended Action',
    inspectCleanDrainage: 'Inspect and clean drainage',
    estDuration: 'Est. 8h · Dept: Drainage & Water',
    reportsFiledCount: '1,523',
    aiAccuracyPercent: '94%',
    resolvedPercent: '72%',
  },

  ja: {
    // Nav
    howItWorks: '使い方',
    aiIntelligence: 'AI機能',
    forOfficials: '担当者向け',
    signIn: 'ログイン',
    signOut: 'ログアウト',
    getStarted: '始める',
    dashboard: 'ダッシュボード',
    notifications: '通知',

    // Sidebar nav
    overview: '概要',
    allReports: '全レポート',
    departments: '部署',
    users: 'ユーザー',
    allUsers: '全ユーザー',
    noUsersFound: 'ユーザーが見つかりません。',
    profileTitle: 'プロフィール',
    assignedCases: '担当案件',
    mapView: 'マップ',
    newReport: '新規報告',
    myReports: '自分の報告',
    profile: 'プロフィール',

    // Roles
    administrator: '管理者',
    departmentOfficial: '部署担当者',
    citizen: '市民',

    // Dashboard - Citizen
    dashboardTitle: 'ダッシュボード',
    dashboardSubtitle: '問題報告の概要',
    hello: 'こんにちは',
    trackReports: '報告状況とAI分析をリアルタイムで確認できます。',
    reportAProblem: '問題を報告する',
    totalReports: '総報告数',
    active: '対応中',
    resolved: '解決済み',
    awaitingAI: 'AI分析待ち',
    recentReports: '最近の報告',
    viewAll: '全て表示',
    loading: '読み込み中...',
    noReportsYet: 'まだ報告がありません。',
    beFirstReport: 'お住まいの地域の問題を最初に報告しましょう。',
    submitFirstReport: '最初の報告を送信する',
    untitledReport: '無題の報告',
    noDescription: '説明なし',

    // Dashboard - Department
    highPriority: '高優先度',
    topCases: '優先案件',
    noCases: '担当案件がありません。',
    yourDepartment: '担当部署',

    // Dashboard - Admin
    totalUsers: '総ユーザー数',
    totalDepts: '総部署数',
    resolutionRate: '解決率',
    aiAnalyzed: 'AI分析済み',
    avgConfidence: '平均信頼度',
    reportsByCategory: 'カテゴリ別報告',
    recentActivity: '最近の活動',

    // Report detail
    reportDetails: '報告詳細',
    reported: '報告日時',
    backToDashboard: 'ダッシュボードへ戻る',
    back: '戻る',
    updateStatus: 'ステータス更新',
    recordAction: '対応を記録',
    reportNotFound: '報告が見つかりません',
    couldNotFind: 'この報告は見つかりませんでした。',

    // New report
    newReportTitle: '新規報告',
    newReportSubtitle: '問題を説明してAIに分析させましょう',
    titleLabel: 'タイトル',
    titlePlaceholder: '問題の簡潔なタイトル',
    descriptionLabel: '説明',
    descriptionPlaceholder: '問題の詳細を記述してください...',
    categoryLabel: 'カテゴリ',
    locationLabel: '場所',
    submitReport: '報告を送信',
    analyzing: '分析中...',
    uploadPhoto: '写真をアップロード',
    problemDetected: '問題を検出しました',
    viewFullReport: '全レポートを表示',

    // Status
    submitted: '提出済み',
    in_progress: '対応中',
    assigned: '割り当て済み',
    analyzed: '分析済み',
    rejected: '却下',
    closed: '完了',

    // Auth
    loginTitle: 'CivicEyeにログイン',
    loginSubtitle: 'おかえりなさい',
    emailLabel: 'メールアドレス',
    passwordLabel: 'パスワード',
    loginButton: 'ログイン',
    noAccount: 'アカウントをお持ちでない方は',
    registerLink: 'こちら',
    registerTitle: 'アカウントを作成',
    registerButton: 'アカウントを作成',
    hasAccount: 'すでにアカウントをお持ちの方は',
    loginLink: 'ログイン',
    fullNameLabel: 'お名前',
    fullNamePlaceholder: 'フルネームを入力',
    selectRole: '役割を選択...',

    // Landing
    heroTitle: 'AI搭載の都市問題インテリジェンス',
    heroSubtitle: 'インフラの問題を報告すると、AIが分析・検証・根本原因の特定を行い、適切な部署に振り分けます。',
    learnMore: '使い方を見る',
    problemsWeHandle: '対応可能な問題',
    howItWorksTitle: 'CivicEyeの仕組み',
    aiCapabilities: 'AI機能',
    forOfficialsTitle: '行政担当者向け機能',
    readyToReport: '都市をもっとスマートに？',

    // Footer
    platform: 'プラットフォーム',
    roles: '役割',
    citizens: '市民',
    officials: '部署担当者',
    admins: '管理者',

    // My Reports
    myReportsTitle: '自分の報告',
    myReportsSubtitle: '送信した全ての報告',
    noReportsFound: '報告が見つかりません。',
    filterAll: '全て',

    // Notifications
    notificationsTitle: '通知',
    markAllRead: '全て既読にする',
    noNotifications: '通知はありません。',

    // Admin Departments
    inactive: '非アクティブ',
    saveChanges: '変更を保存',
    editProfile: 'プロフィールを編集',
    memberSince: '登録日',
    phone: '電話番号',
    department: '部署',
    role: '役割',

    // Landing page
    agenticAI: '都市問題インテリジェンス用エージェントAI',
    dontJustReport: '問題を報告するだけじゃない。',
    understandThem: '理解する。',
    civicEyeDesc: 'CivicEyeは苦情報告以上のものです。AIエージェントが写真から問題を検出し、根本原因を発見し、介入を推奨し、ソリューションが実際に機能したことを検証します。スマートシティのための学習ループを作ります。',
    reportAProblem2: '問題を報告する',
    seeHowItWorks: '使い方を見る',
    aiEngineOnline: 'AIエンジンがオンライン',
    visionNLPAnalysis: 'ビジョン + NLP分析',
    fromDetectionToLearning: '検出から学習へ',
    traditionalSystems: '従来のシステムは「報告→ルーティング→解決」を行います。CivicEyeは8つのことを行い、各々が専門的なAIエージェントで動作します。',
    detect: '検出',
    detectDesc: 'ビジョンAIが写真から問題を識別',
    understand: '理解',
    understandDesc: 'NLPが説明からコンテキストを抽出',
    connect: '接続',
    connectDesc: 'インシデント間の関係を発見',
    investigate: '調査',
    investigateDesc: '歴史的パターンから根本原因を見つける',
    recommend: '推奨',
    recommendDesc: 'AIが信頼度付きの介入を提案',
    act: '対応',
    actDesc: '適切な部署にルーティング',
    verify: '検証',
    verifyDesc: 'ソリューションが実際に機能したことを確認',
    learn: '学習',
    learnDesc: 'フィードバックが今後の予測を改善',
    problemsWeUnderstand: '対応可能な問題',
    problemsDesc: '3つの都市問題カテゴリ、それぞれカスタマイズされたAIモデルと部署ルーティング。',
    floodingTitle: '浸水・貯水',
    floodingDesc: ' water滞水、冠水道路、排水路溢流',
    floodingStats: '平均解決時間: 24時間',
    roadDamageTitle: '道路損傷・ポットホール',
    roadDamageDesc: 'ひび割れ、ポットホール、劣化した路面',
    roadDamageStats: '平均解決時間: 72時間',
    garbageTitle: 'ゴミ蓄積',
    garbageDesc: 'ゴミ積み重ね、未収集ゴミ、不法投棄',
    garbageStats: '平均解決時間: 48時間',
    reportsFiledLabel: '報告数',
    aiAccuracyLabel: 'AI精度',
    resolvedLabel: '解決済み',
    sixSpecializedAI: '6つの専門的AI機能',
    orchestratorAgent: 'オーケストレーターエージェントがこれらのツールを調整して、すべてのレポートをエンドツーエンドで分析します。',
    aiAgentArchitecture: 'AIエージェントアーキテクチャ',
    visionAI: 'ビジョンAI',
    visionAIDesc: '写真から問題タイプと視覚的状態を検出し、バウンディングボックス精度と信頼度スコアリングで表示。',
    nlpEngine: 'NLPエンジン',
    nlpEngineDesc: '市民のテキスト説明から自然言語でコンテキスト、重大度、位置情報ヒントを抽出。',
    verification: '検証',
    verificationDesc: 'GPS一致、タイムスタンプ有効性、画像一意性をチェックして不正なレポートに表示。',
    relationshipDiscovery: '関係発見',
    relationshipDiscoveryDesc: '知識グラフを構築して問題を接続 — 排水路閉塞が浸水を引き起こし、浸水が道路損傷を引き起こす。',
    rootCauseAnalysis: '根本原因分析',
    rootCauseAnalysisDesc: '歴史的データに対するベイズ推論で最も可能性の高い原因を証拠と信頼度で表示。',
    interventionRecommender: '介入提案者',
    interventionRecommenderDesc: 'コスト、期間、期待される影響、段階的な指示を含む具体的なアクションを提案。',
    forDepartmentOfficials: '部署担当者向け機能',
    aiAssistedCaseManagement: 'AIを活用したケース管理',
    aiAnalysisOnEveryCase: '全ケースのAI分析',
    aiAnalysisDesc: 'ファイルを開く前に検出された問題、根本原因、推奨アクションを確認。',
    acceptOrReject: 'AIの推奨を受け入れるか拒否するか',
    acceptOrRejectDesc: 'あなたが管理します。AIが提案し、あなたが決定します。フィードバックがシステムを改善します。',
    beforeAfterVerification: '修理前後の検証',
    beforeAfterDesc: '修理写真をアップロードして、AIが問題が実際に解決したかを検証。',
    clusterAwareness: 'クラスター認識',
    clusterAwarenessDesc: '同じエリア内の関連インシデントを表示して、一時的な問題よりも体系的な問題を優先。',
    registerAsOfficial: '担当者として登録',
    makeYourCitySmarter: 'あなたの都市をスマートにする、一つの報告ずつ',
    joinThePlatform: '市民報告をインテリジェント対応に変えるプラットフォームに参加。',
    getStartedFree: '無料で始める',
    smartCityAerial: 'スマートシティの航空写真',
    aiAnalysisReport: 'AI分析レポート',
    detectedProblem: '検出された問題',
    floodingStandingWater: '浸水 — 滞水',
    rootCause: '根本原因(信頼度82%)',
    blockedDrainage: 'ブロックされた排水システム',
    previousReports: '500m以内の過去レポート7件',
    recommendedAction: '推奨アクション',
    inspectCleanDrainage: '排水路の検査と清掃',
    estDuration: '推定8時間 · 部署: 排水・水道',
    reportsFiledCount: '1,523',
    aiAccuracyPercent: '94%',
    resolvedPercent: '72%',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('civiceye-lang') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('civiceye-lang', lang);
  };

  const t = (key: TranslationKey): string => translations[language][key];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
