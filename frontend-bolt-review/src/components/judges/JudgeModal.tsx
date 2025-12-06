import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Judge = Database['public']['Tables']['judges']['Row'];

interface JudgeModalProps {
  judge?: Judge | null;
  onClose: () => void;
}

export function JudgeModal({ judge: existingJudge, onClose }: JudgeModalProps) {
  const [loading, setLoading] = useState(false);
  const [lawClerkNames, setLawClerkNames] = useState<string[]>(
    existingJudge?.law_clerk_names || ['']
  );
  const [formData, setFormData] = useState({
    full_name: existingJudge?.full_name || '',
    court_name: existingJudge?.court_name || '',
    court_type: existingJudge?.court_type || 'federal',
    division: existingJudge?.division || '',
    email: existingJudge?.email || '',
    address: existingJudge?.address || '',
    bio: existingJudge?.bio || '',
    status: existingJudge?.status || 'active',
    courtroom_number: existingJudge?.courtroom_number || '',
    chambers_number: existingJudge?.chambers_number || '',
    courtroom_deputy_name: existingJudge?.courtroom_deputy_name || '',
    courtroom_deputy_phone: existingJudge?.courtroom_deputy_phone || '',
    courtroom_deputy_room: existingJudge?.courtroom_deputy_room || '',
  });

  const addLawClerk = () => {
    setLawClerkNames([...lawClerkNames, '']);
  };

  const removeLawClerk = (index: number) => {
    if (lawClerkNames.length > 1) {
      setLawClerkNames(lawClerkNames.filter((_, i) => i !== index));
    }
  };

  const updateLawClerk = (index: number, value: string) => {
    const newLawClerks = [...lawClerkNames];
    newLawClerks[index] = value;
    setLawClerkNames(newLawClerks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validLawClerks = lawClerkNames.filter(name => name.trim() !== '');

      const judgeData = {
        full_name: formData.full_name,
        court_name: formData.court_name,
        court_type: formData.court_type as any,
        division: formData.division || null,
        email: formData.email || null,
        address: formData.address || null,
        bio: formData.bio || null,
        status: formData.status as any,
        courtroom_number: formData.courtroom_number || null,
        chambers_number: formData.chambers_number || null,
        courtroom_deputy_name: formData.courtroom_deputy_name || null,
        courtroom_deputy_phone: formData.courtroom_deputy_phone || null,
        courtroom_deputy_room: formData.courtroom_deputy_room || null,
        law_clerk_names: validLawClerks.length > 0 ? validLawClerks : null,
      };

      if (existingJudge) {
        const { error } = await supabase
          .from('judges')
          .update({
            ...judgeData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingJudge.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('judges').insert([judgeData]);
        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving judge:', error);
      alert('Failed to save judge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingJudge ? 'Edit Judge' : 'Add Judge'}
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
                Judge Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Hon. Rebecca R. Pallmeyer"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Court Name *
              </label>
              <input
                type="text"
                value={formData.court_name}
                onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                placeholder="United States District Court"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Court Type *
              </label>
              <select
                value={formData.court_type}
                onChange={(e) => setFormData({ ...formData, court_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="federal">Federal</option>
                <option value="state">State</option>
                <option value="district">District</option>
                <option value="appellate">Appellate</option>
                <option value="supreme">Supreme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Division</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="Northern District of Illinois"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="active">Active</option>
                <option value="senior">Senior Status</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Courtroom Number</label>
              <input
                type="text"
                value={formData.courtroom_number}
                onChange={(e) => setFormData({ ...formData, courtroom_number: e.target.value })}
                placeholder="2525"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chambers Number</label>
              <input
                type="text"
                value={formData.chambers_number}
                onChange={(e) => setFormData({ ...formData, chambers_number: e.target.value })}
                placeholder="2525"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="chambers@court.gov"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="219 S. Dearborn Street, Chicago, IL 60604"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Biography</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Judge background, experience, and specializations..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Courtroom Deputy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Deputy Name</label>
                  <input
                    type="text"
                    value={formData.courtroom_deputy_name}
                    onChange={(e) => setFormData({ ...formData, courtroom_deputy_name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Deputy Phone</label>
                  <input
                    type="tel"
                    value={formData.courtroom_deputy_phone}
                    onChange={(e) => setFormData({ ...formData, courtroom_deputy_phone: e.target.value })}
                    placeholder="(312) 435-5670"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Deputy Room</label>
                  <input
                    type="text"
                    value={formData.courtroom_deputy_room}
                    onChange={(e) => setFormData({ ...formData, courtroom_deputy_room: e.target.value })}
                    placeholder="2525"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Law Clerks</h3>
                <button
                  type="button"
                  onClick={addLawClerk}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Clerk
                </button>
              </div>

              <div className="space-y-2">
                {lawClerkNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateLawClerk(index, e.target.value)}
                      placeholder="Law Clerk Name"
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                    {lawClerkNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLawClerk(index)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
            {loading ? 'Saving...' : existingJudge ? 'Save Changes' : 'Add New Judge'}
          </button>
        </div>
      </div>
    </div>
  );
}
