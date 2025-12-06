import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Plus, Trash2, Mail, Phone } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientContact = Database['public']['Tables']['client_contacts']['Row'];

interface ClientModalProps {
  client?: Client | null;
  onClose: () => void;
}

interface ContactForm {
  id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  is_primary: boolean;
}

export function ClientModal({ client: existingClient, onClose }: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactForm[]>([
    { contact_name: '', contact_email: '', contact_phone: '', is_primary: true }
  ]);
  const [formData, setFormData] = useState({
    full_name: existingClient?.full_name || '',
    email: existingClient?.email || '',
    phone: existingClient?.phone || '',
    company_name: existingClient?.company_name || '',
    address: existingClient?.address || '',
    city: existingClient?.city || '',
    state: existingClient?.state || '',
    zip_code: existingClient?.zip_code || '',
    notes: existingClient?.notes || '',
  });

  useEffect(() => {
    if (existingClient) {
      loadClientContacts();
    }
  }, [existingClient]);

  const loadClientContacts = async () => {
    if (!existingClient) return;

    try {
      const { data, error } = await supabase
        .from('client_contacts')
        .select('*')
        .eq('client_id', existingClient.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setContacts(data.map(c => ({
          id: c.id,
          contact_name: c.contact_name,
          contact_email: c.contact_email || '',
          contact_phone: c.contact_phone || '',
          is_primary: c.is_primary,
        })));
      }
    } catch (error) {
      console.error('Error loading client contacts:', error);
    }
  };

  const addContact = () => {
    setContacts([...contacts, { contact_name: '', contact_email: '', contact_phone: '', is_primary: false }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof ContactForm, value: string | boolean) => {
    const newContacts = [...contacts];
    if (field === 'is_primary' && value === true) {
      newContacts.forEach((c, i) => c.is_primary = i === index);
    } else {
      newContacts[index] = { ...newContacts[index], [field]: value };
    }
    setContacts(newContacts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let clientId = existingClient?.id;

      if (existingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || null,
            company_name: formData.company_name || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip_code: formData.zip_code || null,
            notes: formData.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingClient.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('clients').insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          company_name: formData.company_name || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
          notes: formData.notes || null,
        }).select().single();

        if (error) throw error;
        clientId = data.id;
      }

      if (clientId) {
        const { error: deleteError } = await supabase
          .from('client_contacts')
          .delete()
          .eq('client_id', clientId);

        if (deleteError) throw deleteError;

        const validContacts = contacts.filter(c => c.contact_name.trim() !== '');
        if (validContacts.length > 0) {
          const contactsToInsert = validContacts.map(c => ({
            client_id: clientId,
            contact_name: c.contact_name,
            contact_email: c.contact_email || null,
            contact_phone: c.contact_phone || null,
            is_primary: c.is_primary,
          }));

          const { error: insertError } = await supabase
            .from('client_contacts')
            .insert(contactsToInsert);

          if (insertError) throw insertError;
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {existingClient ? 'Edit Client' : 'New Client'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    required
                    disabled={!!existingClient}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Zip Code</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Internal Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Client Contacts</h3>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>

              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="p-4 border-2 border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={contact.is_primary}
                          onChange={() => updateContact(index, 'is_primary', true)}
                          className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900"
                        />
                        <span className="text-sm font-medium text-slate-700">Primary Contact</span>
                      </label>
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          value={contact.contact_name}
                          onChange={(e) => updateContact(index, 'contact_name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={contact.contact_email}
                            onChange={(e) => updateContact(index, 'contact_email', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-8"
                          />
                          {contact.contact_email && (
                            <a
                              href={`mailto:${contact.contact_email}`}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                              title="Send email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Phone
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={contact.contact_phone}
                            onChange={(e) => updateContact(index, 'contact_phone', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-8"
                          />
                          {contact.contact_phone && (
                            <a
                              href={`tel:${contact.contact_phone}`}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
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
            {loading ? 'Saving...' : existingClient ? 'Save Changes' : 'Add New Client'}
          </button>
        </div>
      </div>
    </div>
  );
}
