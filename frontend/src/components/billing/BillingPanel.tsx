import React, { useState } from 'react';
import { CreditCard, Receipt, BarChart3 } from 'lucide-react';
import SubscriptionsTab from './SubscriptionsTab';
import BillingRecordsTab from './BillingRecordsTab';
import BillingDashboardTab from './BillingDashboardTab';

type TabType = 'dashboard' | 'subscriptions' | 'billing-records';

const BillingPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'subscriptions' as TabType, label: 'Subscriptions', icon: CreditCard },
    { id: 'billing-records' as TabType, label: 'Billing Records', icon: Receipt },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BillingDashboardTab />;
      case 'subscriptions':
        return <SubscriptionsTab />;
      case 'billing-records':
        return <BillingRecordsTab />;
      default:
        return <BillingDashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Billing & Subscriptions</h1>
          <p className="text-slate-600 mt-1">Manage organization subscriptions and billing</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BillingPanel;


