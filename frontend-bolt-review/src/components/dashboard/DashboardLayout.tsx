import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Scale,
  LayoutDashboard,
  Briefcase,
  Users,
  Clock,
  Calendar,
  FileText,
  Gavel,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLawyer = profile?.role === 'lawyer' || profile?.role === 'admin';

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, show: true },
    { id: 'cases', name: 'Cases', icon: Briefcase, show: true },
    { id: 'clients', name: 'Clients', icon: Users, show: isLawyer },
    { id: 'judges', name: 'Judges', icon: Gavel, show: isLawyer },
    { id: 'time', name: 'Time & Billing', icon: Clock, show: isLawyer },
    { id: 'calendar', name: 'Calendar & Deadlines', icon: Calendar, show: true },
    { id: 'documents', name: 'Documents', icon: FileText, show: true },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900">LegalHub</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">LegalHub</h1>
                <p className="text-xs text-slate-600">Case Management</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            {profile?.role === 'admin' && (
              <button
                onClick={() => {
                  onTabChange('admin');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </button>
            )}
            <div className="mb-4 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-600 capitalize">{profile?.role || 'user'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
