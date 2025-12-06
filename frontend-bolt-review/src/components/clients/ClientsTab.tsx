import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Users, Mail, Phone, Building2 } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { ClientModal } from './ClientModal';

type Client = Database['public']['Tables']['clients']['Row'];

export function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedClient(null);
    loadClients();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'inactive':
        return 'bg-slate-100 text-slate-700';
      case 'archived':
        return 'bg-amber-100 text-amber-700';
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
          <h1 className="text-3xl font-light text-slate-900 mb-2">Clients</h1>
          <p className="text-slate-600">Manage your client relationships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Client
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-600">Add your first client to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="group border-2 border-slate-200 rounded-xl p-5 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                    {client.full_name?.charAt(0) || client.company_name?.charAt(0) || 'C'}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-900">
                  {client.full_name || 'Unknown'}
                </h3>

                {client.company_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <Building2 className="w-4 h-4" />
                    <span>{client.company_name}</span>
                  </div>
                )}

                <div className="space-y-2 pt-3 border-t border-slate-200">
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ClientModal client={selectedClient} onClose={handleModalClose} />}
    </div>
  );
}
