import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  Gavel,
  Scale,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

interface DashboardMetrics {
  upcoming_deadlines: {
    next_7_days: number;
    next_30_days: number;
    next_60_days: number;
  };
  overdue_deadlines: number;
  total_active_cases: number;
  cases_by_status: Array<{ status: string; count: number }>;
  cases_by_court: Array<{ court__name: string; count: number }>;
  deadline_timeline: Array<{
    id: string;
    title: string;
    due_date: string;
    status: string;
    case_name: string | null;
  }>;
  activity_trend: Array<{
    date: string;
    cases: number;
    deadlines: number;
    total: number;
  }>;
  recent_activity: Array<{
    type: string;
    title: string;
    date: string;
    id: string;
  }>;
}

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface EnhancedDashboardProps {
  onNavigate?: (tab: string) => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ onNavigate: _onNavigate }) => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/dashboard/metrics/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your cases, deadlines, and recent activity</p>
      </div>

      {/* Quick Action Buttons - Commented out for now */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button 
          onClick={() => onNavigate?.('cases')}
          className={`${componentClasses.button.primary} justify-center`}
        >
          <Plus className="h-5 w-5" />
          <span>Add New Case</span>
        </button>
        <button 
          onClick={() => onNavigate?.('deadlines')}
          className={`${componentClasses.button.primary} justify-center`}
        >
          <Plus className="h-5 w-5" />
          <span>Add New Deadline</span>
        </button>
        <button 
          onClick={() => onNavigate?.('deadlines')}
          className={`${componentClasses.button.secondary} justify-center`}
        >
          <Calendar className="h-5 w-5" />
          <span>View All Deadlines</span>
        </button>
        <button 
          onClick={() => onNavigate?.('rules')}
          className={`${componentClasses.button.secondary} justify-center`}
        >
          <Search className="h-5 w-5" />
          <span>Search Rules</span>
        </button>
      </div> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Upcoming Deadlines Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Upcoming Deadlines</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Next 7 days</span>
              <span className="text-lg font-bold text-slate-900">{metrics.upcoming_deadlines.next_7_days}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Next 30 days</span>
              <span className="text-lg font-bold text-slate-900">{metrics.upcoming_deadlines.next_30_days}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Next 60 days</span>
              <span className="text-lg font-bold text-slate-900">{metrics.upcoming_deadlines.next_60_days}</span>
            </div>
          </div>
        </div>

        {/* Overdue Deadlines Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Overdue Deadlines</h3>
          <p className="text-4xl font-bold text-slate-900">{metrics.overdue_deadlines}</p>
          {metrics.overdue_deadlines > 0 && (
            <p className="text-xs text-red-600 mt-2">Requires immediate attention</p>
          )}
          {metrics.overdue_deadlines === 0 && (
            <p className="text-xs text-green-600 mt-2">All deadlines on track</p>
          )}
        </div>

        {/* Active Cases Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Active Cases</h3>
          <p className="text-4xl font-bold text-slate-900">{metrics.total_active_cases}</p>
          <p className="text-xs text-slate-500 mt-2">Currently in progress</p>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Recent Updates</h3>
          <p className="text-4xl font-bold text-slate-900">{metrics.recent_activity.length}</p>
          <p className="text-xs text-slate-500 mt-2">Last 24 hours</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Activity Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.activity_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cases"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 4 }}
                name="Cases"
              />
              <Line
                type="monotone"
                dataKey="deadlines"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 4 }}
                name="Deadlines"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cases by Court Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Gavel className="h-5 w-5 text-green-600" />
            Cases by Court
          </h3>
          {metrics.cases_by_court.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.cases_by_court}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || 'Unknown'}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="court__name"
                >
                  {metrics.cases_by_court.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500">
              No case data available
            </div>
          )}
        </div>
      </div>

      {/* Deadline Timeline and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadline Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Deadline Timeline (Next 60 Days)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {metrics.deadline_timeline.length > 0 ? (
              metrics.deadline_timeline.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
                >
                  <div className="flex-shrink-0 mt-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{deadline.title}</p>
                    {deadline.case_name && (
                      <p className="text-xs text-slate-500 truncate">{deadline.case_name}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">{formatRelativeDate(deadline.due_date)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        deadline.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {deadline.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">No upcoming deadlines</div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {metrics.recent_activity.map((activity, index) => (
              <div
                key={`${activity.type}-${activity.id}-${index}`}
                className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
              >
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'case' && <FileText className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'deadline' && <Clock className="h-4 w-4 text-amber-600" />}
                  {activity.type === 'rule' && <Scale className="h-4 w-4 text-green-600" />}
                  {activity.type === 'procedure' && <Gavel className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(activity.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;


