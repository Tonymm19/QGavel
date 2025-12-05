import { Scale, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';

import { useData } from '../contexts/DataContext';
import { getIconContainerClass } from '../lib/theme';

export default function JudgeProfiles() {
  const { judges, isLoading, error } = useData();

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Judge Profiles</h1>
        <p className="text-slate-600">
          View judge contact details, court assignments, and holiday calendars
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-600">Loading judges…</p>
        </div>
      )}

      {!isLoading && judges.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">
            No judges found. Add judge records in the Django admin to populate this list.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {judges.map((judge) => (
          <div
            key={judge.id}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={getIconContainerClass('slate')}>
                <Scale className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-1 text-slate-900">
              {judge.full_name}
            </h3>

            <p className="flex items-center text-sm mb-4 text-slate-600">
              <MapPin className="h-4 w-4 mr-2" />
              {judge.court_name ?? 'Unassigned court'}
            </p>

            <dl className="space-y-3 border-t border-slate-200 pt-4">
              {judge.courtroom && (
                <div>
                  <dt className="text-sm uppercase font-semibold text-slate-500 mb-1">Courtroom</dt>
                  <dd className="text-xs text-slate-700">{judge.courtroom}</dd>
                </div>
              )}
              {judge.holiday_calendar_name && (
                <div>
                  <dt className="text-sm uppercase font-semibold text-slate-500 mb-1">
                    Holiday Calendar
                  </dt>
                  <dd className="text-xs text-slate-700">{judge.holiday_calendar_name}</dd>
                </div>
              )}
              {judge.contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  <a
                    href={`mailto:${judge.contact_email}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {judge.contact_email}
                  </a>
                </div>
              )}
              {judge.contact_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-700">{judge.contact_phone}</span>
                </div>
              )}

              {/* Chamber Staff Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <dt className="text-xs uppercase font-semibold text-slate-500 mb-3">
                  Chamber Staff
                </dt>

                {/* 1. Court Reporter */}
                <div className="mb-3">
                  <div className="text-sm font-semibold text-slate-600 mb-1">Court Reporter</div>
                  {judge.court_reporter_name ? (
                    <div className="text-xs text-slate-700">
                      <div className="font-medium">{judge.court_reporter_name}</div>
                      {judge.court_reporter_phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.court_reporter_phone}</span>
                        </div>
                      )}
                      {judge.court_reporter_room && (
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.court_reporter_room}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">No Court Reporter listed</div>
                  )}
                </div>

                {/* 2. Courtroom Deputy */}
                <div className="mb-3">
                  <div className="text-sm font-semibold text-slate-600 mb-1">Courtroom Deputy</div>
                  {judge.clerk_name ? (
                    <div className="text-xs text-slate-700">
                      <div className="font-medium">{judge.clerk_name}</div>
                      {judge.clerk_phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.clerk_phone}</span>
                        </div>
                      )}
                      {judge.clerk_room && (
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.clerk_room}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">No Courtroom Deputy listed</div>
                  )}
                </div>

                {/* 3. Executive Law Clerk - only show if exists */}
                {judge.executive_law_clerk && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-slate-600 mb-1">Executive Law Clerk</div>
                    <div className="text-xs text-slate-700">
                      <div className="font-medium">{judge.executive_law_clerk}</div>
                      {judge.executive_law_clerk_phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.executive_law_clerk_phone}</span>
                        </div>
                      )}
                      {judge.executive_law_clerk_room && (
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.executive_law_clerk_room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Judicial Assistant - only show if exists */}
                {judge.judicial_assistant && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-slate-600 mb-1">Judicial Assistant</div>
                    <div className="text-xs text-slate-700">
                      <div className="font-medium">{judge.judicial_assistant}</div>
                      {judge.judicial_assistant_phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.judicial_assistant_phone}</span>
                        </div>
                      )}
                      {judge.judicial_assistant_room && (
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 text-slate-500 mr-1.5" />
                          <span>{judge.judicial_assistant_room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Law Clerk(s) */}
                {judge.apprentices && (
                  <div className="mb-0">
                    <div className="text-sm font-semibold text-slate-600 mb-1">
                      {judge.apprentices.split('\n').length > 1 ? 'Law Clerks' : 'Law Clerk'}
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-line">{judge.apprentices}</div>
                  </div>
                )}
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
