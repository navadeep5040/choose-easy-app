"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface ProfileData {
  user: {
    _id: string;
    name: string;
    email: string;
    bio: string;
    avatar: string;
    role: string;
    createdAt: string;
  };
  stats: {
    totalBookings: number;
    completedSessions: number;
    confirmedSessions: number;
    totalPayments: number;
    totalSpent: number;
  };
}

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // FIX: Prevents re-fetch when next-auth re-emits the same session reference
  const hasFetched = useRef(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, session]);

  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.user.name);
        setEditBio(data.user.bio);
      } else {
        const data = await res.json().catch(() => ({}));
        // Stale session: user ID in JWT no longer exists in DB (e.g. after DB reset)
        if (data.code === 'SESSION_INVALID' || res.status === 401) {
          showToast("Session expired — please log in again", "error");
          await signOut({ redirect: false });
          window.location.href = "/login?reason=session_expired";
          return;
        }
        setError(data.error || `Failed to load profile (Status: ${res.status})`);
        showToast(data.error || "Failed to load profile", "error");
      }
    } catch (err) {
      setError("Network error: Failed to connect to server");
      showToast("Failed to load profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, bio: editBio }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, user: data.user } : prev);
        setIsEditing(false);
        showToast("Profile updated successfully!", "success");
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4 animate-pulse">error</span>
        <h2 className="font-h2 text-2xl text-on-surface mb-2">SYSTEM ERROR</h2>
        <p className="font-body-md text-on-surface-variant mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            hasFetched.current = false;
            fetchProfile();
          }}
          className="px-6 py-3 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
        <p className="font-mono-label text-outline mt-4 animate-pulse">LOADING PROFILE...</p>
      </div>
    );
  }

  const { user, stats } = profile;
  const isMentor = user.role === "mentor";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roleBadge: Record<string, { color: string; label: string }> = {
    admin: { color: "bg-error/20 text-error border-error/30", label: "ADMIN" },
    mentor: { color: "bg-secondary/20 text-secondary border-secondary/30", label: "MENTOR" },
    user: { color: "bg-primary/20 text-primary border-primary/30", label: "USER" },
    pending_mentor: { color: "bg-tertiary/20 text-tertiary border-tertiary/30", label: "PENDING MENTOR" },
  };

  const badge = roleBadge[user.role] || roleBadge.user;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="glass-panel rounded-2xl border border-primary/20 p-8 mb-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border border-primary/20 flex-shrink-0">
            <img 
              src={user.avatar || "/placeholders/mentor.png"} 
              alt={user.name} 
              className="w-full h-full rounded-2xl object-cover" 
              onError={(e) => {
                e.currentTarget.src = "/placeholders/mentor.png";
              }}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface font-h2 text-2xl focus:border-primary focus:outline-none"
                  placeholder="Your name"
                />
              ) : (
                <h1 className="font-h1 text-3xl text-on-surface">{user.name || "Anonymous User"}</h1>
              )}
              <span className={`px-3 py-1 rounded-full border text-[10px] font-mono-label ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <p className="font-mono-label text-outline text-xs mb-2">{user.email}</p>

            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface-variant font-body-md text-sm mt-2 focus:border-primary focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="font-body-md text-on-surface-variant text-sm mt-1">
                {user.bio || "No bio yet. Click edit to add one."}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <span className="material-symbols-outlined text-outline text-[16px]">calendar_today</span>
              <span className="font-mono-label text-outline text-[10px]">MEMBER SINCE {memberSince.toUpperCase()}</span>
            </div>
          </div>

          {/* Edit/Save Button */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-secondary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  )}
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(user.name);
                    setEditBio(user.bio);
                  }}
                  className="px-6 py-3 border border-outline-variant text-outline rounded-lg font-mono-label text-xs uppercase hover:border-error hover:text-error transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:cyan-glow transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-xl border border-primary/20 text-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-2 block">calendar_month</span>
          <p className="font-display-xl text-3xl text-on-background">{stats.totalBookings}</p>
          <p className="font-mono-label text-outline text-[9px] mt-1">{isMentor ? "TOTAL SESSIONS" : "TOTAL BOOKINGS"}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-secondary/20 text-center">
          <span className="material-symbols-outlined text-secondary text-2xl mb-2 block">event_available</span>
          <p className="font-display-xl text-3xl text-secondary">{stats.confirmedSessions}</p>
          <p className="font-mono-label text-outline text-[9px] mt-1">{isMentor ? "ACTIVE SESSIONS" : "ACTIVE SESSIONS"}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-primary/20 text-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-2 block">check_circle</span>
          <p className="font-display-xl text-3xl text-on-background">{stats.completedSessions}</p>
          <p className="font-mono-label text-outline text-[9px] mt-1">{isMentor ? "COMPLETED SESSIONS" : "COMPLETED"}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-secondary/20 text-center">
          <span className="material-symbols-outlined text-secondary text-2xl mb-2 block">receipt</span>
          <p className="font-display-xl text-3xl text-secondary">{stats.totalPayments}</p>
          <p className="font-mono-label text-outline text-[9px] mt-1">{isMentor ? "EARNINGS TRXS" : "PAYMENTS"}</p>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-primary/20 text-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-2 block">payments</span>
          <p className="font-display-xl text-3xl text-primary">${stats.totalSpent}</p>
          <p className="font-mono-label text-outline text-[9px] mt-1">{isMentor ? "TOTAL EARNED" : "TOTAL SPENT"}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard" className="glass-panel p-6 rounded-2xl border border-outline-variant/20 hover:border-primary/40 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">dashboard</span>
            <h3 className="font-h2 text-lg">Dashboard</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">View your bookings and active sessions.</p>
        </Link>

        <Link href="/courses" className="glass-panel p-6 rounded-2xl border border-outline-variant/20 hover:border-secondary/40 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">school</span>
            <h3 className="font-h2 text-lg">Courses</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">Explore courses and enroll for learning.</p>
        </Link>

        <Link href="/dashboard/chat" className="glass-panel p-6 rounded-2xl border border-outline-variant/20 hover:border-primary/40 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">smart_toy</span>
            <h3 className="font-h2 text-lg">AI Assistant</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">Get career guidance from our AI chatbot.</p>
        </Link>
      </div>
    </div>
  );
}
