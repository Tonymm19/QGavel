import React, { useState } from 'react';
import { X } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface BillingRecord {
  id: string;
  subscription: string;
  subscription_organization: string;
  billing_period_start: string;
  billing_period_end: string;
  amount_billed: string;
  amount_paid: string;
  invoice_date: string | null;
  payment_due_date: string | null;
  payment_received_date: string | null;
  payment_cleared_date: string | null;
  payment_status: string;
  invoice_number: string;
  notes: string;
}

interface EditBillingRecordModalProps {
  billingRecord: BillingRecord;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBillingRecordModal: React.FC<EditBillingRecordModalProps> = ({
  billingRecord,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    amount_billed: billingRecord.amount_billed,
    amount_paid: billingRecord.amount_paid,
    invoice_date: billingRecord.invoice_date || '',
    payment_due_date: billingRecord.payment_due_date || '',
    payment_received_date: billingRecord.payment_received_date || '',
    payment_cleared_date: billingRecord.payment_cleared_date || '',
    payment_status: billingRecord.payment_status,
    invoice_number: billingRecord.invoice_number,
    notes: billingRecord.notes || '',
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
        amount_billed: parseFloat(formData.amount_billed),
        amount_paid: parseFloat(formData.amount_paid),
        invoice_date: formData.invoice_date || null,
        payment_due_date: formData.payment_due_date || null,
        payment_received_date: formData.payment_received_date || null,
        payment_cleared_date: formData.payment_cleared_date || null,
      };

      const response = await fetch(
        `http://localhost:8000/api/v1/admin/billing-records/${billingRecord.id}/`,
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
      console.error('Error updating billing record:', error);
      setErrors({ general: 'Failed to update billing record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Edit Billing Record</h2>
            <p className="text-sm text-slate-600 mt-1">{billingRecord.subscription_organization}</p>
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

          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Billing Period:</span>{' '}
              {new Date(billingRecord.billing_period_start).toLocaleDateString()} -{' '}
              {new Date(billingRecord.billing_period_end).toLocaleDateString()}
            </p>
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
                Amount Paid ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                className={componentClasses.input}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className={componentClasses.input}
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
                Payment Received Date
              </label>
              <input
                type="date"
                value={formData.payment_received_date}
                onChange={(e) => setFormData({ ...formData, payment_received_date: e.target.value })}
                className={componentClasses.input}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Cleared Date
              </label>
              <input
                type="date"
                value={formData.payment_cleared_date}
                onChange={(e) => setFormData({ ...formData, payment_cleared_date: e.target.value })}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBillingRecordModal;


