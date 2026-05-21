"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getHomePathForRole } from "@/lib/auth-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
    }
    if (searchParams.get('reason') === 'session_expired') {
      setSuccessMessage('Your session has expired or is no longer valid. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        const session = await getSession();
        const role = session?.user?.role;
        router.push(getHomePathForRole(role));
      }
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (res.ok) {
        setIsLogin(true);
        setSuccessMessage(
          role === "mentor"
            ? "Mentor application submitted. Sign in after an admin approves your access."
            : "Registration successful! Please sign in."
        );
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 w-full relative z-10 py-20 mt-10">
      {/* Technical Crosshairs */}
      <div className="absolute top-0 left-8 border-t border-l border-primary/20 w-8 h-8 pointer-events-none hidden md:block"></div>
      <div className="absolute top-0 right-8 border-t border-r border-primary/20 w-8 h-8 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-0 left-8 border-b border-l border-primary/20 w-8 h-8 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-0 right-8 border-b border-r border-primary/20 w-8 h-8 pointer-events-none hidden md:block"></div>

      <div className="max-w-[480px] w-full mt-12">
        <div className="glass-panel p-8 rounded-xl shadow-[0_20px_50px_rgba(2,6,23,0.8)] border border-primary/20 relative">
          {/* Status Strip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 px-4 py-1 glass-panel border border-white/10 rounded-full bg-surface-container">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]"></span>
              <span className="font-mono-label text-[10px] text-secondary">ENCRYPTED</span>
            </div>
          </div>

          <div className="text-center mb-8 mt-4">
            <h1 className="font-h2 text-h2 text-on-surface mb-2 tracking-tight">IDENTITY_VERIFICATION</h1>
            <p className="font-body-md text-on-surface-variant opacity-70">Access the high-fidelity terminal ecosystem.</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-3 bg-secondary/10 text-secondary rounded border border-secondary/30 font-mono-label text-sm text-center">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-error-container text-on-error-container rounded border border-error/50 font-mono-label text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="font-mono-label text-outline block ml-1">USER_DESIGNATION (NAME) *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-4 pl-12 rounded-lg transition-all duration-300 font-mono-label placeholder:text-outline-variant/50 focus:outline-none" 
                      placeholder="John Doe" 
                      type="text" 
                      required={!isLogin} 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono-label text-outline block ml-1">ACCESS_LEVEL</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">admin_panel_settings</span>
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-4 pl-12 rounded-lg transition-all duration-300 font-mono-label focus:outline-none appearance-none" 
                    >
                      <option value="user" className="bg-surface-container text-on-surface">Standard User</option>
                      <option value="mentor" className="bg-surface-container text-on-surface">Mentor (Requires Approval)</option>
                      <option value="admin" className="bg-surface-container text-on-surface">Admin (Demo/Testing)</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="font-mono-label text-outline block ml-1">USER_IDENTIFIER</label>
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
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="font-mono-label text-outline block">ACCESS_KEY</label>
                {isLogin && <Link className="font-mono-label text-secondary hover:text-primary text-[10px] uppercase tracking-wider" href="/forgot-password">Forgot?</Link>}
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock_open</span>
                <input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-4 pl-12 rounded-lg transition-all duration-300 font-mono-label placeholder:text-outline-variant/50 focus:outline-none" 
                  placeholder="••••••••" 
                  type="password" 
                  required 
                />
              </div>
            </div>
            <button className="w-full bg-primary py-4 rounded-lg text-surface font-h2 text-body-md font-bold tracking-widest hover:cyan-glow transition-all duration-300 transform active:scale-[0.98] uppercase" type="submit">
              {isLogin ? "Initialize Session" : "Create Authorization"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="font-body-md text-on-surface-variant text-sm">
              {isLogin ? "New to the network?" : "Already possess authorization?"} 
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); setSuccessMessage(""); }}
                className="text-primary hover:underline font-bold ml-2 font-mono-label"
              >
                {isLogin ? "Create Access Account" : "Initialize Session"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">verified_user</span>
              <span className="font-mono-label text-[10px] text-outline">AES-256 BIT ENCRYPTION</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">shield_with_heart</span>
              <span className="font-mono-label text-[10px] text-outline">PRIVACY PROTOCOL v4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center px-4 w-full py-20 mt-10">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">
              progress_activity
            </span>
            <p className="font-mono-label text-outline mt-4 animate-pulse">
              INITIALIZING IDENTITY GATEWAY...
            </p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
