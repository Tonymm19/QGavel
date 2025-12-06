import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Clock, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { TimeEntryModal } from './TimeEntryModal';

type TimeEntry = Database['public']['Tables']['time_entries']['Row'] & {
  cases?: { title: string; case_number: string } | null;
};

export function TimeTab() {
  const { profile } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [stats, setStats] = useState({
    totalHours: 0,
    billableHours: 0,
    unbilledHours: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadTimeEntries();
  }, []);

  const loadTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          cases (
            title,
            case_number
          )
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;

      const entries = data || [];
      setTimeEntries(entries);

      const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
      const billableHours = entries
        .filter((e) => e.billable)
        .reduce((sum, e) => sum + Number(e.hours), 0);
      const unbilledHours = entries
        .filter((e) => e.billable && !e.billed)
        .reduce((sum, e) => sum + Number(e.hours), 0);
      const totalRevenue = entries
        .filter((e) => e.billed)
        .reduce((sum, e) => sum + Number(e.hours) * Number(e.hourly_rate), 0);

      setStats({ totalHours, billableHours, unbilledHours, totalRevenue });
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryClick = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEntry(null);
    loadTimeEntries();
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: string;
    color: string;
  }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-light text-slate-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Time & Billing</h1>
          <p className="text-slate-600">Track your billable hours and revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Log Time
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Clock}
          label="Total Hours"
          value={stats.totalHours.toFixed(1)}
          color="bg-slate-900"
        />
        <StatCard
          icon={CheckCircle}
          label="Billable Hours"
          value={stats.billableHours.toFixed(1)}
          color="bg-blue-600"
        />
        <StatCard
          icon={XCircle}
          label="Unbilled Hours"
          value={stats.unbilledHours.toFixed(1)}
          color="bg-amber-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          color="bg-green-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Time Entries</h2>
        </div>

        {timeEntries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No time entries yet</h3>
            <p className="text-slate-600">Start tracking your billable hours</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timeEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => handleEntryClick(entry)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div>
                        <div className="font-medium">{entry.cases?.title || 'Unknown'}</div>
                        <div className="text-xs text-slate-600">
                          {entry.cases?.case_number || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {Number(entry.hours).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${Number(entry.hourly_rate).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      ${(Number(entry.hours) * Number(entry.hourly_rate)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {entry.billable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Billable
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            Non-billable
                          </span>
                        )}
                        {entry.billed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Billed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <TimeEntryModal entry={selectedEntry} onClose={handleModalClose} />}
    </div>
  );
}
