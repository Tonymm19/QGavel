import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Gavel,
} from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Case = Database['public']['Tables']['cases']['Row'];
type Deadline = Database['public']['Tables']['case_deadlines']['Row'];
type TimeEntry = Database['public']['Tables']['time_entries']['Row'];

interface OverviewTabProps {
  onTabChange?: (tab: string) => void;
}

interface Stats {
  totalCases: number;
  activeCases: number;
  totalClients: number;
  judgesTracked: number;
  upcomingDeadlines: number;
  unbilledHours: number;
  totalRevenue: number;
}

export function OverviewTab({ onTabChange }: OverviewTabProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCases: 0,
    activeCases: 0,
    totalClients: 0,
    judgesTracked: 0,
    upcomingDeadlines: 0,
    unbilledHours: 0,
    totalRevenue: 0,
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const isLawyer = profile?.role === 'lawyer' || profile?.role === 'admin';

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      const casesQuery = supabase.from('cases').select('*');
      const { data: cases } = await casesQuery;

      const activeCases = cases?.filter((c) => c.status === 'open') || [];

      let clientCount = 0;
      if (isLawyer) {
        const { count } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        clientCount = count || 0;
      }

      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);

      const { data: deadlines } = await supabase
        .from('case_deadlines')
        .select('*')
        .eq('completed', false)
        .gte('deadline_date', today.toISOString())
        .lte('deadline_date', nextMonth.toISOString())
        .order('deadline_date', { ascending: true })
        .limit(5);

      let unbilledHours = 0;
      let totalRevenue = 0;
      let judgesCount = 0;
      if (isLawyer) {
        const { data: timeEntries } = await supabase
          .from('time_entries')
          .select('*');

        timeEntries?.forEach((entry: TimeEntry) => {
          if (!entry.billed && entry.billable) {
            unbilledHours += Number(entry.hours);
          }
          if (entry.billed) {
            totalRevenue += Number(entry.hours) * Number(entry.hourly_rate);
          }
        });

        const { count } = await supabase
          .from('judges')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        judgesCount = count || 0;
      }

      setStats({
        totalCases: cases?.length || 0,
        activeCases: activeCases.length,
        totalClients: clientCount,
        judgesTracked: judgesCount,
        upcomingDeadlines: deadlines?.length || 0,
        unbilledHours,
        totalRevenue,
      });

      setRecentCases(cases?.slice(0, 5) || []);
      setUpcomingDeadlines(deadlines || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color,
    onClick,
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-900' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-light text-slate-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-slate-900 mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-slate-600">Here's what's happening with your cases today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          label="Active Cases"
          value={stats.activeCases}
          subtitle={`${stats.totalCases} total`}
          color="bg-slate-900"
          onClick={() => handleStatClick('cases')}
        />
        {isLawyer && (
          <>
            <StatCard
              icon={Users}
              label="Active Clients"
              value={stats.totalClients}
              color="bg-blue-600"
              onClick={() => handleStatClick('clients')}
            />
            <StatCard
              icon={Gavel}
              label="Judges Tracked"
              value={stats.judgesTracked}
              subtitle="All updated"
              color="bg-emerald-600"
              onClick={() => handleStatClick('judges')}
            />
          </>
        )}
        <StatCard
          icon={AlertCircle}
          label="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          subtitle="Next 30 days"
          color="bg-amber-600"
          onClick={() => handleStatClick('calendar')}
        />
        {isLawyer && (
          <>
            <StatCard
              icon={Clock}
              label="Unbilled Hours"
              value={stats.unbilledHours.toFixed(1)}
              color="bg-emerald-600"
              onClick={() => handleStatClick('time')}
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              color="bg-green-600"
              onClick={() => handleStatClick('time')}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Cases</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {recentCases.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-600">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>No cases yet</p>
              </div>
            ) : (
              recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleStatClick('cases')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{case_.title}</h3>
                      <p className="text-sm text-slate-600">{case_.case_number}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${getPriorityColor(
                        case_.priority
                      )}`}
                    >
                      {case_.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="capitalize">{case_.case_type}</span>
                    <span className="capitalize">{case_.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {upcomingDeadlines.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-600">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleStatClick('calendar')}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 mb-1">{deadline.title}</h3>
                      <p className="text-sm text-slate-600 mb-1 capitalize">
                        {deadline.deadline_type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(deadline.deadline_date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
