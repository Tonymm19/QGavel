import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Deadline = Database['public']['Tables']['case_deadlines']['Row'];
type Case = Database['public']['Tables']['cases']['Row'];

interface DeadlineModalProps {
  deadline?: Deadline | null;
  onClose: () => void;
}

export function DeadlineModal({ deadline: existingDeadline, onClose }: DeadlineModalProps) {
  const { profile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    case_id: existingDeadline?.case_id || '',
    title: existingDeadline?.title || '',
    description: existingDeadline?.description || '',
    deadline_date: existingDeadline?.deadline_date
      ? new Date(existingDeadline.deadline_date).toISOString().slice(0, 16)
      : getDefaultDateTime(),
    deadline_type: existingDeadline?.deadline_type || 'other',
    completed: existingDeadline?.completed ?? false,
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
      const deadlineData = {
        case_id: formData.case_id,
        title: formData.title,
        description: formData.description || null,
        deadline_date: new Date(formData.deadline_date).toISOString(),
        deadline_type: formData.deadline_type as any,
        completed: formData.completed,
        created_by: profile?.id,
      };

      if (existingDeadline) {
        const { error } = await supabase
          .from('case_deadlines')
          .update({
            ...deadlineData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDeadline.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('case_deadlines').insert([deadlineData]);
        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving deadline:', error);
      alert('Failed to save deadline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingDeadline ? 'Edit Deadline' : 'Add Deadline'}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="e.g., File motion for summary judgment"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline_date}
                onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type *</label>
              <select
                value={formData.deadline_type}
                onChange={(e) => setFormData({ ...formData, deadline_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="filing">Filing</option>
                <option value="hearing">Hearing</option>
                <option value="discovery">Discovery</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="Add any additional details..."
              />
            </div>

            {existingDeadline && (
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.completed}
                    onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
                  />
                  <span className="text-sm font-medium text-slate-700">Mark this deadline as complete</span>
                </label>
              </div>
            )}
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
            {loading ? 'Saving...' : existingDeadline ? 'Save Changes' : 'Add New Deadline'}
          </button>
        </div>
      </div>
    </div>
  );
}
