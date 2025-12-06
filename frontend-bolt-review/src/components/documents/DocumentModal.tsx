import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Document = Database['public']['Tables']['documents']['Row'];
type Case = Database['public']['Tables']['cases']['Row'];

interface DocumentModalProps {
  document?: Document | null;
  onClose: () => void;
}

export function DocumentModal({ document: existingDocument, onClose }: DocumentModalProps) {
  const { profile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    case_id: existingDocument?.case_id || '',
    title: existingDocument?.title || '',
    description: existingDocument?.description || '',
    document_type: existingDocument?.document_type || 'other',
    file_url: existingDocument?.file_url || '',
    is_confidential: existingDocument?.is_confidential ?? false,
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
      const documentData = {
        case_id: formData.case_id,
        title: formData.title,
        description: formData.description || null,
        document_type: formData.document_type as any,
        file_url: formData.file_url || null,
        is_confidential: formData.is_confidential,
        uploaded_by: profile?.id,
        version: existingDocument?.version || 1,
      };

      if (existingDocument) {
        const { error } = await supabase
          .from('documents')
          .update({
            ...documentData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDocument.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('documents').insert([documentData]);
        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingDocument ? 'Edit Document' : 'Upload Document'}
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Document Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="e.g., Motion for Summary Judgment"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Document Type *
              </label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="pleading">Pleading</option>
                <option value="motion">Motion</option>
                <option value="evidence">Evidence</option>
                <option value="contract">Contract</option>
                <option value="correspondence">Correspondence</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                File URL
              </label>
              <input
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="https://..."
              />
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
                placeholder="Add a description of this document..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_confidential}
                  onChange={(e) =>
                    setFormData({ ...formData, is_confidential: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700 block">
                    Mark as confidential
                  </span>
                  <span className="text-xs text-slate-600">
                    Confidential documents are only visible to lawyers
                  </span>
                </div>
              </label>
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
            {loading ? 'Saving...' : existingDocument ? 'Save Changes' : 'Add New Document'}
          </button>
        </div>
      </div>
    </div>
  );
}
