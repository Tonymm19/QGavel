import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { AppUser, Case, Deadline, NewDeadlineFormPayload } from '../types';
import { componentClasses } from '../lib/theme';

interface NewDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: Case[];
  users: AppUser[];
  onSave: (payload: NewDeadlineFormPayload) => Promise<void> | void;
}

const triggerTypeOptions: Deadline['trigger_type'][] = ['rule', 'court_order', 'user'];
const basisOptions: Deadline['basis'][] = ['calendar_days', 'business_days'];
const statusOptions: Deadline['status'][] = ['open', 'snoozed', 'done', 'missed'];

const buildInitialForm = (): NewDeadlineFormPayload => ({
  case: '',
  trigger_type: 'user',
  trigger_source_type: '',
  trigger_source_id: null,
  basis: 'calendar_days',
  holiday_calendar: null,
  due_at: '',
  timezone: 'America/Chicago',
  owner: null,
  priority: 3,
  status: 'open',
  snooze_until: null,
  extension_notes: '',
  outcome: '',
  computation_rationale: '',
});

const NewDeadlineModal: React.FC<NewDeadlineModalProps> = ({ isOpen, onClose, cases, users, onSave }) => {
  const [formData, setFormData] = useState<NewDeadlineFormPayload>(buildInitialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormData(buildInitialForm());
    setIsSaving(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: NewDeadlineFormPayload = {
        ...formData,
        trigger_source_id: formData.trigger_source_id || null,
        due_at: new Date(formData.due_at).toISOString(),
        snooze_until: formData.snooze_until ? new Date(formData.snooze_until).toISOString() : null,
        owner: formData.owner || null,
      };
      await onSave(payload);
      onClose();
      setIsSaving(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create deadline.';
      setError(message);
      setIsSaving(false);
    }
  };

  return (
    <div className={componentClasses.modal.backdrop}>
      <div className={componentClasses.modal.container}>
        <div className={componentClasses.modal.content}>
          <div className={componentClasses.modal.header}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Create Deadline</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          <form id="deadline-form" onSubmit={handleSubmit} className={`${componentClasses.modal.body} space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Case *</label>
                <select
                  value={formData.case}
                  onChange={(event) => setFormData((prev) => ({ ...prev, case: event.target.value }))}
                  className={componentClasses.input.base}
                  required
                >
                  <option value="">Select case</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.caption}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Owner</label>
                <select
                  value={formData.owner ?? ''}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      owner: event.target.value ? event.target.value : null,
                    }))
                  }
                  className={componentClasses.input.base}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Trigger Type *</label>
              <select
                value={formData.trigger_type}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_type: event.target.value as Deadline['trigger_type'],
                  }))
                }
                className={componentClasses.input.base}
                required
              >
                {triggerTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Trigger Source Type
              </label>
              <input
                type="text"
                value={formData.trigger_source_type}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, trigger_source_type: event.target.value }))
                }
                className={componentClasses.input.base}
                placeholder="e.g., docket_entry"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Trigger Source ID
              </label>
              <input
                type="text"
                value={formData.trigger_source_id ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    trigger_source_id: event.target.value || null,
                  }))
                }
                className={componentClasses.input.base}
                placeholder="UUID or reference"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Basis *</label>
              <select
                value={formData.basis}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    basis: event.target.value as Deadline['basis'],
                  }))
                }
                className={componentClasses.input.base}
                required
              >
                {basisOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Due At *</label>
              <input
                type="datetime-local"
                value={formData.due_at}
                onChange={(event) => setFormData((prev) => ({ ...prev, due_at: event.target.value }))}
                className={componentClasses.input.base}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Timezone *</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(event) => setFormData((prev) => ({ ...prev, timezone: event.target.value }))}
                className={componentClasses.input.base}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Priority *</label>
              <input
                type="number"
                min={1}
                max={5}
                value={formData.priority}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, priority: Number(event.target.value) }))
                }
                className={componentClasses.input.base}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: event.target.value as Deadline['status'],
                  }))
                }
                className={componentClasses.input.base}
                required
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Snooze Until</label>
              <input
                type="datetime-local"
                value={formData.snooze_until ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    snooze_until: event.target.value || null,
                  }))
                }
                className={componentClasses.input.base}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Leave blank to create without snoozing.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Computation Rationale
              </label>
              <textarea
                value={formData.computation_rationale}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, computation_rationale: event.target.value }))
                }
                rows={3}
                className={componentClasses.input.base}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Extension Notes
              </label>
              <textarea
                value={formData.extension_notes}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, extension_notes: event.target.value }))
                }
                rows={3}
                className={componentClasses.input.base}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Outcome</label>
              <textarea
                value={formData.outcome}
                onChange={(event) => setFormData((prev) => ({ ...prev, outcome: event.target.value }))}
                rows={3}
                className={componentClasses.input.base}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
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
              form="deadline-form"
              disabled={isSaving}
              className={`${componentClasses.button.primary} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving…' : 'Create Deadline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDeadlineModal;
