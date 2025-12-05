import React, { useState } from 'react';
import { Plus, X, FileText, Calendar, User, Building, Clock, AlertTriangle, ChevronRight, Shield, Globe } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { componentClasses } from '../lib/theme';
import { API_ENDPOINTS } from '../config/api';
import { Case, Deadline } from '../types';

const CasesPanel: React.FC = () => {
  const { cases, users, deadlines, isLoading, error } = useData();
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Get deadlines for the selected case
  const getCaseDeadlines = (caseId: string): Deadline[] => {
    return deadlines.filter(d => d.case === caseId).sort((a, b) => 
      new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    );
  };

  // Format date helper
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get deadline status color
  const getDeadlineStatusColor = (deadline: Deadline): string => {
    const now = new Date();
    const dueDate = new Date(deadline.due_at);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (deadline.status === 'done') return 'bg-green-100 text-green-700';
    if (deadline.status === 'missed' || daysUntil < 0) return 'bg-red-100 text-red-700';
    if (daysUntil <= 3) return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.cases(), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internal_case_id: formData.get('internal_case_id'),
          case_number: formData.get('case_number'),
          caption: formData.get('caption'),
          practice_area: formData.get('practice_area'),
          court: formData.get('court') || null,
          filing_date: formData.get('filing_date') || null,
          lead_attorney: formData.get('lead_attorney') || null,
          status: formData.get('status') || 'open',
          timezone: 'America/Chicago',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create case');
      }

      setShowInlineForm(false);
      form.reset();
      setSuccessMessage('Case created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reload the page to show the new case
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create case';
      setSubmitError(message);
      setTimeout(() => setSubmitError(null), 5000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cases</h1>
            <p className="mt-2 text-slate-600">
              Manage your case portfolio
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {/* Add New Case Form - Top Center */}
      <div className="mb-8">
        <div className="flex justify-center">
          <button
            onClick={() => {
              setShowInlineForm(!showInlineForm);
              if (!showInlineForm) {
                setSubmitError(null);
              }
            }}
            className={`${componentClasses.button.primary} text-base`}
          >
            <Plus className="h-5 w-5" />
            <span>Add New Case</span>
          </button>
        </div>
        
        {showInlineForm && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-blue-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create New Case</h2>
              <button
                onClick={() => setShowInlineForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {submitError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Internal Case ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="internal_case_id"
                    required
                    placeholder="e.g., FIRM-2024-001"
                    className={componentClasses.input.base}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Case Number
                  </label>
                  <input
                    type="text"
                    name="case_number"
                    placeholder="e.g., 2024-CV-12345"
                    className={componentClasses.input.base}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Case Caption <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="caption"
                    required
                    placeholder="e.g., Smith v. Jones"
                    className={componentClasses.input.base}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Practice Area
                  </label>
                  <input
                    type="text"
                    name="practice_area"
                    placeholder="e.g., Employment Law"
                    className={componentClasses.input.base}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Filing Date
                  </label>
                  <input
                    type="date"
                    name="filing_date"
                    className={componentClasses.input.base}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Lead Attorney
                  </label>
                  <select
                    name="lead_attorney"
                    className={componentClasses.input.base}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue="open"
                    className={componentClasses.input.base}
                  >
                    <option value="open">Open</option>
                    <option value="stayed">Stayed</option>
                    <option value="closed">Closed</option>
                    <option value="appeal">Appeal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInlineForm(false)}
                  className={componentClasses.button.secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={componentClasses.button.primary}
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Case</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Cases List */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-600">Loading cases...</p>
        </div>
      )}

      {!isLoading && cases.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 text-lg">
            No cases yet. Click "Add New Case" to create your first case.
          </p>
        </div>
      )}

      {!isLoading && cases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {caseItem.caption}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {caseItem.case_number || caseItem.internal_case_id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    caseItem.status === 'open' ? 'bg-green-100 text-green-700' :
                    caseItem.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {caseItem.status}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {caseItem.practice_area && (
                  <div className="flex items-center text-slate-600">
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{caseItem.practice_area}</span>
                  </div>
                )}
                
                {caseItem.court_name && (
                  <div className="flex items-center text-slate-600">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{caseItem.court_name}</span>
                  </div>
                )}

                {caseItem.filing_date && (
                  <div className="flex items-center text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Filed: {new Date(caseItem.filing_date).toLocaleDateString()}</span>
                  </div>
                )}

                {caseItem.lead_attorney_name && (
                  <div className="flex items-center text-slate-600">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{caseItem.lead_attorney_name}</span>
                  </div>
                )}
              </div>

              {/* Deadline count badge */}
              {getCaseDeadlines(caseItem.id).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{getCaseDeadlines(caseItem.id).length} deadline{getCaseDeadlines(caseItem.id).length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedCase.status === 'open' ? 'bg-green-400/20 text-green-100' :
                      selectedCase.status === 'closed' ? 'bg-white/20 text-white' :
                      'bg-blue-400/20 text-blue-100'
                    }`}>
                      {selectedCase.status.toUpperCase()}
                    </span>
                    {selectedCase.legal_hold && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-400/20 text-red-100 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        LEGAL HOLD
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{selectedCase.caption}</h2>
                  <p className="text-blue-100 text-sm">
                    {selectedCase.case_number || selectedCase.internal_case_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Case Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Case Information</h3>
                  
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Practice Area</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCase.practice_area || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Court</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCase.court_name || 'Not assigned'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Filing Date</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(selectedCase.filing_date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Lead Attorney</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCase.lead_attorney_name || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Additional Details</h3>
                  
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Timezone</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCase.timezone || 'America/Chicago'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Confidentiality Level</p>
                        <p className="text-sm font-medium text-slate-900 capitalize">{selectedCase.confidentiality_level || 'Standard'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Stage</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCase.stage || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Last Updated</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(selectedCase.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Deadlines Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Case Deadlines ({getCaseDeadlines(selectedCase.id).length})
                  </h3>
                </div>

                {getCaseDeadlines(selectedCase.id).length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No deadlines for this case</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCaseDeadlines(selectedCase.id).slice(0, 10).map((deadline) => {
                      const dueDate = new Date(deadline.due_at);
                      const now = new Date();
                      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysUntil < 0 && deadline.status !== 'done';
                      
                      return (
                        <div 
                          key={deadline.id}
                          className={`bg-white border rounded-xl p-4 ${
                            isOverdue ? 'border-red-200 bg-red-50/50' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDeadlineStatusColor(deadline)}`}>
                                  {deadline.status}
                                </span>
                                <span className="text-xs text-slate-400 capitalize">
                                  {deadline.trigger_type.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-900">
                                {deadline.computation_rationale || `Deadline for ${selectedCase.caption}`}
                              </p>
                              {deadline.owner_name && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Assigned to: {deadline.owner_name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                                {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className={`text-xs ${
                                isOverdue ? 'text-red-500' : 
                                daysUntil <= 3 ? 'text-amber-600' : 'text-slate-500'
                              }`}>
                                {isOverdue 
                                  ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`
                                  : daysUntil === 0 
                                    ? 'Due today'
                                    : daysUntil === 1
                                      ? 'Due tomorrow'
                                      : `In ${daysUntil} days`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {getCaseDeadlines(selectedCase.id).length > 10 && (
                      <p className="text-center text-sm text-slate-500 pt-2">
                        And {getCaseDeadlines(selectedCase.id).length - 10} more deadline{getCaseDeadlines(selectedCase.id).length - 10 !== 1 ? 's' : ''}...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className={componentClasses.button.secondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesPanel;


