"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(searchParams.get("token") || "");
    setEmail(searchParams.get("email") || "");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 w-full relative z-10 py-20 mt-10">
      <div className="max-w-[480px] w-full mt-12">
        <div className="glass-panel p-8 rounded-xl shadow-[0_20px_50px_rgba(2,6,23,0.8)] border border-primary/20 relative">
          {/* Status Strip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 px-4 py-1 glass-panel border border-white/10 rounded-full bg-surface-container">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_#ffb4ab]"></span>
              <span className="font-mono-label text-[10px] text-error">SECURE RESET</span>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/30">
                <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h1 className="font-h2 text-h2 text-secondary mb-4">PASSWORD UPDATED</h1>
              <p className="font-body-md text-on-surface-variant mb-8">
                Your access credentials have been reset successfully.
              </p>
              <Link
                href="/login"
                className="inline-block bg-primary py-4 px-10 rounded-lg text-surface font-mono-label tracking-widest hover:cyan-glow transition-all uppercase"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 mt-4">
                <span className="material-symbols-outlined text-5xl text-primary mb-4 block">password</span>
                <h1 className="font-h2 text-h2 text-on-surface mb-2 tracking-tight">RESET_ACCESS_KEY</h1>
                <p className="font-body-md text-on-surface-variant opacity-70">
                  Enter your new password below.
                </p>
                {email && (
                  <p className="font-mono-label text-primary text-xs mt-2">{email}</p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-3 bg-error-container text-on-error-container rounded border border-error/50 font-mono-label text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="font-mono-label text-outline block ml-1">NEW_ACCESS_KEY</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-4 pl-12 rounded-lg transition-all duration-300 font-mono-label placeholder:text-outline-variant/50 focus:outline-none"
                      placeholder="••••••••"
                      type="password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono-label text-outline block ml-1">CONFIRM_ACCESS_KEY</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock_reset</span>
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-4 pl-12 rounded-lg transition-all duration-300 font-mono-label placeholder:text-outline-variant/50 focus:outline-none"
                      placeholder="••••••••"
                      type="password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full bg-primary py-4 rounded-lg text-surface font-h2 text-body-md font-bold tracking-widest hover:cyan-glow transition-all duration-300 transform active:scale-[0.98] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      RESETTING...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-on-surface-variant hover:text-primary font-mono-label text-sm">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
