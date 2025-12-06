import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface CreateAccessGrantModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAccessGrantModal: React.FC<CreateAccessGrantModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    granted_to: '',
    can_access_user: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/v1/admin/users/', {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Filter out Super Admins and Site Admins (can't grant access to/from them)
          const filteredUsers = (data.results || []).filter(
            (user: User) => !['super_admin', 'firm_admin'].includes(user.role)
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.granted_to || !formData.can_access_user) {
      setError('Please select both users');
      return;
    }

    if (formData.granted_to === formData.can_access_user) {
      setError('Cannot grant access to themselves');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/admin/access-grants/', {
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
        if (typeof data === 'string') {
          setError(data);
        } else if (data.non_field_errors) {
          setError(data.non_field_errors[0]);
        } else {
          setError(data.detail || 'Failed to create access grant');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get available target users based on granted_to user's role
  const getAvailableTargetUsers = () => {
    if (!formData.granted_to) return users;

    const grantedToUser = users.find((u) => u.id === formData.granted_to);
    if (!grantedToUser) return users;

    // Managing Lawyer can access Managing Lawyer, Lawyer, Paralegal
    if (grantedToUser.role === 'managing_lawyer') {
      return users.filter((u) =>
        ['managing_lawyer', 'lawyer', 'paralegal'].includes(u.role)
      );
    }

    // Lawyer can access Lawyer, Paralegal
    if (grantedToUser.role === 'lawyer') {
      return users.filter((u) => ['lawyer', 'paralegal'].includes(u.role));
    }

    // Paralegal can only access Paralegal
    if (grantedToUser.role === 'paralegal') {
      return users.filter((u) => u.role === 'paralegal');
    }

    return users;
  };

  const availableTargetUsers = getAvailableTargetUsers();

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      managing_lawyer: 'Managing Lawyer',
      lawyer: 'Lawyer',
      paralegal: 'Paralegal',
    };
    return labels[role] || role;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Grant Access</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Allow a user to view another user's data
              </p>
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
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Access Rules</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Managing Lawyers can access Managing Lawyers, Lawyers, and Paralegals</li>
                  <li>Lawyers can access Lawyers and Paralegals</li>
                  <li>Paralegals can access other Paralegals</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Grant To */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Grant Access To <span className="text-red-500">*</span>
              </label>
              <select
                name="granted_to"
                value={formData.granted_to}
                onChange={handleChange}
                className={componentClasses.input.base}
                required
              >
                <option value="">Select user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({getRoleLabel(user.role)}) - {user.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                This user will be able to view the target user's data
              </p>
            </div>

            {/* Arrow Visual */}
            {formData.granted_to && (
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
            )}

            {/* Can Access User */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                Can Access <span className="text-red-500">*</span>
              </label>
              <select
                name="can_access_user"
                value={formData.can_access_user}
                onChange={handleChange}
                className={componentClasses.input.base}
                required
                disabled={!formData.granted_to}
              >
                <option value="">
                  {formData.granted_to ? 'Select target user...' : 'Select "Grant To" user first'}
                </option>
                {availableTargetUsers
                  .filter((u) => u.id !== formData.granted_to)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({getRoleLabel(user.role)}) - {user.email}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                The target user whose data will be accessible
              </p>
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
            {loading ? 'Granting...' : 'Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccessGrantModal;



