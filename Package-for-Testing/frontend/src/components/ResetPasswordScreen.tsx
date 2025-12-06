import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { componentClasses } from '../lib/theme';

const ResetPasswordScreen: React.FC = () => {
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract uid and token from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const uidParam = params.get('uid');
    const tokenParam = params.get('token');

    if (uidParam && tokenParam) {
      setUid(uidParam);
      setToken(tokenParam);
    } else {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/users/confirm-reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Unable to reset password. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
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
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Password reset successful!
              </h2>
              <p className="text-slate-600 mb-6">
                Your password has been changed successfully. You can now log in with your new password.
              </p>
              <Link
                to="/"
                className={`${componentClasses.button.primary} w-full justify-center`}
              >
                <span>Continue to login</span>
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

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Create new password
            </h2>
            <p className="text-sm text-slate-600">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={componentClasses.input.base}
                placeholder="Enter new password"
                required
                disabled={!uid || !token}
              />
              <p className="text-xs text-slate-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={componentClasses.input.base}
                placeholder="Confirm new password"
                required
                disabled={!uid || !token}
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !uid || !token}
              className={`${componentClasses.button.primary} w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Lock className="h-5 w-5" />
              <span>{isSubmitting ? 'Resetting password...' : 'Reset password'}</span>
            </button>

            {(!uid || !token) && (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Request a new reset link
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;

