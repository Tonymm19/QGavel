import { API_ENDPOINTS } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Building2, Users, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { componentClasses, getIconContainerClass } from '../../lib/theme';
import CreateSubscriptionModal from './CreateSubscriptionModal';
import EditSubscriptionModal from './EditSubscriptionModal';

interface Subscription {
  id: string;
  organization: string;
  organization_name: string;
  licensed_users: number;
  active_user_count: number;
  can_add_user: boolean;
  is_at_limit: boolean;
  monthly_rate: string;
  billing_cycle_type: string;
  billing_day: number | null;
  contract_start_date: string;
  contract_end_date: string | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const SubscriptionsTab: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.adminSubscriptions(), {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchSubscriptions();
  };

  const handleEditSuccess = () => {
    setEditingSubscription(null);
    fetchSubscriptions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'trial':
        return 'bg-blue-100 text-blue-700';
      case 'suspended':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Subscriptions</h2>
          <p className="text-sm text-slate-600 mt-1">
            {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={componentClasses.button.primary}
        >
          <Plus className="w-4 h-4" />
          Create Subscription
        </button>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className={`${componentClasses.card} text-center py-12`}>
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No subscriptions yet</h3>
          <p className="text-slate-600 mb-4">Create your first subscription to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className={componentClasses.button.primary}
          >
            <Plus className="w-4 h-4" />
            Create Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className={`${componentClasses.card} hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={getIconContainerClass('indigo')}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{subscription.organization_name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(subscription.status)}`}>
                      {subscription.status === 'active' && <CheckCircle className="w-3 h-3" />}
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSubscription(subscription)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit subscription"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                {/* License Usage */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      License Usage
                    </span>
                    {subscription.is_at_limit && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        At Limit
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold ${subscription.is_at_limit ? 'text-amber-600' : 'text-slate-900'}`}>
                      {subscription.active_user_count}
                    </span>
                    <span className="text-slate-600 text-sm mb-1">/ {subscription.licensed_users} licenses</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        subscription.is_at_limit ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min((subscription.active_user_count / subscription.licensed_users) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Monthly Rate
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${parseFloat(subscription.monthly_rate).toFixed(2)}
                  </span>
                </div>

                {/* Billing Cycle */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Billing Cycle</span>
                  <span className="text-slate-900">
                    {subscription.billing_cycle_type.charAt(0).toUpperCase() + subscription.billing_cycle_type.slice(1)}
                    {subscription.billing_day && ` (Day ${subscription.billing_day})`}
                  </span>
                </div>

                {/* Contract Dates */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Contract Period
                  </span>
                  <span className="text-slate-900">
                    {formatDate(subscription.contract_start_date)}
                    {subscription.contract_end_date && ` - ${formatDate(subscription.contract_end_date)}`}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Created {formatDate(subscription.created_at)}</span>
                <span>Updated {formatDate(subscription.updated_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateSubscriptionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default SubscriptionsTab;


