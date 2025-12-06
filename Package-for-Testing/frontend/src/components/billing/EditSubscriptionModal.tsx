import React, { useState } from 'react';
import { X } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface Subscription {
  id: string;
  organization: string;
  organization_name: string;
  licensed_users: number;
  monthly_rate: string;
  billing_cycle_type: string;
  billing_day: number | null;
  contract_start_date: string;
  contract_end_date: string | null;
  status: string;
  notes: string;
}

interface EditSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
  onSuccess: () => void;
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  subscription,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    licensed_users: subscription.licensed_users.toString(),
    monthly_rate: subscription.monthly_rate,
    billing_cycle_type: subscription.billing_cycle_type,
    billing_day: subscription.billing_day?.toString() || '',
    contract_start_date: subscription.contract_start_date,
    contract_end_date: subscription.contract_end_date || '',
    status: subscription.status,
    notes: subscription.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        licensed_users: parseInt(formData.licensed_users),
        monthly_rate: parseFloat(formData.monthly_rate),
        billing_day: formData.billing_day ? parseInt(formData.billing_day) : null,
        contract_end_date: formData.contract_end_date || null,
        organization: subscription.organization,
      };

      const response = await fetch(
        `http://localhost:8000/api/v1/admin/subscriptions/${subscription.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setErrors({ general: 'Failed to update subscription' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Edit Subscription</h2>
            <p className="text-sm text-slate-600 mt-1">{subscription.organization_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Licensed Users *
              </label>
              <input
                type="number"
                min="1"
                value={formData.licensed_users}
                onChange={(e) => setFormData({ ...formData, licensed_users: e.target.value })}
                className={componentClasses.input}
                required
              />
              {errors.licensed_users && (
                <p className="mt-1 text-sm text-red-600">{errors.licensed_users}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Rate ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                className={componentClasses.input}
                required
              />
              {errors.monthly_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.monthly_rate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Billing Cycle *
              </label>
              <select
                value={formData.billing_cycle_type}
                onChange={(e) => setFormData({ ...formData, billing_cycle_type: e.target.value })}
                className={componentClasses.input}
                required
              >
                <option value="monthly">Monthly</option>
                <option value="anniversary">Anniversary</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.billing_cycle_type === 'anniversary' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Billing Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.billing_day}
                  onChange={(e) => setFormData({ ...formData, billing_day: e.target.value })}
                  className={componentClasses.input}
                />
                {errors.billing_day && (
                  <p className="mt-1 text-sm text-red-600">{errors.billing_day}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contract Start Date *
              </label>
              <input
                type="date"
                value={formData.contract_start_date}
                onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                className={componentClasses.input}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contract End Date
              </label>
              <input
                type="date"
                value={formData.contract_end_date}
                onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                className={componentClasses.input}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={componentClasses.input}
              required
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={componentClasses.input}
              rows={3}
              placeholder="Internal notes about this subscription"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={componentClasses.button.secondary}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={componentClasses.button.primary}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionModal;


