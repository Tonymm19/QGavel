import React, { useEffect, useState } from 'react';
import { X, Bell, Mail, MessageSquare } from 'lucide-react';
import { componentClasses } from '../lib/theme';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: ReminderData) => Promise<void> | void;
  initialData?: Partial<ReminderData>;
}

export interface ReminderData {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  reminderTimes: string[];
  priority: 'High' | 'Medium' | 'Low';
  notificationMethods: ('email' | 'sms' | 'push')[];
  caseId?: string;
  deadlineId?: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const buildInitialState = (): ReminderData => ({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    dueDate: initialData?.dueDate ?? '',
    reminderTimes: initialData?.reminderTimes ?? ['1 day'],
    priority: initialData?.priority ?? 'Medium',
    notificationMethods: initialData?.notificationMethods ?? ['email', 'push'],
    caseId: initialData?.caseId,
    deadlineId: initialData?.deadlineId,
  });

  const [formData, setFormData] = useState<ReminderData>(buildInitialState);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormData(buildInitialState());
    setSubmitError(null);
  }, [initialData, isOpen]);

  const reminderOptions = [
    '15 minutes',
    '30 minutes',
    '1 hour',
    '2 hours',
    '4 hours',
    '8 hours',
    '1 day',
    '2 days',
    '3 days',
    '1 week',
    '2 weeks'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save reminder.';
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReminderTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.includes(time)
        ? prev.reminderTimes.filter(t => t !== time)
        : [...prev.reminderTimes, time]
    }));
  };

  const toggleNotificationMethod = (method: 'email' | 'sms' | 'push') => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={componentClasses.modal.backdrop}>
      <div className={componentClasses.modal.container}>
        <div className={componentClasses.modal.content}>
          <div className={componentClasses.modal.header}>
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-semibold text-slate-900">
                Schedule Reminder
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          <form id="reminder-form" onSubmit={handleSubmit} className={`${componentClasses.modal.body} space-y-6`}>
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Reminder Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={componentClasses.input.base}
              placeholder="e.g., Motion for Summary Judgment Due"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={componentClasses.input.base}
              placeholder="Additional details about this reminder..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Due Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className={componentClasses.input.base}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Priority Level
            </label>
            <div className="flex space-x-3">
              {(['High', 'Medium', 'Low'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors border ${
                    formData.priority === priority
                      ? priority === 'High' 
                        ? 'bg-red-50 text-red-700 border-red-300' 
                        : priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Times */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Reminder Schedule
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reminderOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleReminderTime(time)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                    formData.reminderTimes.includes(time)
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {time} before
                </button>
              ))}
            </div>
          </div>

          {/* Notification Methods */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Notification Methods
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => toggleNotificationMethod('email')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors border ${
                  formData.notificationMethods.includes('email')
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => toggleNotificationMethod('sms')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors border ${
                  formData.notificationMethods.includes('sms')
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>SMS</span>
              </button>
              <button
                type="button"
                onClick={() => toggleNotificationMethod('push')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors border ${
                  formData.notificationMethods.includes('push')
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Push</span>
              </button>
            </div>
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{submitError}</p>
            </div>
          )}
          </form>

          <div className={componentClasses.modal.footer}>
            <button
              type="button"
              onClick={onClose}
              className={componentClasses.button.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="reminder-form"
              disabled={isSaving}
              className={`${componentClasses.button.primary} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving…' : 'Schedule Reminder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
