import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { DeadlineModal } from './DeadlineModal';

type Deadline = Database['public']['Tables']['case_deadlines']['Row'] & {
  cases?: { title: string; case_number: string } | null;
};

export function CalendarTab() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('upcoming');

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('case_deadlines')
        .select(`
          *,
          cases (
            title,
            case_number
          )
        `)
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error) {
      console.error('Error loading deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (deadline: Deadline) => {
    try {
      const { error } = await supabase
        .from('case_deadlines')
        .update({
          completed: !deadline.completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deadline.id);

      if (error) throw error;
      loadDeadlines();
    } catch (error) {
      console.error('Error updating deadline:', error);
    }
  };

  const handleDeadlineClick = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDeadline(null);
    loadDeadlines();
  };

  const getFilteredDeadlines = () => {
    const now = new Date();
    return deadlines.filter((d) => {
      switch (filter) {
        case 'upcoming':
          return !d.completed && new Date(d.deadline_date) >= now;
        case 'overdue':
          return !d.completed && new Date(d.deadline_date) < now;
        case 'completed':
          return d.completed;
        default:
          return true;
      }
    });
  };

  const filteredDeadlines = getFilteredDeadlines();

  const groupByDate = (deadlines: Deadline[]) => {
    const groups: { [key: string]: Deadline[] } = {};
    deadlines.forEach((deadline) => {
      const date = new Date(deadline.deadline_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(deadline);
    });
    return groups;
  };

  const groupedDeadlines = groupByDate(filteredDeadlines);

  const getDeadlineTypeColor = (type: string) => {
    switch (type) {
      case 'filing':
        return 'bg-blue-100 text-blue-700';
      case 'hearing':
        return 'bg-red-100 text-red-700';
      case 'discovery':
        return 'bg-amber-100 text-amber-700';
      case 'meeting':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const isOverdue = (deadline: Deadline) => {
    return !deadline.completed && new Date(deadline.deadline_date) < new Date();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Calendar & Deadlines</h1>
          <p className="text-slate-600">Never miss an important court date or filing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Deadline
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-2">
        <div className="flex gap-2">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedDeadlines).length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No deadlines found</h3>
            <p className="text-slate-600">Add deadlines to keep track of important dates</p>
          </div>
        ) : (
          Object.entries(groupedDeadlines).map(([date, deadlines]) => (
            <div key={date} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{date}</h3>
                  <div className="text-xs text-slate-500 font-medium text-center leading-tight">
                    <div>Click circle to</div>
                    <div>mark complete</div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-200">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className={`p-6 hover:bg-slate-50 transition-colors ${
                      isOverdue(deadline) ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4 mb-2">
                          <div
                            onClick={() => handleDeadlineClick(deadline)}
                            className="cursor-pointer flex-1"
                          >
                            <h4
                              className={`font-semibold text-slate-900 mb-1 ${
                                deadline.completed ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {deadline.title}
                              {isOverdue(deadline) && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                  <AlertCircle className="w-3 h-3" />
                                  Overdue
                                </span>
                              )}
                            </h4>
                            {deadline.description && (
                              <p className="text-sm text-slate-600 mb-2">{deadline.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(deadline.deadline_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {deadline.cases && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium">
                                {deadline.cases.case_number}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs">{deadline.cases.title}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 ml-auto">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${getDeadlineTypeColor(
                            deadline.deadline_type
                          )}`}
                        >
                          {deadline.deadline_type}
                        </span>
                        <button
                          onClick={() => handleToggleComplete(deadline)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            deadline.completed
                              ? 'bg-green-600 border-green-600'
                              : 'border-slate-300 hover:border-slate-900'
                          }`}
                          title={deadline.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          aria-label={deadline.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {deadline.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && <DeadlineModal deadline={selectedDeadline} onClose={handleModalClose} />}
    </div>
  );
}
