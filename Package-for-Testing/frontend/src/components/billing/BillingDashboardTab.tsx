import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { componentClasses } from '../../lib/theme';

interface DashboardMetrics {
  current_month_records: number;
  total_outstanding: number;
  overdue_count: number;
  overdue_records: Array<{
    id: string;
    organization: string;
    amount_due: number;
    due_date: string | null;
    billing_period: string;
  }>;
  payment_status_breakdown: Record<string, number>;
}

const BillingDashboardTab: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/billing/dashboard/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Unable to load dashboard metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={componentClasses.card}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">This Month</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.current_month_records}</p>
              <p className="text-xs text-slate-500">Billing Records</p>
            </div>
          </div>
        </div>

        <div className={componentClasses.card}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Outstanding</p>
              <p className="text-2xl font-bold text-slate-900">
                ${metrics.total_outstanding.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">Total Balance Due</p>
            </div>
          </div>
        </div>

        <div className={componentClasses.card}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.overdue_count}</p>
              <p className="text-xs text-slate-500">Past Due Date</p>
            </div>
          </div>
        </div>

        <div className={componentClasses.card}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Payment Status</p>
              <p className="text-2xl font-bold text-slate-900">
                {Object.keys(metrics.payment_status_breakdown).length}
              </p>
              <p className="text-xs text-slate-500">Active Statuses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      {Object.keys(metrics.payment_status_breakdown).length > 0 && (
        <div className={componentClasses.card}>
          <h3 className="font-semibold text-slate-900 mb-4">Payment Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.payment_status_breakdown).map(([status, count]) => (
              <div key={status} className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">{status}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Records */}
      {metrics.overdue_records.length > 0 && (
        <div className={componentClasses.card}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-900">Overdue Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Organization</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Billing Period</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Due Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Amount Due</th>
                </tr>
              </thead>
              <tbody>
                {metrics.overdue_records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">{record.organization}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{record.billing_period}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {record.due_date
                        ? new Date(record.due_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right text-red-600">
                      ${record.amount_due.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {metrics.overdue_records.length === 0 && (
        <div className={componentClasses.card}>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
            <p className="text-slate-600">No overdue payments at this time.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDashboardTab;


