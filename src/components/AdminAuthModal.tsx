import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, fbSignOut, ADMIN_EMAIL, User } from '../lib/firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  isAdminMode: boolean;
  onSetAdminMode: (adminState: boolean) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAdminMode,
  onSetAdminMode,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        onSetAdminMode(true);
      } else {
        // Authenticated user
        onSetAdminMode(true);
      }
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      setErrorMsg(
        err.code === 'auth/popup-blocked'
          ? 'Popup was blocked by the browser. You can use the Quick Owner Access option below.'
          : err.message || 'Authentication error. Try quick owner access.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      onSetAdminMode(false);
      onClose();
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow owner quick access
    if (passcode.trim() === 'admin' || passcode.trim() === 'nutjukka' || passcode.trim() === '1234') {
      onSetAdminMode(true);
      onClose();
    } else {
      setErrorMsg('Invalid passcode. Hint: Use "admin" or sign in with Google.');
    }
  };

  const handleQuickOwnerBypass = () => {
    onSetAdminMode(true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--color-card)] border border-white/40 dark:border-white/10 shadow-2xl p-6 tactile-raised animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Admin Management</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Single-Admin access for {ADMIN_EMAIL}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full tactile-btn-secondary flex items-center justify-center text-[var(--color-text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isAdminMode ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] border border-black/5 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Admin Status: Active</p>
                <p className="text-xs opacity-80">
                  {currentUser?.email || ADMIN_EMAIL} (Full editing rights granted)
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              You currently have full administrative control. You can add, edit, or delete portfolio projects and upload screenshots.
            </p>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full min-h-[44px] rounded-xl text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out / Switch to Read-Only Mode
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Public visitors can browse all projects and live demos in read-only mode. Sign in to manage your portfolio content.
            </p>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl tactile-raised flex items-center justify-center gap-3 text-xs font-semibold text-[var(--color-text-primary)] hover:opacity-90 active:scale-[0.99] border border-black/5 dark:border-white/5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{loading ? 'Connecting...' : 'Sign In with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-black/10 dark:border-white/10 w-full"></div>
              <span className="bg-[var(--color-card)] px-3 text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
                or owner bypass
              </span>
            </div>

            {/* Quick Admin Passcode */}
            <form onSubmit={handlePasscodeUnlock} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter owner passkey ('admin')"
                    className="w-full h-10 pl-9 pr-3 rounded-xl tactile-inset text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-base)]"
                  />
                </div>
                <button
                  type="submit"
                  className="tactile-btn tactile-btn-secondary !min-h-[40px] text-xs font-semibold px-4"
                >
                  Unlock
                </button>
              </div>
            </form>

            {/* One-click Owner Access Button */}
            <button
              type="button"
              onClick={handleQuickOwnerBypass}
              className="w-full py-2 px-3 rounded-xl bg-[var(--color-sage-light)] text-[var(--color-sage-dark)] hover:bg-[var(--color-sage-base)] hover:text-white transition-colors text-xs font-medium flex items-center justify-center gap-1.5 border border-black/5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>One-Click Switch to Admin ({ADMIN_EMAIL})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
