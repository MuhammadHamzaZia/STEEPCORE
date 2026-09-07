import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, register, isLoading } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        await login(email || username, password);
        setSuccessMessage('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        if (!username.trim()) {
          setErrorMessage('Username is required for registration.');
          return;
        }
        await register(username, email, password);
        setSuccessMessage('Registered and logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-2">
            <KeyRound size={20} className="text-[#3fb950]" />
            <h2 className="text-base font-semibold text-[#e6edf3]">
              {mode === 'login' ? 'Sign In to STEEPCORE' : 'Create an Account'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-[#7d8590] hover:text-[#e6edf3] p-1 rounded-md hover:bg-[#21262d] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 bg-[#f85149]/10 border border-[#f85149]/40 rounded-lg text-xs text-[#f85149] flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#238636]/10 border border-[#238636]/40 rounded-lg text-xs text-[#3fb950] flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#7d8590] mb-1.5 uppercase">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dev_creator" 
                  required={mode === 'register'}
                  className="w-full bg-[#010409] border border-[#30363d] rounded-md py-2 pl-9 pr-3 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] placeholder:text-[#484f58]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#7d8590] mb-1.5 uppercase">
              {mode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]" />
              <input 
                type={mode === 'register' ? 'email' : 'text'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com" 
                required
                className="w-full bg-[#010409] border border-[#30363d] rounded-md py-2 pl-9 pr-3 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] placeholder:text-[#484f58]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7d8590] mb-1.5 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8590]" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" 
                required
                className="w-full bg-[#010409] border border-[#30363d] rounded-md py-2 pl-9 pr-3 text-sm text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] placeholder:text-[#484f58]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-medium py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] shadow-sm disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="text-center text-xs text-[#7d8590] mt-1">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setMode('register'); setErrorMessage(null); }}
                    className="text-[#58a6ff] hover:underline font-medium"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setMode('login'); setErrorMessage(null); }}
                    className="text-[#58a6ff] hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Footer info */}
        <div className="p-3 bg-[#161b22] border-t border-[#30363d] text-[11px] text-[#7d8590] text-center font-mono">
          STEEPCOREAPI: https://steepcoreapi.onrender.com
        </div>
      </div>
    </div>
  );
}
