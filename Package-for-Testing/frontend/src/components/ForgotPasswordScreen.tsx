import React, { useState } from 'react';
import { Mail, ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { componentClasses } from '../lib/theme';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/users/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Unable to send reset email. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 shadow-lg mb-4">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Precedentum
            </h1>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Check your email
              </h2>
              <p className="text-slate-600 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <p className="text-sm text-slate-500 mb-6">
                If you don't see the email, check your spam folder. The reset link will expire in 24 hours.
              </p>
              <Link
                to="/"
                className={`${componentClasses.button.secondary} w-full justify-center`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 shadow-lg mb-4">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Precedentum
          </h1>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Reset your password
            </h2>
            <p className="text-sm text-slate-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={componentClasses.input.base}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${componentClasses.button.primary} w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Mail className="h-5 w-5" />
              <span>{isSubmitting ? 'Sending...' : 'Send reset instructions'}</span>
            </button>

            <Link
              to="/"
              className={`${componentClasses.button.secondary} w-full justify-center`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to login</span>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;

