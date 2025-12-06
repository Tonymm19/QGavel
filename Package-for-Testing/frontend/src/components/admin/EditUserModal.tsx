import React, { useState } from 'react';
import { X, UserCog, AlertCircle } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  timezone: string;
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSuccess,
  currentUserRole,
}) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    role: user.role,
    timezone: user.timezone,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = currentUserRole === 'super_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name || !formData.last_name) {
      setError('First name and last name are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/admin/users/${user.id}/`, {
        method: 'PATCH',
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
        setError(data.detail || 'Failed to update user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Available roles based on current user
  const availableRoles = isSuperAdmin
    ? [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'firm_admin', label: 'Site Admin' },
        { value: 'managing_lawyer', label: 'Managing Lawyer' },
        { value: 'lawyer', label: 'Lawyer' },
        { value: 'paralegal', label: 'Paralegal' },
      ]
    : [
        { value: 'firm_admin', label: 'Site Admin' },
        { value: 'managing_lawyer', label: 'Managing Lawyer' },
        { value: 'lawyer', label: 'Lawyer' },
        { value: 'paralegal', label: 'Paralegal' },
      ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserCog className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
              <p className="text-sm text-slate-600 mt-0.5">{user.email}</p>
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
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email}
                className={`${componentClasses.input.base} bg-slate-50 cursor-not-allowed`}
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={componentClasses.input.base}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={componentClasses.input.base}
                  required
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

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={componentClasses.input.base}
                required
              >
                {availableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={componentClasses.input.base}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;



