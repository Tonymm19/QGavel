import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';
import { TermsAndConditions } from './components/auth/TermsAndConditions';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { CasesTab } from './components/cases/CasesTab';
import { ClientsTab } from './components/clients/ClientsTab';
import { JudgesTab } from './components/judges/JudgesTab';
import { TimeTab } from './components/time/TimeTab';
import { CalendarTab } from './components/calendar/CalendarTab';
import { DocumentsTab } from './components/documents/DocumentsTab';
import { AdminTab } from './components/admin/AdminTab';

function AppContent() {
  const { user, loading, needsTermsAcceptance, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (needsTermsAcceptance && user) {
    return (
      <TermsAndConditions
        userId={user.id}
        onAccept={refreshProfile}
        onDecline={signOut}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onTabChange={setActiveTab} />;
      case 'cases':
        return <CasesTab />;
      case 'clients':
        return <ClientsTab />;
      case 'judges':
        return <JudgesTab />;
      case 'time':
        return <TimeTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'documents':
        return <DocumentsTab />;
      case 'admin':
        return <AdminTab />;
      default:
        return <OverviewTab onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
