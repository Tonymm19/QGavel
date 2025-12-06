import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface Subscription {
  id: string;
  organization_name: string;
}

interface CreateBillingRecordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBillingRecordModal: React.FC<CreateBillingRecordModalProps> = ({ onClose, onSuccess }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [formData, setFormData] = useState({
    subscription: '',
    billing_period_start: '',
    billing_period_end: '',
    amount_billed: '',
    amount_paid: '0',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_due_date: '',
    payment_status: 'pending',
    invoice_number: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/admin/subscriptions/', {
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
        amount_billed: parseFloat(formData.amount_billed),
        amount_paid: parseFloat(formData.amount_paid),
        payment_due_date: formData.payment_due_date || null,
      };

      const response = await fetch('http://localhost:8000/api/v1/admin/billing-records/', {
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
      console.error('Error creating billing record:', error);
      setErrors({ general: 'Failed to create billing record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Create Billing Record</h2>
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
              Subscription *
            </label>
            <select
              value={formData.subscription}
              onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
              className={componentClasses.input}
              required
            >
              <option value="">Select Subscription</option>
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.organization_name}
                </option>
              ))}
            </select>
            {errors.subscription && (
              <p className="mt-1 text-sm text-red-600">{errors.subscription}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Billing Period Start *
              </label>
              <input
                type="date"
                value={formData.billing_period_start}
                onChange={(e) => setFormData({ ...formData, billing_period_start: e.target.value })}
                className={componentClasses.input}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Billing Period End *
              </label>
              <input
                type="date"
                value={formData.billing_period_end}
                onChange={(e) => setFormData({ ...formData, billing_period_end: e.target.value })}
                className={componentClasses.input}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount Billed ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount_billed}
                onChange={(e) => setFormData({ ...formData, amount_billed: e.target.value })}
                className={componentClasses.input}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount Paid ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                className={componentClasses.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className={componentClasses.input}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={formData.payment_due_date}
                onChange={(e) => setFormData({ ...formData, payment_due_date: e.target.value })}
                className={componentClasses.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Status *
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className={componentClasses.input}
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cleared">Cleared</option>
                <option value="overdue">Overdue</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className={componentClasses.input}
                placeholder="e.g., INV-2024-001"
              />
            </div>
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
              placeholder="Additional notes about this billing record"
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
              {loading ? 'Creating...' : 'Create Billing Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBillingRecordModal;


