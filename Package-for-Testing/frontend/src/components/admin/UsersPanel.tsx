import React, { useState, useEffect } from 'react';
import {
  Plus,
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Search,
  Edit2,
  UserX,
} from 'lucide-react';
import { componentClasses, getIconContainerClass } from '../../lib/theme';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  organization: string;
  organization_name: string;
  phone: string;
  role: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface UsersPanelProps {
  userRole: string;
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
  firm_admin: 'bg-blue-100 text-blue-800 border-blue-200',
  managing_lawyer: 'bg-green-100 text-green-800 border-green-200',
  lawyer: 'bg-amber-100 text-amber-800 border-amber-200',
  paralegal: 'bg-slate-100 text-slate-800 border-slate-200',
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  firm_admin: 'Site Admin',
  managing_lawyer: 'Managing Lawyer',
  lawyer: 'Lawyer',
  paralegal: 'Paralegal',
};

const UsersPanel: React.FC<UsersPanelProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/admin/users/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || []);
        setFilteredUsers(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.organization_name?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchUsers();
  };

  const handleEditSuccess = () => {
    setEditingUser(null);
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          <p className="text-sm text-slate-600 mt-1">
            {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className={componentClasses.button.primary}>
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or organization..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="firm_admin">Site Admin</option>
          <option value="managing_lawyer">Managing Lawyer</option>
          <option value="lawyer">Lawyer</option>
          <option value="paralegal">Paralegal</option>
        </select>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          {searchQuery || roleFilter !== 'all' ? (
            <>
              <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No users found</h3>
              <p className="text-slate-600">Try adjusting your search or filters.</p>
            </>
          ) : (
            <>
              <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No users yet</h3>
              <p className="text-slate-600 mb-4">Get started by creating your first user.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={componentClasses.button.primary}
              >
                <Plus className="w-4 h-4" />
                Create User
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`${componentClasses.card} hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={getIconContainerClass('indigo')}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{user.full_name}</h3>
                    <p className="text-sm text-slate-600 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  title="Edit user"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Role Badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                    roleColors[user.role] || roleColors.paralegal
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {roleLabels[user.role] || user.role}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {user.organization_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700 truncate">{user.organization_name}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          currentUserRole={userRole}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleEditSuccess}
          currentUserRole={userRole}
        />
      )}
    </div>
  );
};

export default UsersPanel;



