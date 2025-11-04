import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ToolList } from './components/ToolList';
import { CheckInOut } from './components/CheckInOut';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { DataProvider, useData } from './context/DataContext';
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';

type View = 'dashboard' | 'tools' | 'checkinout' | 'reports' | 'settings' | 'profile';

const AppLayout: React.FC = () => {
  const { authenticatedUser } = useData();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!authenticatedUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={setCurrentView} />;
      case 'tools':
        return <ToolList />;
      case 'checkinout':
        return <CheckInOut />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-brand-background text-brand-text-primary">
      {/* Header fijo */}
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        setView={setCurrentView}
      />

      {/* Sidebar fijo */}
      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Contenedor principal con scroll */}
      <div
        className={`
          fixed
          top-12 sm:top-14 md:top-16
          bottom-0
          right-0
          transition-all duration-300
          ${isSidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-72'}
        `}
      >
        <main className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppLayout />
    </DataProvider>
  );
};

export default App;