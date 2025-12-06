import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { AppUser, Deadline, DeadlineUpdatePayload } from '../types';
import { componentClasses } from '../lib/theme';

interface DeadlineEditModalProps {
  deadline: Deadline | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: DeadlineUpdatePayload) => Promise<void> | void;
  users: AppUser[];
}

const statusOptions: Deadline['status'][] = ['open', 'snoozed', 'done', 'missed'];

const DeadlineEditModal: React.FC<DeadlineEditModalProps> = ({ deadline, isOpen, onClose, onSave, users }) => {
  const [formData, setFormData] = useState<DeadlineUpdatePayload>({
    status: deadline?.status,
    snooze_until: deadline?.snooze_until ?? undefined,
    extension_notes: deadline?.extension_notes ?? '',
    outcome: deadline?.outcome ?? '',
    owner: deadline?.owner ?? undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deadline) {
      return;
    }
    setError(null);
    setIsSaving(false);
    setFormData({
      status: deadline.status,
      snooze_until: deadline.snooze_until ?? undefined,
      extension_notes: deadline.extension_notes ?? '',
      outcome: deadline.outcome ?? '',
      owner: deadline.owner ?? undefined,
    });
  }, [deadline, isOpen]);

  if (!isOpen || !deadline) {
    return null;
  }

  const snoozeLocalValue = formData.snooze_until
    ? new Date(formData.snooze_until).toISOString().slice(0, 16)
    : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: DeadlineUpdatePayload = {
        status: formData.status,
        snooze_until: formData.snooze_until ?? null,
        extension_notes: formData.extension_notes ?? '',
        outcome: formData.outcome ?? '',
        owner: formData.owner ?? null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update deadline.';
      setError(message);
      setIsSaving(false);
    }
  };

  return (
    <div className={componentClasses.modal.backdrop}>
      <div className={componentClasses.modal.container}>
        <div className={componentClasses.modal.content}>
          <div className={componentClasses.modal.header}>
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Edit Deadline</h2>
                <p className="text-slate-600 text-sm mt-1">
                  {deadline.case_caption ?? 'Untitled case'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          <form id="edit-deadline-form" onSubmit={handleSubmit} className={`${componentClasses.modal.body} space-y-6`}>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
            <select
              value={formData.status ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value as Deadline['status'] }))}
              className={componentClasses.input.base}
            >
              <option value="">Select status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Snooze Until
            </label>
            <input
              type="datetime-local"
              value={snoozeLocalValue}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  snooze_until: event.target.value ? new Date(event.target.value).toISOString() : undefined,
                }))
              }
              className={componentClasses.input.base}
            />
            <p className="text-xs mt-1 text-slate-500">
              Leave blank to clear the snooze date.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Extension Notes</label>
            <textarea
              value={formData.extension_notes ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, extension_notes: event.target.value }))}
              rows={3}
              className={componentClasses.input.base}
              placeholder="Notes about extensions or adjustments..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Outcome</label>
            <textarea
              value={formData.outcome ?? ''}
              onChange={(event) => setFormData((prev) => ({ ...prev, outcome: event.target.value }))}
              rows={3}
              className={componentClasses.input.base}
              placeholder="Outcome or resolution details..."
            />
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
              form="edit-deadline-form"
              disabled={isSaving}
              className={`${componentClasses.button.primary} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineEditModal;
