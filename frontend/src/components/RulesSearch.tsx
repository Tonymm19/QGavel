import React, { useMemo, useState } from 'react';
import { Search, Book, ExternalLink, Star, AlertCircle } from 'lucide-react';

import { useData } from '../contexts/DataContext';
import { Rule } from '../types';
import { componentClasses } from '../lib/theme';

interface RuleSearchResult {
  id: string;
  citation: string;
  jurisdiction: string;
  summary: string;
  sourceType: Rule['source_type'];
  version: string;
  url: string;
  effectiveDate: string | null;
}

const SOURCE_LABEL: Record<Rule['source_type'], string> = {
  FRCP: 'Federal Rule',
  LocalRule: 'Local Rule',
  JudgeProcedure: 'Judge-Specific Procedure',
  ECFManual: 'ECF Manual',
  StandingOrder: 'Standing Order',
};

const RulesSearch: React.FC = () => {
  const { rules, isLoading, error } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | Rule['source_type']>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  const availableSources = useMemo(() => {
    const unique = Array.from(new Set(rules.map((rule) => rule.source_type)));
    return ['all', ...unique] as Array<'all' | Rule['source_type']>;
  }, [rules]);

  const availableJurisdictions = useMemo(() => {
    const unique = Array.from(new Set(rules.map((rule) => rule.jurisdiction).filter(Boolean)));
    return ['all', ...unique];
  }, [rules]);

  const filteredResults: RuleSearchResult[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rules
      .filter((rule) => (selectedSource === 'all' ? true : rule.source_type === selectedSource))
      .filter((rule) => (selectedJurisdiction === 'all' ? true : rule.jurisdiction === selectedJurisdiction))
      .filter((rule) => {
        if (!query) return true;
        return (
          rule.citation.toLowerCase().includes(query) ||
          rule.text.toLowerCase().includes(query) ||
          (rule.version ?? '').toLowerCase().includes(query)
        );
      })
      .map((rule) => ({
        id: rule.id,
        citation: rule.citation || 'Untitled Rule',
        jurisdiction: rule.jurisdiction,
        summary: rule.text.slice(0, 240),
        sourceType: rule.source_type,
        version: rule.version,
        url: rule.url,
        effectiveDate: rule.effective_date,
      }));
  }, [rules, selectedSource, selectedJurisdiction, searchQuery]);

  const getSourceBadgeColor = (source: Rule['source_type']) => {
    switch (source) {
      case 'FRCP':
        return 'bg-blue-100 text-blue-800';
      case 'LocalRule':
        return 'bg-purple-100 text-purple-800';
      case 'JudgeProcedure':
        return 'bg-indigo-100 text-indigo-800';
      case 'ECFManual':
        return 'bg-amber-100 text-amber-800';
      case 'StandingOrder':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Rules & Research</h1>
        <p className="mt-2 text-slate-600">
          Search federal rules, local rules, and judge-specific requirements
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search rules, procedures, requirements..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-lg text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(event) => setSelectedSource(event.target.value as typeof selectedSource)}
                className={componentClasses.input.base}
              >
                {availableSources.map((source) => (
                  <option key={source} value={source}>
                    {source === 'all' ? 'All sources' : SOURCE_LABEL[source] ?? source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Jurisdiction
              </label>
              <select
                value={selectedJurisdiction}
                onChange={(event) => setSelectedJurisdiction(event.target.value)}
                className={componentClasses.input.base}
              >
                {availableJurisdictions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All jurisdictions' : option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full px-3 py-2 text-sm rounded-xl border bg-slate-100 border-slate-300 text-slate-700 font-semibold">
                {filteredResults.length} matches
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
            {isLoading && <span className="text-sm text-slate-500">Syncing rules…</span>}
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <Book className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium mb-2 text-slate-900">
              No rules found
            </p>
            <p className="text-slate-600">
              Try broadening your search or adjusting filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredResults.map((result) => (
              <div key={result.id} className="p-6 transition-colors hover:bg-slate-50">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {result.citation}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeColor(
                          result.sourceType,
                        )}`}
                      >
                        {SOURCE_LABEL[result.sourceType]}
                      </span>
                      {result.effectiveDate && (
                        <span className="text-xs text-slate-500">
                          Effective {new Date(result.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {result.summary}
                      {result.summary.length >= 240 && '…'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {result.jurisdiction && <span>Jurisdiction: {result.jurisdiction}</span>}
                      {result.version && <span>Version: {result.version}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open Source</span>
                    </a>
                    <button
                      className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                    >
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>Save to Case</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6 mt-8 border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-blue-100">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">
              AI-Powered Legal Assistant
            </h3>
            <p className="text-slate-700">
              Natural language question answering, multi-rule comparisons, and citation summarization are in development. Today you can browse the structured rule database above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesSearch;
