import React, { useState } from 'react';
import { ApiClient } from '../utils/apiClient';
import { Operator } from '../types';
import { Lock, Mail, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (operator: Operator) => void;
  onClose: () => void;
  language: 'fa' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  language
}) => {
  const isFa = language === 'fa';
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isFa ? 'لطفاً ایمیل و رمز عبور را وارد نمایید.' : 'Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await ApiClient.login(email, password);
      onSuccess(res.operator);
      onClose();
    } catch (err: any) {
      setError(err.message || (isFa ? 'ایمیل یا رمز عبور نامعتبر است' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-md rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isFa ? 'ورود به حساب کاربری سازمانی' : 'Sign in to Enterprise Account'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isFa ? 'احراز هویت و دسترسی به پنل مدیریت MySQL' : 'Direct API & MySQL session authentication'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {isFa ? 'ایمیل کاری اپراتور / مدیر' : 'Work Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#007AFF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {isFa ? 'رمز عبور' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#007AFF]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#007AFF] hover:bg-[#0062cc] transition text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>{isFa ? 'در حال ورود...' : 'Signing in...'}</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isFa ? 'ورود امن به پنل اپراتوری' : 'Authenticate Session'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#242f3d] flex justify-between items-center text-xs text-zinc-400">
          <span>{isFa ? 'حالت آزمایشی / لوکال:' : 'Demo credentials:'}</span>
          <span className="font-mono text-zinc-300">admin@company.com</span>
        </div>
      </div>
    </div>
  );
};
