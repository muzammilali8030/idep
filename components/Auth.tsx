import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { authService } from '../services/authService';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  AlertTriangle,
  ArrowLeft
} from './Icons';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onCancel: () => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT';

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onCancel }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const user = await authService.login(formData.email, formData.password);
        onAuthSuccess(user);
      } else if (mode === 'SIGNUP') {
        const user = await authService.signup(formData.name, formData.email, formData.password);
        onAuthSuccess(user);
      } else if (mode === 'FORGOT') {
        await authService.resetPassword(formData.email);
        setSuccessMsg("If an account exists, we've sent a reset link to your email.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      onAuthSuccess(user);
    } catch (err) {
      setError("Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <button 
        onClick={onCancel}
        className="absolute top-6 left-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {mode === 'LOGIN' && 'Welcome Back'}
            {mode === 'SIGNUP' && 'Create Account'}
            {mode === 'FORGOT' && 'Reset Password'}
          </h2>
          <p className="text-slate-500">
            {mode === 'LOGIN' && 'Enter your details to access your reports.'}
            {mode === 'SIGNUP' && 'Start validating your ideas today.'}
            {mode === 'FORGOT' && 'Enter your email to receive instructions.'}
          </p>
        </div>

        {/* Error / Success Messages */}
        <div className="px-8 mt-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email"
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {mode !== 'FORGOT' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'LOGIN' && (
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => setMode('FORGOT')} className="text-sm text-brand-600 hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold text-lg hover:bg-brand-700 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {mode === 'LOGIN' && 'Sign In'}
            {mode === 'SIGNUP' && 'Create Account'}
            {mode === 'FORGOT' && 'Send Reset Link'}
          </button>

          {/* Social Auth */}
          {mode !== 'FORGOT' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </>
          )}

          {/* Switch Mode */}
          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => {
                  setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-brand-600 hover:underline"
              >
                {mode === 'LOGIN' ? 'Sign up' : 'Log in'}
              </button>
            </p>
            {mode === 'FORGOT' && (
              <button 
                type="button" 
                onClick={() => setMode('LOGIN')}
                className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Back to Login
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

// Helper component for imported Icons in other files to avoid breaking changes if they are missing
import { CheckCircle } from './Icons';