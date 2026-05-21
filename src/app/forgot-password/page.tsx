"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message?: string; demoResetUrl?: string } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
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
              <span className="font-mono-label text-[10px] text-error">RECOVERY MODE</span>
            </div>
          </div>

          <div className="text-center mb-8 mt-4">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">lock_reset</span>
            <h1 className="font-h2 text-h2 text-on-surface mb-2 tracking-tight">PASSWORD_RECOVERY</h1>
            <p className="font-body-md text-on-surface-variant opacity-70">
              Enter your registered email to receive a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-error-container text-on-error-container rounded border border-error/50 font-mono-label text-sm text-center">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-6">
              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-xl text-center">
                <span className="material-symbols-outlined text-secondary text-3xl mb-2 block">mark_email_read</span>
                <p className="font-body-md text-secondary mb-2">{result.message}</p>
              </div>

              {/* Demo-only: show the reset link */}
              {result.demoResetUrl && (
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/30">
                  <p className="font-mono-label text-outline text-[10px] uppercase mb-2">DEMO MODE — Reset Link:</p>
                  <Link
                    href={result.demoResetUrl}
                    className="text-primary hover:underline font-mono-label text-sm break-all"
                  >
                    {result.demoResetUrl}
                  </Link>
                  <p className="font-mono-label text-outline text-[9px] mt-2">
                    In production, this link would be sent via email.
                  </p>
                </div>
              )}

              <Link
                href="/login"
                className="block text-center text-primary hover:underline font-mono-label uppercase text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="font-mono-label text-outline block ml-1">REGISTERED_EMAIL</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-4 pl-12 rounded-lg transition-all duration-300 font-mono-label placeholder:text-outline-variant/50 focus:outline-none"
                    placeholder="name@domain.com"
                    type="email"
                    required
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
                    PROCESSING...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-on-surface-variant hover:text-primary font-mono-label text-sm">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
