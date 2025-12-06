import React, { useEffect, useState } from 'react';
import { Loader2, Trash2, RefreshCw, Bell } from 'lucide-react';

import { useApi } from '../hooks/useApi';
import { Deadline, DeadlineReminder, PaginatedResponse } from '../types';
import { componentClasses } from '../lib/theme';

interface DeadlineReminderListModalProps {
  isOpen: boolean;
  deadline: Deadline | null;
  onClose: () => void;
}

const channelLabel: Record<DeadlineReminder['channel'], string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
};

const DeadlineReminderListModal: React.FC<DeadlineReminderListModalProps> = ({ isOpen, deadline, onClose }) => {
  const { apiFetch } = useApi();
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deadline) {
      return;
    }

    let cancelled = false;

    const fetchReminders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch<PaginatedResponse<DeadlineReminder>>(
          `deadline-reminders/?deadline=${deadline.id}`,
        );
        if (!cancelled) {
          setReminders(response.results ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load reminders.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchReminders();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, deadline, isOpen]);

  const handleRefresh = async () => {
    if (!deadline) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch<PaginatedResponse<DeadlineReminder>>(
        `deadline-reminders/?deadline=${deadline.id}`,
      );
      setReminders(response.results ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to refresh reminders.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!deadline) {
      return;
    }
    try {
      await apiFetch(`deadline-reminders/${reminderId}/`, {
        method: 'DELETE',
      });
      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete reminder.';
      setError(message);
    }
  };

  if (!isOpen || !deadline) {
    return null;
  }

  return (
    <div className={componentClasses.modal.backdrop}>
      <div className={`${componentClasses.modal.container} max-w-3xl`}>
        <div className={componentClasses.modal.content}>
          <div className={componentClasses.modal.header}>
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Scheduled Reminders</h2>
                <p className="text-slate-600 text-sm">{deadline.case_caption ?? 'Untitled case'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium flex items-center space-x-2 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={onClose}
                  className={componentClasses.button.secondary}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className={`${componentClasses.modal.body} space-y-4`}>
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading reminders…</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && reminders.length === 0 && !error && (
            <div className="text-center py-12 text-slate-600">
              <Bell className="mx-auto mb-4 h-10 w-10 text-slate-400" />
              <p>No reminders scheduled for this deadline yet.</p>
            </div>
          )}

          {reminders.length > 0 && (
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-900 font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Notify At</th>
                    <th className="text-left px-4 py-3">Channel</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder) => {
                    const notifyDate = new Date(reminder.notify_at).toLocaleString();
                    return (
                      <tr
                        key={reminder.id}
                        className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{notifyDate}</td>
                        <td className="px-4 py-3">{channelLabel[reminder.channel]}</td>
                        <td className="px-4 py-3">
                          {reminder.sent
                            ? `Sent ${reminder.sent_at ? new Date(reminder.sent_at).toLocaleString() : ''}`
                            : 'Pending'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!reminder.sent && (
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineReminderListModal;
