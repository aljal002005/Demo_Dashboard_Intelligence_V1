# HSS HR Analytics Dashboard

A polished HR Analytics Dashboard demo for HSS Health Network, built with React + Vite + TypeScript + Tailwind CSS.

## Architecture

### Monorepo structure
- `artifacts/hr-dashboard/` — React + Vite frontend (port 18229, accessible at `/hr-dashboard`)
- `artifacts/api-server/` — Express API server (port 8080)

### Key tech
- React 18 + TypeScript + Vite
- Tailwind CSS (dark mode via `dark:` class, toggled at root `<div>`)
- Recharts for all data visualizations
- Lucide React icons

## Features

### Authentication
- Login page with 3 demo accounts:
  - `chro@hss.com` / `demo` — Chief HR Officer
  - `analyst@hss.com` / `demo` — People Analyst
  - `manager@hss.com` / `demo` — HR Manager
- Dark mode persisted in `localStorage` key `hss-dark-mode`
- Onboarding tour shown only on first login (`hss-tour-seen`)

### Dashboard Sections
- **Overview** — Morning briefing, active alerts strip, 3 category-grouped metric tiles
- **Executive View** — Same grid, clicking a tile shows AdvancedAnalyticsView
- **Reports** — ReportGeneratorView with AI-powered narrative
- **AI Copilot** — Chat interface for natural language HR data queries
- **Flight Risk** — ML-style heatmap of attrition risk by dept/factor
- **Scenario Planner** — Slider-based workforce projection modeller

### UI improvements over original
- Category section headers (Compliance & Operations, Workforce Health, Talent & Recruitment)
- Collapsible icon-rail sidebar
- Press micro-animation on dashboard tiles
- Sparkline mini-charts on every tile with large KPI numbers
- Glassmorphism tooltips in all Recharts components
- Dark mode persisted across sessions
- Morning briefing hero banner with daily insights
- 4-step onboarding tour modal

## File structure
```
artifacts/hr-dashboard/src/
├── App.tsx                      # Auth, routing, dark mode, tour flag
├── types.ts                     # TypeScript interfaces
├── constants.tsx                # DASHBOARD_ITEMS, ORG_NAME
├── index.css                    # Animations, CSS utilities
├── data/
│   └── mockData.ts              # OPERATIONAL_ALERTS, REPORT_DATA
└── components/
    ├── LoginPage.tsx
    ├── Sidebar.tsx
    ├── Header.tsx
    ├── Footer.tsx
    ├── DashboardGrid.tsx        # Category headers, alerts strip
    ├── DashboardTile.tsx        # Micro-interactions, sparklines
    ├── MorningBriefing.tsx
    ├── OnboardingTour.tsx
    ├── SectionGuide.tsx
    ├── DetailView.tsx           # Filter sidebar + glassmorphism tooltips
    ├── MetricDetailView.tsx     # Tabbed: overview/trends/report
    ├── AdvancedAnalyticsView.tsx# Large KPIs + radar chart
    ├── ReportGeneratorView.tsx  # Export text reports
    ├── AICopilotView.tsx        # Chat interface with chart responses
    ├── FlightRiskHeatmap.tsx    # Dept × factor heatmap
    ├── ScenarioCanvas.tsx       # Workforce modelling sliders
    ├── OvertimeView.tsx         # Specialized overtime deep-dive
    ├── AnalyticsView.tsx
    └── UnderConstructionView.tsx
```

## Organization constant
All "[Organization Name]" placeholders replaced with `ORG_NAME = 'HSS Health Network'` from `constants.tsx`.
