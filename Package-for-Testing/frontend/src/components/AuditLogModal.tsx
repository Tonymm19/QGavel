import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useApi } from '../hooks/useApi';
import { Deadline, AuditLogEntry, PaginatedResponse } from '../types';
import { componentClasses } from '../lib/theme';

interface AuditLogModalProps {
  deadline: Deadline | null;
  isOpen: boolean;
  onClose: () => void;
}

const actionLabel: Record<AuditLogEntry['action'], string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  compute: 'Computed',
};

const AuditLogModal: React.FC<AuditLogModalProps> = ({ deadline, isOpen, onClose }) => {
  const { apiFetch } = useApi();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !deadline) {
      return;
    }
    let cancelled = false;

    const loadEntries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch<PaginatedResponse<AuditLogEntry>>(
          `audit-log/?entity_table=deadlines&entity_id=${deadline.id}`,
        );
        if (!cancelled) {
          setEntries(response.results ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to load audit history.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadEntries();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, deadline, isOpen]);

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
                <h2 className="text-xl font-semibold text-slate-900">Audit History</h2>
                <p className="text-slate-600 text-sm">{deadline.case_caption ?? 'Untitled case'}</p>
              </div>
              <button
                onClick={onClose}
                className={componentClasses.button.secondary}
              >
                Close
              </button>
            </div>
          </div>

          <div className={`${componentClasses.modal.body} space-y-4`}>
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading history…</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && entries.length === 0 && !error && (
            <p className="text-center py-12 text-slate-600">
              No audit entries recorded for this deadline yet.
            </p>
          )}

          {entries.length > 0 && (
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-900 font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3">Actor</th>
                    <th className="text-left px-4 py-3">Timestamp</th>
                    <th className="text-left px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {actionLabel[entry.action] ?? entry.action}
                      </td>
                      <td className="px-4 py-3">{entry.actor_name ?? 'System'}</td>
                      <td className="px-4 py-3">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <pre className="whitespace-pre-wrap text-xs text-slate-600 font-mono">
                          {JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
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

export default AuditLogModal;
