import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Gavel, Mail, Phone, Calendar, MapPin, Book } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { JudgeModal } from './JudgeModal';

type Judge = Database['public']['Tables']['judges']['Row'];

export function JudgesTab() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [filteredJudges, setFilteredJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

  useEffect(() => {
    loadJudges();
  }, []);

  useEffect(() => {
    filterJudges();
  }, [judges, searchQuery, courtFilter]);

  const loadJudges = async () => {
    try {
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setJudges(data || []);
    } catch (error) {
      console.error('Error loading judges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJudges = () => {
    let filtered = judges;

    if (courtFilter !== 'all') {
      filtered = filtered.filter((j) => j.court_type === courtFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (j) =>
          j.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.court_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.division?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJudges(filtered);
  };

  const handleJudgeClick = (judge: Judge) => {
    setSelectedJudge(judge);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedJudge(null);
    loadJudges();
  };

  const getCourtTypeColor = (type: string) => {
    switch (type) {
      case 'federal':
        return 'bg-blue-100 text-blue-700';
      case 'state':
        return 'bg-emerald-100 text-emerald-700';
      case 'district':
        return 'bg-amber-100 text-amber-700';
      case 'appellate':
        return 'bg-red-100 text-red-700';
      case 'supreme':
        return 'bg-slate-900 text-white';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Judges</h1>
          <p className="text-slate-600">Track judge availability, procedures, and preferences</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Judge
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search judges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          >
            <option value="all">All Courts</option>
            <option value="federal">Federal</option>
            <option value="state">State</option>
            <option value="district">District</option>
            <option value="appellate">Appellate</option>
            <option value="supreme">Supreme</option>
          </select>
        </div>

        {filteredJudges.length === 0 ? (
          <div className="text-center py-12">
            <Gavel className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No judges found</h3>
            <p className="text-slate-600">Add judges to track their procedures and availability</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredJudges.map((judge) => (
              <div
                key={judge.id}
                onClick={() => handleJudgeClick(judge)}
                className="group border-2 border-slate-200 rounded-xl p-5 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <Gavel className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">{judge.full_name}</h3>
                      <p className="text-sm text-slate-600">{judge.court_name}</p>
                      {judge.division && (
                        <p className="text-xs text-slate-500 mt-1">{judge.division}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap ${getCourtTypeColor(
                      judge.court_type
                    )}`}
                  >
                    {judge.court_type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {judge.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{judge.email}</span>
                    </div>
                  )}
                  {judge.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{judge.phone}</span>
                    </div>
                  )}
                  {judge.appointment_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Appointed {new Date(judge.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {judge.procedures && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <Book className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{judge.procedures}</p>
                    </div>
                  </div>
                )}

                {judge.availability_notes && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{judge.availability_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <JudgeModal judge={selectedJudge} onClose={handleModalClose} />}
    </div>
  );
}
