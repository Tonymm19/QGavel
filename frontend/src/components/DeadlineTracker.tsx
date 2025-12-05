import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle,
  FileText,
  Bell,
  Edit,
  X,
} from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { componentClasses, getIconContainerClass } from '../lib/theme';
import {
  Deadline,
  DeadlineReminderCreatePayload,
  DeadlineUpdatePayload,
  NewDeadlineFormPayload,
} from '../types';
import ReminderModal, { ReminderData } from './ReminderModal';
import DeadlineEditModal from './DeadlineEditModal';
import DeadlineReminderListModal from './DeadlineReminderListModal';
import NewDeadlineModal from './NewDeadlineModal';
import AuditLogModal from './AuditLogModal';

const DEADLINE_STATUS_OPTIONS: Array<'all' | 'open' | 'snoozed' | 'missed' | 'done'> = [
  'all',
  'open',
  'snoozed',
  'missed',
  'done',
];

const PRIORITY_FILTER_OPTIONS: Array<'all' | 'High' | 'Medium' | 'Low'> = ['all', 'High', 'Medium', 'Low'];

const DeadlineTracker: React.FC = () => {
  const { isDarkMode: _isDarkMode } = useTheme();
  const {
    deadlines,
    cases,
    users,
    isLoading,
    error,
    createDeadlineReminder,
    updateDeadline,
    createDeadline,
  } = useData();
  
  const [showInlineForm, setShowInlineForm] = useState(false);

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<(typeof DEADLINE_STATUS_OPTIONS)[number]>('all');
  const [filterPriority, setFilterPriority] = useState<(typeof PRIORITY_FILTER_OPTIONS)[number]>('all');
  const [caseFilter, setCaseFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReminderList, setShowReminderList] = useState(false);
  const [reminderListDeadline, setReminderListDeadline] = useState<Deadline | null>(null);
  const [showNewDeadlineModal, setShowNewDeadlineModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditDeadline, setAuditDeadline] = useState<Deadline | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const getPriorityLabel = (priority: number): 'High' | 'Medium' | 'Low' => {
    if (priority <= 2) return 'High';
    if (priority === 3) return 'Medium';
    return 'Low';
  };

  const filteredDeadlines = useMemo(() => {
    return deadlines
      .filter((deadline) => (filterStatus === 'all' ? true : deadline.status === filterStatus))
      .filter((deadline) => (filterPriority === 'all' ? true : getPriorityLabel(deadline.priority) === filterPriority))
      .filter((deadline) => (caseFilter === 'all' ? true : deadline.case === caseFilter))
      .filter((deadline) => (ownerFilter === 'all' ? true : deadline.owner === ownerFilter))
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  }, [deadlines, filterPriority, filterStatus, caseFilter, ownerFilter]);

  const getUrgencyLevel = (dueDate: string) => {
    const today = new Date();
    const deadlineDate = new Date(dueDate);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { level: 'overdue', color: 'bg-red-500', textColor: 'text-red-700' };
    if (diffDays === 0) return { level: 'today', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (diffDays === 1) return { level: 'tomorrow', color: 'bg-amber-500', textColor: 'text-amber-700' };
    if (diffDays <= 3) return { level: 'urgent', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (diffDays <= 7) return { level: 'soon', color: 'bg-blue-500', textColor: 'text-blue-700' };
    return { level: 'upcoming', color: 'bg-green-500', textColor: 'text-green-700' };
  };

  const handleScheduleReminder = (deadline: Deadline) => {
    setReminderError(null);
    setActionMessage(null);
    setSelectedDeadline(deadline);
    setShowReminderModal(true);
  };

  const buildReminderPayloads = (
    deadline: Deadline,
    reminder: ReminderData,
  ): DeadlineReminderCreatePayload[] => {
    const { reminderTimes, notificationMethods, dueDate } = reminder;
    if (!dueDate) {
      return [];
    }

    const due = new Date(dueDate);
    const offsets: Record<string, number> = {
      '15 minutes': 15 * 60 * 1000,
      '30 minutes': 30 * 60 * 1000,
      '1 hour': 60 * 60 * 1000,
      '2 hours': 2 * 60 * 60 * 1000,
      '4 hours': 4 * 60 * 60 * 1000,
      '8 hours': 8 * 60 * 60 * 1000,
      '1 day': 24 * 60 * 60 * 1000,
      '2 days': 2 * 24 * 60 * 60 * 1000,
      '3 days': 3 * 24 * 60 * 60 * 1000,
      '1 week': 7 * 24 * 60 * 60 * 1000,
      '2 weeks': 14 * 24 * 60 * 60 * 1000,
    };

    const channelMap: Record<'email' | 'sms' | 'push', 'email' | 'sms' | 'push'> = {
      email: 'email',
      sms: 'sms',
      push: 'push',
    };

    const times = reminderTimes.length ? reminderTimes : ['1 day'];
    const methods = notificationMethods.length ? notificationMethods : ['email'];

    const payloads: DeadlineReminderCreatePayload[] = [];

    times.forEach((label) => {
      const offset = offsets[label] ?? 0;
      const notifyDate = new Date(due.getTime() - offset);
      if (Number.isNaN(notifyDate.getTime())) {
        return;
      }

      methods.forEach((method) => {
        const channel = channelMap[method as keyof typeof channelMap] ?? null;
        if (!channel) {
          return;
        }

        if (notifyDate.getTime() <= Date.now()) {
          return;
        }

        payloads.push({
          deadline: deadline.id,
          notify_at: notifyDate.toISOString(),
          channel,
        });
      });
    });

    return payloads;
  };

  const handleSaveReminder = async (reminder: ReminderData) => {
    if (!selectedDeadline) {
      return;
    }

    const payloads = buildReminderPayloads(selectedDeadline, reminder);
    if (!payloads.length) {
      const message = 'Select at least one reminder time in the future.';
      setReminderError(message);
      return;
    }

    try {
      await Promise.all(payloads.map(createDeadlineReminder));
      setActionMessage('Reminder scheduled successfully.');
      setShowReminderModal(false);
      setSelectedDeadline(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to schedule reminder.';
      setReminderError(message);
    }
  };

  const handleMarkComplete = async (deadline: Deadline) => {
    try {
      await updateDeadline(deadline.id, { status: 'done' });
      setActionMessage('Deadline marked as completed.');
      setReminderError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update deadline.';
      setReminderError(message);
    }
  };
  const toggleSelection = (deadlineId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(deadlineId)) {
        next.delete(deadlineId);
      } else {
        next.add(deadlineId);
      }
      return next;
    });
  };

  const isSelected = (deadlineId: string) => selectedIds.has(deadlineId);

  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) {
      return;
    }
    setBulkLoading(true);
    setReminderError(null);
    setActionMessage(null);

    try {
      await Promise.all(
        Array.from(selectedIds).map((deadlineId) => updateDeadline(deadlineId, { status: 'done' })),
      );
      setActionMessage('Selected deadlines marked as completed.');
      setSelectedIds(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update selected deadlines.';
      setReminderError(message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleEditDeadline = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowEditModal(true);
    setReminderError(null);
    setActionMessage(null);
  };

  const handleSaveDeadline = async (payload: DeadlineUpdatePayload) => {
    if (!selectedDeadline) {
      return;
    }

    try {
      await updateDeadline(selectedDeadline.id, payload);
      setActionMessage('Deadline updated successfully.');
      setReminderError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update deadline.';
      setReminderError(message);
    }
  };

  const handleViewReminders = (deadline: Deadline) => {
    setReminderError(null);
    setActionMessage(null);
    setReminderListDeadline(deadline);
    setShowReminderList(true);
  };

  const handleViewAudit = (deadline: Deadline) => {
    setReminderError(null);
    setActionMessage(null);
    setAuditDeadline(deadline);
    setShowAuditModal(true);
  };

 const handleCreateDeadline = async (form: NewDeadlineFormPayload) => {
    try {
      await createDeadline(form);
      setActionMessage('Deadline created successfully.');
      setReminderError(null);
      setShowNewDeadlineModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create deadline.';
      setReminderError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  };

  const stats = useMemo(
    () => {
      const totalUrgent = deadlines.filter((deadline) => ['overdue', 'today', 'tomorrow', 'urgent'].includes(getUrgencyLevel(deadline.due_at).level)).length;
      const totalThisWeek = deadlines.filter((deadline) => ['today', 'tomorrow', 'urgent', 'soon'].includes(getUrgencyLevel(deadline.due_at).level)).length;
      const totalPending = deadlines.filter((deadline) => deadline.status !== 'done').length;
      const totalCompleted = deadlines.filter((deadline) => deadline.status === 'done').length;

      return [
        {
          title: 'Urgent (≤3 days)',
          value: totalUrgent,
          icon: AlertTriangle,
          accent: 'bg-red-100 text-red-600',
        },
        {
          title: 'Due This Week',
          value: totalThisWeek,
          icon: Clock,
          accent: 'bg-amber-100 text-amber-600',
        },
        {
          title: 'Pending Deadlines',
          value: totalPending,
          icon: Calendar,
          accent: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Completed',
          value: totalCompleted,
          icon: CheckCircle,
          accent: 'bg-green-100 text-green-600',
        },
      ];
    },
    [deadlines],
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Deadline Tracker</h1>
            <p className="mt-2 text-slate-600">
              Manage and track all case deadlines with automated alerts
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Add New Deadline Form - Top Center */}
      <div className="mb-8">
        <div className="flex justify-center">
          <button
            onClick={() => {
              setShowInlineForm(!showInlineForm);
              if (!showInlineForm) {
                setShowNewDeadlineModal(false);
                setActionMessage(null);
                setReminderError(null);
              }
            }}
            className={`${componentClasses.button.primary} text-base`}
          >
            <Plus className="h-5 w-5" />
            <span>Add New Deadline</span>
          </button>
        </div>
        
        {showInlineForm && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-blue-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create New Deadline</h2>
              <button
                onClick={() => setShowInlineForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                
                try {
                  const payload: NewDeadlineFormPayload = {
                    case: formData.get('case') as string,
                    trigger_type: (formData.get('trigger_type') as Deadline['trigger_type']) || 'user',
                    trigger_source_type: '',
                    trigger_source_id: null,
                    basis: (formData.get('basis') as Deadline['basis']) || 'calendar_days',
                    holiday_calendar: null,
                    due_at: new Date(formData.get('due_at') as string).toISOString(),
                    timezone: 'America/Chicago',
                    owner: formData.get('owner') ? (formData.get('owner') as string) : null,
                    priority: parseInt(formData.get('priority') as string) || 3,
                    status: 'open',
                    snooze_until: null,
                    extension_notes: '',
                    outcome: '',
                    computation_rationale: formData.get('notes') as string || '',
                  };
                  
                  await createDeadline(payload);
                  setShowInlineForm(false);
                  form.reset();
                  setActionMessage('Deadline created successfully!');
                  setTimeout(() => setActionMessage(null), 3000);
                } catch (err) {
                  const message = err instanceof Error ? err.message : 'Failed to create deadline';
                  setReminderError(message);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Case <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="case"
                    required
                    className={componentClasses.input.base}
                  >
                    <option value="">Select a case</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caption || c.case_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="due_at"
                    required
                    className={componentClasses.input.base}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Trigger Type
                  </label>
                  <select
                    name="trigger_type"
                    className={componentClasses.input.base}
                  >
                    <option value="filing">Filing</option>
                    <option value="rule">Rule</option>
                    <option value="court_order">Court Order</option>
                    <option value="user">User Defined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Basis
                  </label>
                  <select
                    name="basis"
                    className={componentClasses.input.base}
                  >
                    <option value="calendar_days">Calendar Days</option>
                    <option value="business_days">Business Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Assign To
                  </label>
                  <select
                    name="owner"
                    className={componentClasses.input.base}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue="3"
                    className={componentClasses.input.base}
                  >
                    <option value="1">1 - Lowest</option>
                    <option value="2">2 - Low</option>
                    <option value="3">3 - Medium</option>
                    <option value="4">4 - High</option>
                    <option value="5">5 - Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Notes / Computation Rationale
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Add any notes or computation details..."
                  className={componentClasses.input.base}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInlineForm(false)}
                  className={componentClasses.button.secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={componentClasses.button.primary}
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Deadline</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const iconColor = stat.accent.includes('red') ? 'red' 
            : stat.accent.includes('amber') ? 'amber'
            : stat.accent.includes('blue') ? 'blue' 
            : 'emerald';
          return (
            <div key={stat.title} className={componentClasses.statCard.base}>
              <div className="flex items-center justify-between mb-4">
                <div className={getIconContainerClass(iconColor as any)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className={componentClasses.statCard.number}>{stat.value}</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">
              Filters
            </span>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
              className={componentClasses.input.base}
            >
              {DEADLINE_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'all'
                    ? 'All statuses'
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(event) => setFilterPriority(event.target.value as typeof filterPriority)}
              className={componentClasses.input.base}
            >
              {PRIORITY_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All priorities' : `${option} priority`}
                </option>
              ))}
            </select>
            <select
              value={caseFilter}
              onChange={(event) => setCaseFilter(event.target.value)}
              className={componentClasses.input.base}
            >
              <option value="all">All cases</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.caption}
                </option>
              ))}
            </select>
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
              className={componentClasses.input.base}
            >
              <option value="all">All owners</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkComplete}
              disabled={selectedIds.size === 0 || bulkLoading}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedIds.size === 0 || bulkLoading
                  ? 'bg-emerald-300 text-emerald-100 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
              }`}
            >
              {bulkLoading ? 'Updating…' : `Mark ${selectedIds.size || ''} Complete`}
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="mt-4 text-sm text-slate-500">
            Loading deadlines…
          </p>
        )}
        {actionMessage && (
          <p className="mt-4 text-sm text-emerald-700 font-medium">
            {actionMessage}
          </p>
        )}
        {reminderError && (
          <p className="mt-2 text-sm text-red-600">
            {reminderError}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Deadlines ({filteredDeadlines.length})
          </h2>
        </div>

        {filteredDeadlines.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium mb-2 text-slate-900">
              No deadlines found
            </p>
            <p className="text-slate-600">
              {filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Adjust the filters to broaden your view.'
                : 'Create a deadline to populate this list.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredDeadlines.map((deadline) => {
              const caseRecord = cases.find((candidate) => candidate.id === deadline.case);
              const urgency = getUrgencyLevel(deadline.due_at);
              const priorityLabel = getPriorityLabel(deadline.priority);

              return (
                <div
                  key={deadline.id}
                  className="p-6 transition-all hover:bg-slate-50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={isSelected(deadline.id)}
                          onChange={() => toggleSelection(deadline.id)}
                          className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {priorityLabel === 'High' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {priorityLabel === 'Medium' && <Clock className="h-5 w-5 text-amber-600" />}
                        {priorityLabel === 'Low' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {deadline.computation_rationale || 'Procedure-driven deadline'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              deadline.status === 'done'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : deadline.status === 'missed'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{deadline.case_caption ?? caseRecord?.caption ?? 'Unassigned case'}</span>
                          </span>
                          {caseRecord?.case_number && <span>• {caseRecord.case_number}</span>}
                          <span>• {caseRecord?.timezone ?? deadline.timezone}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              urgency.textColor.replace('text-', 'bg-').replace('-700', '-50') + ' ' + urgency.textColor + ' border border-' + urgency.textColor.replace('text-', '').replace('-700', '-200')
                            }`}
                          >
                            {new Date(deadline.due_at).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">
                            Owner: {deadline.owner_name ?? 'Unassigned'}
                          </span>
                          <span className="text-xs text-slate-500">
                            Created by {deadline.created_by_name ?? 'System'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {deadline.status !== 'done' && (
                        <button
                          onClick={() => handleMarkComplete(deadline)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        >
                          Mark Complete
                        </button>
                      )}
                     <button
                       onClick={() => handleViewReminders(deadline)}
                       className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                     >
                        Reminders
                        {deadline.pending_reminders > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs px-2 py-0.5">
                            {deadline.pending_reminders}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleViewAudit(deadline)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleScheduleReminder(deadline)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      >
                        <Bell className="h-3 w-3 mr-1 inline" />
                        Remind
                      </button>
                      <button
                        onClick={() => handleEditDeadline(deadline)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                      >
                        <Edit className="h-3 w-3 mr-1 inline" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {view === 'calendar' && (
        <div className="mt-8 bg-white rounded-2xl border-dashed border-2 border-slate-300 p-12 text-center">
          <p className="text-slate-600 text-lg font-medium">Calendar visualization coming soon.</p>
        </div>
      )}

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedDeadline(null);
        }}
        onSave={handleSaveReminder}
        initialData={selectedDeadline ? {
          title: selectedDeadline.case_caption ?? 'Case deadline reminder',
          description: selectedDeadline.computation_rationale ?? '',
          dueDate: selectedDeadline.due_at,
          priority: getPriorityLabel(selectedDeadline.priority),
          notificationMethods: ['email', 'push'],
          reminderTimes: ['1 day'],
          caseId: selectedDeadline.case,
          deadlineId: selectedDeadline.id,
        } : undefined}
      />

      <DeadlineEditModal
        isOpen={showEditModal}
        deadline={selectedDeadline}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeadline(null);
        }}
        onSave={handleSaveDeadline}
        users={users}
      />

      <DeadlineReminderListModal
        isOpen={showReminderList}
        deadline={reminderListDeadline}
        onClose={() => {
          setShowReminderList(false);
          setReminderListDeadline(null);
        }}
      />

      <NewDeadlineModal
        isOpen={showNewDeadlineModal}
        onClose={() => setShowNewDeadlineModal(false)}
        onSave={handleCreateDeadline}
        cases={cases}
        users={users}
      />

      <AuditLogModal
        isOpen={showAuditModal}
        deadline={auditDeadline}
        onClose={() => {
          setShowAuditModal(false);
          setAuditDeadline(null);
        }}
      />
    </div>
  );
};

export default DeadlineTracker;
