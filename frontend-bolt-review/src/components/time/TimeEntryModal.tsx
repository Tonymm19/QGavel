import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
type Case = Database['public']['Tables']['cases']['Row'];

interface TimeEntryModalProps {
  entry?: TimeEntry | null;
  onClose: () => void;
}

export function TimeEntryModal({ entry: existingEntry, onClose }: TimeEntryModalProps) {
  const { profile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    case_id: existingEntry?.case_id || '',
    date: existingEntry?.date || new Date().toISOString().split('T')[0],
    hours: existingEntry?.hours?.toString() || '',
    description: existingEntry?.description || '',
    hourly_rate: existingEntry?.hourly_rate?.toString() || '250',
    billable: existingEntry?.billable ?? true,
    billed: existingEntry?.billed ?? false,
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .in('status', ['open', 'pending'])
        .order('title', { ascending: true });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entryData = {
        case_id: formData.case_id,
        lawyer_id: profile?.id,
        date: formData.date,
        hours: parseFloat(formData.hours),
        description: formData.description,
        hourly_rate: parseFloat(formData.hourly_rate),
        billable: formData.billable,
        billed: formData.billed,
      };

      if (existingEntry) {
        const { error } = await supabase
          .from('time_entries')
          .update({
            ...entryData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('time_entries').insert([entryData]);
        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving time entry:', error);
      alert('Failed to save time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingEntry ? 'Edit Time Entry' : 'Log Time'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Case *</label>
              <select
                value={formData.case_id}
                onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a case</option>
                {cases.map((case_) => (
                  <option key={case_.id} value={case_.id}>
                    {case_.case_number} - {case_.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hours Worked *
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Hourly Rate ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Total Amount
              </label>
              <div className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 font-semibold">
                $
                {(parseFloat(formData.hours || '0') * parseFloat(formData.hourly_rate || '0')).toFixed(
                  2
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Describe the work performed..."
                required
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-slate-700">This time is billable to the client</span>
              </label>

              {formData.billable && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.billed}
                    onChange={(e) => setFormData({ ...formData, billed: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Client has been billed for this time
                  </span>
                </label>
              )}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : existingEntry ? 'Save Changes' : 'Log Time Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
