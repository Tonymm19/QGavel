import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, FileText, Download, Eye, Lock } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { DocumentModal } from './DocumentModal';

type Document = Database['public']['Tables']['documents']['Row'] & {
  cases?: { title: string; case_number: string } | null;
};

export function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, typeFilter]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          cases (
            title,
            case_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((d) => d.document_type === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.cases?.case_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDocument(null);
    loadDocuments();
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'pleading':
        return 'bg-blue-100 text-blue-700';
      case 'motion':
        return 'bg-amber-100 text-amber-700';
      case 'evidence':
        return 'bg-red-100 text-red-700';
      case 'contract':
        return 'bg-emerald-100 text-emerald-700';
      case 'correspondence':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
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
          <h1 className="text-3xl font-light text-slate-900 mb-2">Documents</h1>
          <p className="text-slate-600">Organize and access all case documents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          >
            <option value="all">All Types</option>
            <option value="pleading">Pleading</option>
            <option value="motion">Motion</option>
            <option value="evidence">Evidence</option>
            <option value="contract">Contract</option>
            <option value="correspondence">Correspondence</option>
            <option value="other">Other</option>
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-600">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                className="group border-2 border-slate-200 rounded-xl p-4 hover:border-slate-900 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                          {doc.title}
                          {doc.is_confidential && (
                            <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-slate-600 line-clamp-1">{doc.description}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap ${getDocumentTypeColor(
                          doc.document_type
                        )}`}
                      >
                        {doc.document_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      {doc.cases && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{doc.cases.case_number}</span>
                          <span className="text-slate-400">•</span>
                          <span className="truncate">{doc.cases.title}</span>
                        </div>
                      )}
                      <span className="text-slate-400">•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span className="text-slate-400">•</span>
                      <span>v{doc.version}</span>
                      <span className="text-slate-400">•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.file_url && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.file_url!, '_blank');
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.file_url!, '_blank');
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-slate-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <DocumentModal document={selectedDocument} onClose={handleModalClose} />}
    </div>
  );
}
