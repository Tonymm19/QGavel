import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Check, X } from 'lucide-react';

interface TermsAndConditionsProps {
  userId: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsAndConditions({ userId, onAccept, onDecline }: TermsAndConditionsProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      alert('Please check the box to indicate you have read and agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      onAccept();
    } catch (error) {
      console.error('Error accepting terms:', error);
      alert('Failed to save terms acceptance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      onDecline();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 flex items-center gap-3">
          <FileText className="w-8 h-8 text-slate-900" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Software Licensing Terms and Conditions
          </h2>
        </div>

        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h3>
              <p className="text-slate-700 leading-relaxed">
                By accessing and using this legal case management software, you acknowledge that you have read,
                understood, and agree to be bound by these terms and conditions. If you do not agree to these
                terms, you must not use this software.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">2. License Grant</h3>
              <p className="text-slate-700 leading-relaxed">
                Subject to your compliance with these terms, we grant you a limited, non-exclusive,
                non-transferable, revocable license to use the software for your internal business purposes
                in accordance with the documentation and any applicable subscription agreement.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Data Security and Privacy</h3>
              <p className="text-slate-700 leading-relaxed">
                We implement industry-standard security measures to protect your data. However, you acknowledge
                that no system is completely secure. You are responsible for maintaining the confidentiality of
                your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">4. Professional Responsibility</h3>
              <p className="text-slate-700 leading-relaxed">
                This software is a tool to assist in case management. You remain solely responsible for your
                professional obligations, including but not limited to attorney-client relationships,
                confidentiality requirements, and ethical standards. The software does not provide legal advice.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">5. Prohibited Uses</h3>
              <p className="text-slate-700 leading-relaxed">
                You agree not to: (a) use the software for any unlawful purpose; (b) attempt to gain
                unauthorized access to any part of the software; (c) interfere with or disrupt the software
                or servers; (d) use the software to transmit any viruses or malicious code; or (e) reverse
                engineer, decompile, or disassemble the software.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">6. Data Backup and Retention</h3>
              <p className="text-slate-700 leading-relaxed">
                While we maintain regular backups, you are responsible for maintaining your own backup copies
                of your data. We are not liable for any data loss or corruption that may occur.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">7. Limitation of Liability</h3>
              <p className="text-slate-700 leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether
                incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">8. Modifications to Terms</h3>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the software after
                such modifications constitutes your acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">9. Termination</h3>
              <p className="text-slate-700 leading-relaxed">
                We may terminate or suspend your access to the software immediately, without prior notice or
                liability, for any reason, including breach of these terms. Upon termination, your right to
                use the software will immediately cease.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">10. Governing Law</h3>
              <p className="text-slate-700 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which your firm operates, without regard to its conflict of law provisions.
              </p>
            </section>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
              I have read and agree to the Software Licensing Terms and Conditions outlined above.
              I understand that by clicking "Accept and Continue," I am legally bound by these terms.
            </span>
          </label>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <X className="w-5 h-5" />
              Decline and Exit
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || !accepted}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
            >
              <Check className="w-5 h-5" />
              {loading ? 'Processing...' : 'Accept and Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
