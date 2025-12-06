import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Filter, Briefcase, Calendar, User, Mail, Phone, Building2, Gavel, Users } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { CaseModal } from './CaseModal';

type Case = Database['public']['Tables']['cases']['Row'] & {
  clients?: { id: string; full_name: string | null } | null;
  profiles?: { full_name: string } | null;
  courts?: { name: string } | null;
  judges?: { full_name: string } | null;
  case_lawyers?: { profiles: { full_name: string } }[];
};

export function CasesTab() {
  const { profile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const isLawyer = profile?.role === 'lawyer' || profile?.role === 'admin';

  useEffect(() => {
    loadCases();
  }, [profile]);

  useEffect(() => {
    filterCases();
  }, [cases, searchQuery, statusFilter]);

  const loadCases = async () => {
    try {
      const query = supabase
        .from('cases')
        .select(`
          *,
          clients (
            id,
            full_name
          ),
          profiles:lawyer_id (
            full_name
          ),
          courts:court_id (
            name
          ),
          judges:judge_id (
            full_name
          ),
          case_lawyers (
            profiles:lawyer_id (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCases(filtered);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'closed':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCaseClick = (case_: Case) => {
    setSelectedCase(case_);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCase(null);
    loadCases();
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
          <h1 className="text-3xl font-light text-slate-900 mb-2">Cases</h1>
          <p className="text-slate-600">Manage all your legal cases</p>
        </div>
        {isLawyer && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Case
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No cases found</h3>
            <p className="text-slate-600">
              {isLawyer ? 'Create your first case to get started' : 'No cases assigned yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCases.map((case_) => (
              <div
                key={case_.id}
                onClick={() => handleCaseClick(case_)}
                className="group border-2 border-slate-200 rounded-xl p-5 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-900">
                      {case_.title}
                    </h3>
                    <p className="text-sm text-slate-600">{case_.case_number}</p>
                  </div>
                </div>

                {case_.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{case_.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(
                      case_.status
                    )}`}
                  >
                    {case_.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                    {case_.case_type}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span className="text-xs">
                      {case_.clients?.full_name || 'No client'}
                    </span>
                  </div>
                  {case_.opened_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">
                        Opened: {new Date(case_.opened_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {case_.courts?.name && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs line-clamp-1">
                        {case_.courts.name}
                      </span>
                    </div>
                  )}
                  {case_.judges?.full_name && (
                    <div className="flex items-center gap-1.5">
                      <Gavel className="w-4 h-4" />
                      <span className="text-xs">
                        Judge {case_.judges.full_name}
                      </span>
                    </div>
                  )}
                  {case_.case_lawyers && case_.case_lawyers.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">
                        {case_.case_lawyers.length} lawyer{case_.case_lawyers.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {case_.opposing_counsel && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <div className="flex items-center gap-2 text-xs">
                        <span>vs. {case_.opposing_counsel}</span>
                        {case_.opposing_counsel_email && (
                          <a
                            href={`mailto:${case_.opposing_counsel_email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                            title="Send email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {case_.opposing_counsel_phone && (
                          <a
                            href={`tel:${case_.opposing_counsel_phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CaseModal
          case_={selectedCase}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
