import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import ReminderModal, { ReminderData } from './ReminderModal';
import { componentClasses, getIconContainerClass } from '../lib/theme';

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { cases, deadlines, judges, isLoading, error } = useData();
  const [showReminderModal, setShowReminderModal] = React.useState(false);

  const upcomingDeadlines = deadlines
    .filter((deadline) => new Date(deadline.due_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5);

  const urgentDeadlines = deadlines.filter((deadline) => {
    const dueTime = new Date(deadline.due_at).getTime();
    const diff = dueTime - Date.now();
    return diff >= 0 && diff < 3 * 24 * 60 * 60 * 1000;
  });

  const openCases = cases.filter((caseItem) => caseItem.status === 'open');

  const stats = [
    {
      title: 'Open Cases',
      value: openCases.length,
      icon: FileText,
      color: 'blue',
      change: 'Open matters'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines.length,
      icon: Clock,
      color: 'amber',
      change: 'Within 30 days'
    },
    {
      title: 'Urgent Items',
      value: urgentDeadlines.length,
      icon: AlertTriangle,
      color: 'red',
      change: 'Due in ≤ 3 days'
    },
    {
      title: 'Judges Tracked',
      value: judges.length,
      icon: CheckCircle,
      color: 'green',
      change: 'Profile records'
    }
  ];

  const getIconContainerByColor = (color: string): string => {
    const colorMap: Record<string, 'emerald' | 'amber' | 'blue' | 'red' | 'slate'> = {
      blue: 'blue',
      amber: 'amber',
      red: 'red',
      green: 'emerald'
    };
    return getIconContainerClass(colorMap[color] || 'blue');
  };

  const getPriorityBadgeClass = (priority: 'High' | 'Medium' | 'Low'): string => {
    switch (priority) {
      case 'High':
        return componentClasses.badge.danger;
      case 'Medium':
        return componentClasses.badge.warning;
      case 'Low':
        return componentClasses.badge.success;
      default: 
        return componentClasses.badge.neutral;
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 2) return 'High';
    if (priority === 3) return 'Medium';
    return 'Low';
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const handleSaveReminder = (reminder: ReminderData) => {
    console.log('Manual reminder saved', reminder);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome back! Here's your federal court compliance overview.
            </p>
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className={componentClasses.button.primary}
          >
            <Bell className="h-5 w-5" />
            <span>Set Reminder</span>
          </button>
        </div>
        {isLoading && (
          <p className="mt-4 text-sm text-slate-500">
            Loading the latest cases, deadlines, and judge data…
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={componentClasses.statCard.base}>
              <div className="flex items-center justify-between mb-4">
                <div className={getIconContainerByColor(stat.color)}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className={componentClasses.statCard.number}>
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {stat.title}
                </p>
                <p className={componentClasses.statCard.label}>
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg transition-all">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Upcoming Deadlines
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => {
                const caseTitle = deadline.case_caption ?? cases.find((caseItem) => caseItem.id === deadline.case)?.caption ?? 'Untitled case';
                return (
                  <div key={deadline.id} className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex-shrink-0">
                      <Clock className={`h-5 w-5 ${
                        getPriorityLabel(deadline.priority) === 'High' ? 'text-red-500'
                        : getPriorityLabel(deadline.priority) === 'Medium' ? 'text-amber-500'
                        : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-900">
                        {deadline.trigger_source_type ? `${deadline.trigger_source_type.replace(/_/g, ' ')}` : 'Deadline'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {caseTitle}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={getPriorityBadgeClass(getPriorityLabel(deadline.priority))}>
                        {formatDate(deadline.due_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {upcomingDeadlines.length === 0 && (
                <p className="text-slate-600">
                  No upcoming deadlines found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg transition-all">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Alerts
              </h2>
              <span className={componentClasses.badge.info}>
                Coming soon
              </span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-slate-600">
              Automated alerting is under development. Once enabled, deadline reminders and rule updates will populate here.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-300 rounded-xl transition-all hover:bg-slate-50 hover:shadow-md">
            <div className={getIconContainerClass('blue')}>
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-medium text-slate-900">
              Add New Case
            </span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-300 rounded-xl transition-all hover:bg-slate-50 hover:shadow-md">
            <div className={getIconContainerClass('emerald')}>
              <Calendar className="h-5 w-5" />
            </div>
            <span className="font-medium text-slate-900">
              Schedule Deadline
            </span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-300 rounded-xl transition-all hover:bg-slate-50 hover:shadow-md">
            <div className={getIconContainerClass('amber')}>
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="font-medium text-slate-900">
              Search Rules
            </span>
          </button>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={handleSaveReminder}
      />
    </div>
  );
};

export default Dashboard;
