import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OnboardingTour } from './components/OnboardingTour';
import { DashboardGrid } from './components/DashboardGrid';
import { DetailView } from './components/DetailView';
import { AdvancedAnalyticsView } from './components/AdvancedAnalyticsView';
import { MetricDetailView } from './components/MetricDetailView';
import { ReportGeneratorView } from './components/ReportGeneratorView';
import { UnderConstructionView } from './components/UnderConstructionView';
import { LoginPage } from './components/LoginPage';
import { AICopilotView } from './components/AICopilotView';
import { FlightRiskHeatmap } from './components/FlightRiskHeatmap';
import { ScenarioCanvas } from './components/ScenarioCanvas';
import { OvertimeView } from './components/OvertimeView';
import { DashboardItem, ViewTab, ViewMode } from './types';
import { Sidebar } from './components/Sidebar';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('global');
  const [constructionPageTitle, setConstructionPageTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('ytd');
  const [showTour, setShowTour] = useState(false);

  // Persist dark mode in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('hss-dark-mode') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('hss-dark-mode', String(isDarkMode)); }
    catch {}
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    // Only show tour on first-ever login
    try {
      if (!localStorage.getItem('hss-tour-seen')) {
        setShowTour(true);
        localStorage.setItem('hss-tour-seen', 'true');
      }
    } catch {
      setShowTour(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setSelectedItem(null);
    setCurrentTab('overview');
    setSearchTerm('');
  };

  const handleTileClick = (item: DashboardItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedItem(null);
    if (currentTab === 'construction') setCurrentTab('overview');
  };

  const handleTabChange = (tab: ViewTab) => {
    setCurrentTab(tab);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFooterNavigation = (page: string) => {
    setConstructionPageTitle(page);
    setCurrentTab('construction');
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    );
  }

  const renderMainContent = () => {
    if (selectedItem) {
      if (selectedItem.id === 'overtime') return <OvertimeView item={selectedItem} onBack={handleBack} isDarkMode={isDarkMode} dateRange={dateRange} />;
      if (currentTab === 'analytics') return <AdvancedAnalyticsView item={selectedItem} onBack={handleBack} isDarkMode={isDarkMode} dateRange={dateRange} />;
      if (currentTab === 'reports') return <MetricDetailView item={selectedItem} onBack={handleBack} isDarkMode={isDarkMode} dateRange={dateRange} />;
      return <DetailView item={selectedItem} onBack={handleBack} isDarkMode={isDarkMode} dateRange={dateRange} />;
    }

    switch (currentTab) {
      case 'team':
        return (
          <DashboardGrid
            onItemClick={handleTileClick}
            title="My Team Metrics"
            description="View metrics strictly limited to your direct reports and immediate organizational hierarchy."
            isDarkMode={isDarkMode}
            searchTerm={searchTerm}
            username={currentUser}
            dateRange={dateRange}
          />
        );
      case 'overview':
        return (
          <DashboardGrid
            onItemClick={handleTileClick}
            isDarkMode={isDarkMode}
            searchTerm={searchTerm}
            showAIBriefing
            username={currentUser}
            dateRange={dateRange}
          />
        );
      case 'analytics':
        return (
          <DashboardGrid
            onItemClick={handleTileClick}
            title="Executive View"
            description="Click any category to explore deep-dive analytics, benchmarks and AI-generated insights."
            isDarkMode={isDarkMode}
            searchTerm={searchTerm}
            username={currentUser}
          />
        );
      case 'reports':
        return <ReportGeneratorView isDarkMode={isDarkMode} />;
      case 'copilot':
        return <AICopilotView isDarkMode={isDarkMode} />;
      case 'flightrisk':
        return <FlightRiskHeatmap isDarkMode={isDarkMode} />;
      case 'scenarios':
        return <ScenarioCanvas isDarkMode={isDarkMode} />;
      case 'construction':
        return <UnderConstructionView title={constructionPageTitle} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Sidebar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          username={currentUser}
          onStartTour={() => setShowTour(true)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentTab={currentTab}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            username={currentUser}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <main className="flex-1 overflow-auto animate-fade-in" key={`${currentTab}-${selectedItem?.id ?? 'none'}`}>
            {renderMainContent()}
            {!selectedItem && <Footer onNavigate={handleFooterNavigation} />}
          </main>
        </div>
        {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
      </div>
    </div>
  );
};

export default App;
