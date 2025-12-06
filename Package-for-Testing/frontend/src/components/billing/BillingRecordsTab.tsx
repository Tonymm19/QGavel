import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Receipt, Calendar, DollarSign, Building2, Search } from 'lucide-react';
import { componentClasses } from '../../lib/theme';
import CreateBillingRecordModal from './CreateBillingRecordModal';
import EditBillingRecordModal from './EditBillingRecordModal';

interface BillingRecord {
  id: string;
  subscription: string;
  subscription_organization: string;
  organization_id: string;
  billing_period_start: string;
  billing_period_end: string;
  amount_billed: string;
  amount_paid: string;
  balance_due: string;
  invoice_date: string | null;
  payment_received_date: string | null;
  payment_due_date: string | null;
  payment_cleared_date: string | null;
  reminder_sent_date: string | null;
  payment_status: string;
  invoice_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const BillingRecordsTab: React.FC = () => {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BillingRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchBillingRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/admin/billing-records/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBillingRecords(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching billing records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingRecords();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchBillingRecords();
  };

  const handleEditSuccess = () => {
    setEditingRecord(null);
    fetchBillingRecords();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'cleared':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch = record.subscription_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading billing records...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Billing Records</h2>
          <p className="text-sm text-slate-600 mt-1">
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={componentClasses.button.primary}
        >
          <Plus className="w-4 h-4" />
          Create Billing Record
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by organization or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cleared">Cleared</option>
          <option value="overdue">Overdue</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Billing Records Table */}
      {filteredRecords.length === 0 ? (
        <div className={`${componentClasses.card} text-center py-12`}>
          <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No billing records found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create your first billing record to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className={componentClasses.button.primary}
            >
              <Plus className="w-4 h-4" />
              Create Billing Record
            </button>
          )}
        </div>
      ) : (
        <div className={componentClasses.card}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Invoice #</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Billed</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Paid</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Balance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Due Date</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {record.subscription_organization}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.billing_period_start)} - {formatDate(record.billing_period_end)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {record.invoice_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right text-slate-900">
                      ${parseFloat(record.amount_billed).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-600">
                      ${parseFloat(record.amount_paid).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right">
                      <span className={parseFloat(record.balance_due) > 0 ? 'text-red-600' : 'text-green-600'}>
                        ${parseFloat(record.balance_due).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.payment_status)}`}>
                        {getStatusLabel(record.payment_status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(record.payment_due_date)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit billing record"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateBillingRecordModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editingRecord && (
        <EditBillingRecordModal
          billingRecord={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default BillingRecordsTab;


