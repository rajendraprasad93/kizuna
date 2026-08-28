# CivicEye — Agentic AI-Powered City Problem Intelligence System

CivicEye is an intelligent urban issue management platform that empowers citizens to report problems (flooding, potholes, garbage, infrastructure failure), automates multi-modal AI analysis (root cause detection, relationship graph analysis, authenticity verification, recommended actions), and provides department workflows and administrative analytics.

---

## 🌟 Key Features

- **Citizen Reporting Hub**: Fast issue reporting with GPS coordinate detection, image uploads, contextual descriptions, and real-time tracking.
- **AI Problem Intelligence Engine**:
  - Problem classification (flooding, pothole, garbage, infrastructure)
  - Cause & condition extraction with confidence scoring
  - Relationship graph mapping interconnected urban issues
  - Authenticity verification (GPS matching, EXIF validity, duplicate detection)
  - Recommended resolution workflows and prioritized action plans
- **Department Operations Portal**:
  - Live incident triage and status updates (`submitted` &rarr; `analyzing` &rarr; `analyzed` &rarr; `assigned` &rarr; `in_progress` &rarr; `resolved`)
  - Action resolution logs with cost, duration, and post-repair proof uploads
- **Interactive City Map**: Visual geo-spatial clustering of city issues with status and priority indicators.
- **Role-Based Access Control**:
  - `citizen`: Submit and track personal reports
  - `department`: Manage department-specific queue and log resolutions
  - `admin`: Platform-wide analytics, department configurations, user management

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router 7
- **Styling**: Tailwind CSS, Lucide React icons
- **Backend & Database**: Supabase (PostgreSQL + Row-Level Security)
- **Maps**: OpenStreetMap integration with interactive coordinates

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Database Setup
Apply the SQL migration located in `supabase/migrations/20260822125350_001_create_core_schema.sql` to your Supabase project SQL editor to set up tables, triggers, and Row Level Security policies.

### 5. Running the Application
```bash
# Start development server
npm run dev

# Run TypeScript type check
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI & composite components
│   │   ├── ui/             # Atomic design system components (Button, Input, Card, Badge, Modal)
│   │   ├── AiAnalysisDisplay.tsx # AI breakdown & graph visualizer
│   │   ├── DashboardShell.tsx    # Responsive shell navigation
│   │   ├── Layout.tsx            # App-wide layout wrappers
│   │   └── MapView.tsx           # Geo-location map viewer
│   ├── context/
│   │   └── AuthContext.tsx # Supabase authentication & user profile state
│   ├── lib/
│   │   ├── ai-engine.ts    # Agentic AI problem classification & reasoning engine
│   │   └── supabase.ts     # Supabase client singleton
│   ├── pages/              # Application views & dashboards
│   ├── types/              # TypeScript data models and interfaces
│   ├── App.tsx             # Route definitions & protected route guards
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global Tailwind styling & animations
├── supabase/
│   └── migrations/         # PostgreSQL schema & security policies
├── .env.example            # Environment variables template
├── package.json            # Project dependencies & scripts
├── tailwind.config.js      # Tailwind design tokens & keyframes
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 📄 License
MIT License
