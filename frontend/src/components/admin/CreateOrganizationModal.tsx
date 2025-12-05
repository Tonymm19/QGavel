import { API_ENDPOINTS } from '../../config/api';
import React, { useState } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface CreateOrganizationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.adminOrganizations(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to create organization');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create Organization</h2>
              <p className="text-sm text-slate-600 mt-0.5">Add a new law firm or organization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="e.g., Smith & Associates Law Firm"
                required
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Address Line 1
              </label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="Street address"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Address Line 2
              </label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="Suite, floor, etc."
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-900 mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={componentClasses.input.base}
                  placeholder="Chicago"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={componentClasses.input.base}
                  placeholder="IL"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className={componentClasses.input.base}
                  placeholder="60601"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="(312) 555-0100"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className={componentClasses.button.secondary}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={componentClasses.button.primary}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;



