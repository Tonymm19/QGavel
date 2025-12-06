import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface Organization {
  id: string;
  name: string;
}

interface CreateSubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({ onClose, onSuccess }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    organization: '',
    licensed_users: '1',
    monthly_rate: '',
    billing_cycle_type: 'monthly',
    billing_day: '',
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    status: 'active',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/admin/organizations/', {
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
    }
  };

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
      };

      const response = await fetch('http://localhost:8000/api/v1/admin/subscriptions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setErrors({ general: 'Failed to create subscription' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Create Subscription</h2>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Organization *
            </label>
            <select
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className={componentClasses.input}
              required
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organization && (
              <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
            )}
          </div>

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
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubscriptionModal;


