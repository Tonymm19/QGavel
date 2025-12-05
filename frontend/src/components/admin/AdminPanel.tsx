import React, { useState } from 'react';
import { Users, Building2, ShieldCheck } from 'lucide-react';
import OrganizationsPanel from './OrganizationsPanel';
import UsersPanel from './UsersPanel';
import AccessGrantsPanel from './AccessGrantsPanel';

type AdminTab = 'organizations' | 'users' | 'access-grants';

interface AdminPanelProps {
  userRole: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(
    userRole === 'super_admin' ? 'organizations' : 'users'
  );

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage organizations, users, and access controls
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">
              {isSuperAdmin ? 'Super Admin' : 'Site Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="px-6">
          <div className="flex gap-1">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('organizations')}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors
                  border-b-2 -mb-px
                  ${
                    activeTab === 'organizations'
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                <Building2 className="w-4 h-4" />
                Organizations
              </button>
            )}
            <button
              onClick={() => setActiveTab('users')}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors
                border-b-2 -mb-px
                ${
                  activeTab === 'users'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('access-grants')}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors
                border-b-2 -mb-px
                ${
                  activeTab === 'access-grants'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              <ShieldCheck className="w-4 h-4" />
              Access Grants
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'organizations' && isSuperAdmin && (
          <OrganizationsPanel />
        )}
        {activeTab === 'users' && <UsersPanel userRole={userRole} />}
        {activeTab === 'access-grants' && <AccessGrantsPanel userRole={userRole} />}
      </div>
    </div>
  );
};

export default AdminPanel;



