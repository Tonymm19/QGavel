import React from 'react';
import { 
  Home, 
  Calendar, 
  Search, 
  BookOpen, 
  Settings, 
  FileText,
  AlertTriangle,
  Clock,
  Gavel,
  Scale,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, userRole }) => {
  const isAdmin = userRole === 'super_admin' || userRole === 'firm_admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'cases', label: 'Cases', icon: FileText },
    { id: 'rules', label: 'Rules & Research', icon: BookOpen },
    { id: 'judges', label: 'Judges', icon: Gavel },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'search', label: 'Advanced Search', icon: Search },
  ];

  const secondaryItems = [
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
    ...(userRole === 'super_admin' ? [{ id: 'billing', label: 'Billing', icon: CreditCard }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`transition-all duration-300 bg-slate-900 border-r border-slate-800 ${
      isOpen ? 'w-64' : 'w-0 lg:w-64'
    } overflow-hidden`}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Precedentum</h2>
              <p className="text-xs text-slate-400">Court Compliance</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-slate-800">
            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;