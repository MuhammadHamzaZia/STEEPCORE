import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck, Database, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { loginWithGoogle, isLoading } = useAuthStore();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await loginWithGoogle();
      setSuccessMessage('Successfully signed in with Google! Syncing with database...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in cancelled. The Google popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('The Google popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setErrorMessage(err.message || 'Failed to authenticate with Google. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Steepcore Logo" className="w-5 h-5 object-contain" />
            <h2 className="text-base font-semibold text-[#e6edf3]">
              Sign In to STEEPCORE
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
        <div className="p-6 flex flex-col gap-5">
          {errorMessage && (
            <div className="px-3.5 py-2.5 bg-[#21262d] border border-[#f85149]/30 rounded-lg text-xs text-[#e6edf3] flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 overflow-hidden">
                <AlertCircle size={15} className="text-[#f85149] shrink-0" />
                <span className="text-[#f0883e] font-medium leading-tight">{errorMessage}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMessage(null)} 
                className="text-[#7d8590] hover:text-[#e6edf3] p-0.5 rounded transition-colors"
                aria-label="Clear error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="px-3.5 py-2.5 bg-[#21262d] border border-[#238636]/40 rounded-lg text-xs text-[#3fb950] flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 size={15} className="shrink-0" />
              <span className="font-medium leading-tight">{successMessage}</span>
            </div>
          )}

          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-semibold text-[#e6edf3]">
              Welcome to STEEPCORE
            </h3>
            <p className="text-xs text-[#7d8590] max-w-xs mx-auto">
              Sign in with your Google account to access your roadmaps, checkpoint progress, and custom blueprints across all your devices.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 gap-2.5 p-3.5 bg-[#161b22]/70 border border-[#30363d] rounded-lg">
            <div className="flex items-center gap-2.5 text-xs text-[#c9d1d9]">
              <ShieldCheck size={16} className="text-[#3fb950] shrink-0" />
              <span>Pre-verified email security — no OTP delay or spam folder issues</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#c9d1d9]">
              <Database size={16} className="text-[#58a6ff] shrink-0" />
              <span>Automatic real-time sync with STEEPCORE database API</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#c9d1d9]">
              <Sparkles size={16} className="text-[#d29922] shrink-0" />
              <span>Instant access to AI roadmap generator and progress checkpoints</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#161b22] border-t border-[#30363d] text-[11px] text-[#7d8590] text-center font-mono flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
          <span>STEEPCOREAPI: /api/Auth/firebase-login (Linked with Database)</span>
        </div>
      </div>
    </div>
  );
}
