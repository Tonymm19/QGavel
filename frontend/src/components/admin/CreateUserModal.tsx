import { API_ENDPOINTS } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface Organization {
  id: string;
  name: string;
}

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onSuccess,
  currentUserRole,
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    organization: '',
    phone: '',
    role: 'paralegal',
    timezone: 'America/Chicago',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = currentUserRole === 'super_admin';

  // Fetch organizations (only for Super Admin)
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchOrganizations = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.adminOrganizations(), {
            headers: { Authorization: `Token ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setOrganizations(data.results || []);
          }
        } catch (error) {
          console.error('Error fetching organizations:', error);
        }
      };
      fetchOrganizations();
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (isSuperAdmin && !formData.organization) {
      setError('Please select an organization');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Site Admins don't send organization (it's set automatically on backend)
      const payload = isSuperAdmin
        ? formData
        : { ...formData, organization: undefined };

      const response = await fetch(API_ENDPOINTS.adminUsers(), {
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
        const data = await response.json();
        if (data.email) {
          setError(data.email[0]);
        } else if (data.password) {
          setError(data.password[0]);
        } else {
          setError(data.detail || 'Failed to create user');
        }
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
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create User</h2>
              <p className="text-sm text-slate-600 mt-0.5">Add a new user to the system</p>
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="user@example.com"
                required
              />
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
                  placeholder="John"
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
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Organization (Super Admin only) */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Organization <span className="text-red-500">*</span>
                </label>
                <select
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className={componentClasses.input.base}
                  required
                >
                  <option value="">Select organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={componentClasses.input.base}
                placeholder="Re-enter password"
                required
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
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;



