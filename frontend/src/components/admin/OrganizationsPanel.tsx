import { API_ENDPOINTS } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, Phone, Edit2, Users, Calendar, CreditCard, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { componentClasses, getIconContainerClass } from '../../lib/theme';
import CreateOrganizationModal from './CreateOrganizationModal';
import EditOrganizationModal from './EditOrganizationModal';

interface Organization {
  id: string;
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  is_active: boolean;
  user_count: number;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  organization: string;
  licensed_users: number;
  active_user_count: number;
  can_add_user: boolean;
  is_at_limit: boolean;
  monthly_rate: string;
  billing_cycle_type: string;
  status: string;
}

const OrganizationsPanel: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.adminOrganizations(), {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.adminSubscriptions(), {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const subsMap: Record<string, Subscription> = {};
        (data.results || []).forEach((sub: Subscription) => {
          subsMap[sub.organization] = sub;
        });
        setSubscriptions(subsMap);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchSubscriptions();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchOrganizations();
  };

  const handleEditSuccess = () => {
    setEditingOrg(null);
    fetchOrganizations();
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
        <div className="text-slate-600">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Organizations</h2>
          <p className="text-sm text-slate-600 mt-1">
            {organizations.length} organization{organizations.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={componentClasses.button.primary}
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </button>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No organizations yet</h3>
          <p className="text-slate-600 mb-4">Get started by creating your first organization.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className={componentClasses.button.primary}
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className={`${componentClasses.card} hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={getIconContainerClass('indigo')}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{org.name}</h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {org.city}, {org.state}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingOrg(org)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit organization"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                {org.address_line1 && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-slate-700">
                      <div>{org.address_line1}</div>
                      {org.address_line2 && <div>{org.address_line2}</div>}
                      <div>
                        {org.city}, {org.state} {org.zip_code}
                      </div>
                    </div>
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{org.phone}</span>
                  </div>
                )}
              </div>

              {/* Subscription Info */}
              {subscriptions[org.id] && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-900">Subscription</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">License Usage:</span>
                      <span className={`font-medium ${subscriptions[org.id].is_at_limit ? 'text-amber-600' : 'text-slate-900'}`}>
                        {subscriptions[org.id].active_user_count} / {subscriptions[org.id].licensed_users}
                        {subscriptions[org.id].is_at_limit && (
                          <AlertCircle className="w-3 h-3 inline ml-1 text-amber-600" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Monthly Rate:</span>
                      <span className="font-medium text-slate-900 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {parseFloat(subscriptions[org.id].monthly_rate).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        subscriptions[org.id].status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : subscriptions[org.id].status === 'trial'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {subscriptions[org.id].status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {subscriptions[org.id].status.charAt(0).toUpperCase() + subscriptions[org.id].status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {org.user_count} user{org.user_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Created {formatDate(org.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editingOrg && (
        <EditOrganizationModal
          organization={editingOrg}
          onClose={() => setEditingOrg(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default OrganizationsPanel;


