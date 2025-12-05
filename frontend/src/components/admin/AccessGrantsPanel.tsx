import { API_ENDPOINTS } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, User, ArrowRight, X as XIcon } from 'lucide-react';
import { componentClasses, getIconContainerClass } from '../../lib/theme';
import CreateAccessGrantModal from './CreateAccessGrantModal';

interface AccessGrant {
  id: string;
  organization: string;
  organization_name: string;
  granted_by: string;
  granted_by_name: string;
  granted_to: string;
  granted_to_name: string;
  can_access_user: string;
  can_access_user_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AccessGrantsPanelProps {
  userRole: string;
}

const AccessGrantsPanel: React.FC<AccessGrantsPanelProps> = ({ userRole: _userRole }) => {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.adminAccessGrants(), {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGrants(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching access grants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchGrants();
  };

  const handleRevoke = async (grantId: string) => {
    if (!confirm('Are you sure you want to revoke this access grant?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        API_ENDPOINTS.adminAccessGrantDetail(grantId),
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok || response.status === 204) {
        fetchGrants();
      } else {
        alert('Failed to revoke access grant');
      }
    } catch (error) {
      console.error('Error revoking access grant:', error);
      alert('Network error. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading access grants...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Access Grants</h2>
          <p className="text-sm text-slate-600 mt-1">
            {grants.length} active grant{grants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={componentClasses.button.primary}
        >
          <Plus className="w-4 h-4" />
          Grant Access
        </button>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">About Access Grants</h3>
            <p className="text-sm text-blue-700 mt-1">
              Access grants allow users to view cases and deadlines belonging to other users. Managing
              Lawyers can access Lawyers and Paralegals. Lawyers can access other Lawyers and
              Paralegals.
            </p>
          </div>
        </div>
      </div>

      {/* Grants List */}
      {grants.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No access grants yet</h3>
          <p className="text-slate-600 mb-4">
            Grant access to allow users to view each other's data.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className={componentClasses.button.primary}
          >
            <Plus className="w-4 h-4" />
            Grant Access
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map((grant) => (
            <div
              key={grant.id}
              className={`${componentClasses.card} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                {/* Grant Flow */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Granted To */}
                  <div className="flex items-center gap-3">
                    <div className={getIconContainerClass('green')}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{grant.granted_to_name}</p>
                      <p className="text-xs text-slate-600">Can access</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />

                  {/* Can Access User */}
                  <div className="flex items-center gap-3">
                    <div className={getIconContainerClass('indigo')}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{grant.can_access_user_name}</p>
                      <p className="text-xs text-slate-600">Target user</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Granted by</p>
                    <p className="text-sm font-medium text-slate-900">{grant.granted_by_name}</p>
                    <p className="text-xs text-slate-500">{formatDate(grant.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleRevoke(grant.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title="Revoke access"
                  >
                    <XIcon className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateAccessGrantModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default AccessGrantsPanel;



