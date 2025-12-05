import React, { useState } from 'react';
import { LogIn, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { componentClasses } from '../lib/theme';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to sign in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 shadow-lg mb-4">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Precedentum
          </h1>
          <p className="text-slate-600">
            Federal Court Compliance Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-slate-600">
              Sign in to your account to continue
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={componentClasses.input.base}
                placeholder="Enter your password"
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
              <LogIn className="h-5 w-5" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Demo credentials: demo.lawyer@example.com / changeme123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
