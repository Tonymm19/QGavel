import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save, CheckCircle2, Mail, Phone } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Case = Database['public']['Tables']['cases']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type Court = Database['public']['Tables']['courts']['Row'];
type Judge = Database['public']['Tables']['judges']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CaseModalProps {
  case_?: Case | null;
  onClose: () => void;
}

export function CaseModal({ case_: existingCase, onClose }: CaseModalProps) {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [lawyers, setLawyers] = useState<Profile[]>([]);
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    case_number: existingCase?.case_number || '',
    title: existingCase?.title || '',
    client_id: existingCase?.client_id || '',
    lawyer_id: existingCase?.lawyer_id || profile?.id || '',
    case_type: existingCase?.case_type || 'civil',
    status: existingCase?.status || 'open',
    court_id: existingCase?.court_id || '',
    judge_id: existingCase?.judge_id || '',
    opposing_counsel: existingCase?.opposing_counsel || '',
    opposing_counsel_email: existingCase?.opposing_counsel_email || '',
    opposing_counsel_phone: existingCase?.opposing_counsel_phone || '',
    description: existingCase?.description || '',
    opened_date: existingCase?.opened_date || '',
  });

  useEffect(() => {
    loadClients();
    loadCourts();
    loadLawyers();
    if (existingCase) {
      loadExistingCaseLawyers();
    }
  }, []);

  useEffect(() => {
    if (formData.court_id) {
      loadJudges(formData.court_id);
    }
  }, [formData.court_id]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCourts(data || []);
    } catch (error) {
      console.error('Error loading courts:', error);
    }
  };

  const loadJudges = async (courtId: string) => {
    try {
      const selectedCourt = courts.find(c => c.id === courtId);
      if (!selectedCourt) return;

      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .eq('court_name', selectedCourt.name)
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setJudges(data || []);
    } catch (error) {
      console.error('Error loading judges:', error);
    }
  };

  const loadLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'lawyer')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setLawyers(data || []);
    } catch (error) {
      console.error('Error loading lawyers:', error);
    }
  };

  const loadExistingCaseLawyers = async () => {
    if (!existingCase) return;
    try {
      const { data, error } = await supabase
        .from('case_lawyers')
        .select('lawyer_id')
        .eq('case_id', existingCase.id);

      if (error) throw error;
      setSelectedLawyers(data?.map(cl => cl.lawyer_id) || []);
    } catch (error) {
      console.error('Error loading case lawyers:', error);
    }
  };

  const handleLawyerToggle = (lawyerId: string) => {
    setSelectedLawyers(prev =>
      prev.includes(lawyerId)
        ? prev.filter(id => id !== lawyerId)
        : [...prev, lawyerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let caseId = existingCase?.id;

      if (existingCase) {
        const { error } = await supabase
          .from('cases')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCase.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cases')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        caseId = data.id;
      }

      if (caseId && selectedLawyers.length > 0) {
        const { error: deleteError } = await supabase
          .from('case_lawyers')
          .delete()
          .eq('case_id', caseId);

        if (deleteError) throw deleteError;

        const caseLawyers = selectedLawyers.map((lawyerId, index) => ({
          case_id: caseId,
          lawyer_id: lawyerId,
          role: index === 0 ? 'lead' : 'associate',
        }));

        const { error: insertError } = await supabase
          .from('case_lawyers')
          .insert(caseLawyers);

        if (insertError) throw insertError;
      }

      onClose();
    } catch (error) {
      console.error('Error saving case:', error);
      alert('Failed to save case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!existingCase) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('cases')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCase.id);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error marking case complete:', error);
      alert('Failed to mark case as complete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingCase ? 'Edit Case' : 'New Case'}
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Case Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Case Number *
              </label>
              <input
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name || client.company_name || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Case Type *
              </label>
              <select
                value={formData.case_type}
                onChange={(e) => setFormData({ ...formData, case_type: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="civil">Civil</option>
                <option value="criminal">Criminal</option>
                <option value="corporate">Corporate</option>
                <option value="family">Family</option>
                <option value="real_estate">Real Estate</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Opened Date
              </label>
              <input
                type="date"
                value={formData.opened_date}
                onChange={(e) => setFormData({ ...formData, opened_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Court Name</label>
              <select
                value={formData.court_id}
                onChange={(e) => {
                  setFormData({ ...formData, court_id: e.target.value, judge_id: '' });
                  setJudges([]);
                }}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="">Select a court</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Judge Name</label>
              <select
                value={formData.judge_id}
                onChange={(e) => setFormData({ ...formData, judge_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                disabled={!formData.court_id}
              >
                <option value="">Select a judge</option>
                {judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>
                    {judge.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Lawyers
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-300 rounded-xl p-3">
                {lawyers.map((lawyer) => (
                  <label key={lawyer.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedLawyers.includes(lawyer.id)}
                      onChange={() => handleLawyerToggle(lawyer.id)}
                      className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">{lawyer.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Opposing Counsel Name
              </label>
              <input
                type="text"
                value={formData.opposing_counsel}
                onChange={(e) => setFormData({ ...formData, opposing_counsel: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Opposing Counsel Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.opposing_counsel_email}
                  onChange={(e) => setFormData({ ...formData, opposing_counsel_email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-10"
                />
                {formData.opposing_counsel_email && (
                  <a
                    href={`mailto:${formData.opposing_counsel_email}`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                    title="Send email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Opposing Counsel Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.opposing_counsel_phone}
                  onChange={(e) => setFormData({ ...formData, opposing_counsel_phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-10"
                />
                {formData.opposing_counsel_phone && (
                  <a
                    href={`tel:${formData.opposing_counsel_phone}`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <div>
            {existingCase && existingCase.status !== 'closed' && (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark Case as Complete
              </button>
            )}
          </div>
          <div className="flex gap-3">
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
              {loading ? 'Saving...' : existingCase ? 'Save Changes' : 'Create New Case'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
