import React, { useEffect, useState } from 'react';
import { Mail, Lock, Loader, ShieldHalf } from 'lucide-react';
import { authService } from '../../services/api';

const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      onNavigate('dashboard');
    }
  }, [onNavigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-10 -right-6 bg-white/70 backdrop-blur-xl rounded-3xl px-6 py-3 shadow-xl flex items-center gap-2 text-lime-700">
          <ShieldHalf className="w-5 h-5" />
          <span className="font-semibold">Powered by Firebase</span>
        </div>

        <div className="heart-robot-card rounded-3xl px-8 py-10">
          <div className="flex flex-col items-center text-center mb-8 space-y-3">
            <div className="text-4xl">🤖❤️</div>
            <h1 className="text-4xl font-extrabold text-lime-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Heart Robot
            </h1>
            <p className="text-gray-600 font-semibold">Maths Challenge Login</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-lime-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-full border border-lime-200 bg-white px-12 py-3 text-gray-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
                  placeholder="player@heartrobot.com"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-lime-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-full border border-lime-200 bg-white px-12 py-3 text-gray-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
                  placeholder="Enter your secret code"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="heart-robot-button w-full rounded-full px-6 py-3 text-lg font-bold shadow-lg transition-transform duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            New to the challenge?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="font-semibold text-rose-500 underline-offset-2 hover:underline"
            >
              Create a Heart Robot account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;