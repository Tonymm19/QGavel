import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EnhancedDashboard from './components/EnhancedDashboard';
import RulesSearch from './components/RulesSearch';
import JudgeProfiles from './components/JudgeProfiles';
import DeadlineTracker from './components/DeadlineTracker';
import CasesPanel from './components/CasesPanel';
import AdminPanel from './components/admin/AdminPanel';
import BillingPanel from './components/billing/BillingPanel';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function AppContent() {
  const { isDarkMode } = useTheme();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedDashboard onNavigate={setActiveTab} />;
      case 'deadlines':
        return <DeadlineTracker />;
      case 'rules':
        return <RulesSearch />;
      case 'judges':
        return <JudgeProfiles />;
      case 'cases':
        return <CasesPanel />;
      case 'alerts':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Alerts & Notifications
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Advanced alert management coming soon...
              </p>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Calendar Integration
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Calendar integration features coming soon...
              </p>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Search
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Advanced search capabilities coming soon...
              </p>
            </div>
          </div>
        );
      case 'admin':
        return <AdminPanel userRole={user?.role || ''} />;
      case 'billing':
        return <BillingPanel />;
      case 'settings':
        return (
          <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                User settings and preferences coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        userRole={user?.role}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
