import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { authService } from '../../services/api';

const SignUp = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData.name, formData.email, formData.password);
      onNavigate('dashboard');
    } catch (error) {
      setApiError(error?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-yellow-50 to-rose-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl heart-robot-card rounded-3xl px-10 py-12 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-lime-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 text-6xl opacity-80" aria-hidden>
          🤖
        </div>

        <div className="relative mb-8 text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-lime-700" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Join Heart Robot
          </h1>
            <p className="text-gray-600 font-semibold">Power up your maths adventure</p>
        </div>

        {apiError && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600 text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Player Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-lime-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-full border px-12 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-200 ${
                  errors.name ? 'border-rose-300' : 'border-lime-200'
                }`}
                placeholder="Heart Hero"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-lime-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-full border px-12 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-200 ${
                  errors.email ? 'border-rose-300' : 'border-lime-200'
                }`}
                placeholder="player@heartrobot.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-lime-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-full border px-12 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-200 ${
                  errors.password ? 'border-rose-300' : 'border-lime-200'
                }`}
                placeholder="At least 6 characters"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs font-semibold text-rose-500">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-lime-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-full border px-12 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-200 ${
                  errors.confirmPassword ? 'border-rose-300' : 'border-lime-200'
                }`}
                placeholder="Repeat your password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="heart-robot-button w-full rounded-full px-6 py-3 text-lg font-bold shadow-lg transition-transform duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                Creating profile...
              </span>
            ) : (
              'Start the Challenge'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already charging hearts?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-semibold text-rose-500 underline-offset-2 hover:underline"
          >
            Log in instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;