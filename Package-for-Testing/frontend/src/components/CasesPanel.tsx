import React, { useState } from 'react';
import { Plus, X, FileText, Calendar, User, Building } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { componentClasses } from '../lib/theme';

const CasesPanel: React.FC = () => {
  const { cases, users, isLoading, error } = useData();
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/cases/', {
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
                      <option key={u.user_id} value={u.user_id}>
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
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {caseItem.caption}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {caseItem.case_number || caseItem.internal_case_id}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  caseItem.status === 'open' ? 'bg-green-100 text-green-700' :
                  caseItem.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {caseItem.status}
                </span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CasesPanel;


