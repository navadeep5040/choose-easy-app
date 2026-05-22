"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  DashboardLoading,
  DashboardEmpty,
  DashboardSection,
  StatCard,
  StatusBadge,
} from "@/components/DashboardUI";

interface BookingData {
  _id: string;
  userName: string;
  subject: string;
  scheduledDate: string;
  timeSlot: { startTime: string; endTime: string };
  status: string;
  createdAt: string;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface MentorProfile {
  _id: string;
  name: string;
  bio: string;
  domain: string;
  image: string;
  headline: string;
  teachingDescription: string;
  expertiseAreas: string[];
  learningOutcomes: string[];
  sessionExpectations: string;
  yearsOfExperience: number;
  teachingCategories: string[];
  linkedIn: string;
  github: string;
  portfolio: string;
  subjects: string[];
  availability: AvailabilitySlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MentorDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const hasFetched = useRef(false);
  const router = useRouter();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "availability" | "earnings" | "profile">("bookings");

  // Availability form
  const [newDay, setNewDay] = useState("Monday");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("12:00");
  const [isSaving, setIsSaving] = useState(false);
  const [noProfile, setNoProfile] = useState(false);

  // Profile editor state
  const [profile, setProfile] = useState<Partial<MentorProfile>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "bookings" || tab === "availability" || tab === "earnings" || tab === "profile") {
        setActiveTab(tab);
      }
    }

    const role = (session.user as { role?: string }).role;
    if (!role) {
      return;
    }

    if (role !== "mentor") {
      const url = role === "pending_mentor" ? "/dashboard?mentor=pending" : "/dashboard";
      router.push(url);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, session]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bookingsRes = await fetch("/api/bookings");
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }

      const meRes = await fetch("/api/mentors/me");
      if (meRes.ok) {
        const myProfile = await meRes.json();
        setMentorId(myProfile._id);
        setAvailability(myProfile.availability || []);
        setProfile({
          name: myProfile.name || "",
          bio: myProfile.bio || "",
          domain: myProfile.domain || "",
          image: myProfile.image || "",
          headline: myProfile.headline || "",
          teachingDescription: myProfile.teachingDescription || "",
          expertiseAreas: myProfile.expertiseAreas || [],
          learningOutcomes: myProfile.learningOutcomes || [],
          sessionExpectations: myProfile.sessionExpectations || "",
          yearsOfExperience: myProfile.yearsOfExperience || 0,
          teachingCategories: myProfile.teachingCategories || [],
          linkedIn: myProfile.linkedIn || "",
          github: myProfile.github || "",
          portfolio: myProfile.portfolio || "",
          subjects: myProfile.subjects || [],
        });
      } else if (meRes.status === 404) {
        setNoProfile(true);
      }
    } catch (err) {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingAction = async (
    bookingId: string,
    action: "Confirmed" | "Cancelled" | "Completed"
  ) => {
    const confirmMessages: Record<string, string> = {
      Confirmed: "Accept this booking request?",
      Cancelled: "Cancel this session?",
      Completed: "Mark this session as completed? The student can then leave a review.",
    };
    if (!confirm(confirmMessages[action])) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        const messages: Record<string, string> = {
          Confirmed: "Session confirmed",
          Cancelled: "Session cancelled",
          Completed: "Session marked complete — student can review",
        };
        showToast(messages[action], "success");
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update booking", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const addAvailabilitySlot = () => {
    setAvailability((prev) => [...prev, { day: newDay, startTime: newStartTime, endTime: newEndTime }]);
  };

  const removeSlot = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    if (!mentorId) {
      showToast("Mentor profile not found. Please contact admin.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/mentors/${mentorId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });
      if (res.ok) {
        showToast("Availability saved successfully!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save availability", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((p) => ({ ...p, image: data.url }));
        showToast("Image uploaded successfully!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to upload image", "error");
      }
    } catch {
      showToast("Network error during upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/mentors/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        showToast("Profile saved successfully!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save profile", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addExpertiseArea = () => {
    const val = expertiseInput.trim();
    if (!val) return;
    setProfile((p) => ({ ...p, expertiseAreas: [...(p.expertiseAreas || []), val] }));
    setExpertiseInput("");
  };

  const removeExpertiseArea = (i: number) => {
    setProfile((p) => ({ ...p, expertiseAreas: (p.expertiseAreas || []).filter((_, idx) => idx !== i) }));
  };

  const addLearningOutcome = () => {
    const val = outcomeInput.trim();
    if (!val) return;
    setProfile((p) => ({ ...p, learningOutcomes: [...(p.learningOutcomes || []), val] }));
    setOutcomeInput("");
  };

  const removeLearningOutcome = (i: number) => {
    setProfile((p) => ({ ...p, learningOutcomes: (p.learningOutcomes || []).filter((_, idx) => idx !== i) }));
  };

  const addTeachingCategory = () => {
    const val = categoryInput.trim();
    if (!val) return;
    setProfile((p) => ({ ...p, teachingCategories: [...(p.teachingCategories || []), val] }));
    setCategoryInput("");
  };

  const removeTeachingCategory = (i: number) => {
    setProfile((p) => ({ ...p, teachingCategories: (p.teachingCategories || []).filter((_, idx) => idx !== i) }));
  };

  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const completedBookings = bookings.filter((b) => b.status === "Completed");

  if (authStatus === "loading" || (!session && authStatus !== "unauthenticated")) {
    return <DashboardLoading message="LOADING MENTOR DASHBOARD..." />;
  }

  if (!session) return null;

  const role = (session.user as { role?: string }).role;
  if (role !== "mentor") {
    return <DashboardLoading message="REDIRECTING..." />;
  }

  if (isLoading) {
    return <DashboardLoading message="LOADING MENTOR DASHBOARD..." />;
  }

  if (noProfile) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-outline mb-4 block">person_search</span>
        <h2 className="font-h2 text-xl text-on-surface mb-2">No Mentor Profile Linked</h2>
        <p className="font-body-md text-on-surface-variant mb-6">
          Your account has mentor access but no mentor profile has been linked yet.
          Please ask an admin to create and link your mentor profile via the Admin Console.
        </p>
        <p className="font-mono-label text-outline text-xs">
          Admin: Go to Admin Console → User &amp; Mentor Approval → Add Mentor Profile
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-h1 text-h1 text-secondary mb-2">MENTOR_DASHBOARD</h1>
        <p className="font-body-lg text-on-surface-variant">Manage your sessions, availability, profile, and student interactions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Pending" value={pendingBookings.length} accent="error" icon="pending_actions" />
        <StatCard label="Confirmed" value={confirmedBookings.length} accent="secondary" icon="event_available" />
        <StatCard label="Completed" value={completedBookings.length} accent="primary" icon="check_circle" />
        <StatCard label="Weekly Slots" value={availability.length} accent="primary" icon="schedule" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 mb-8 border-b border-outline-variant/30 overflow-x-auto scrollbar-none">
        {(["bookings", "availability", "profile", "earnings"] as const).map((tab) => {
          const labels: Record<string, string> = {
            bookings: "Booking Requests",
            availability: "My Availability",
            profile: "Edit Profile",
            earnings: "Earnings",
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 font-mono-label text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 border-b-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5 shadow-[0_2px_10px_rgba(138,235,255,0.05)]"
                  : "border-transparent text-outline hover:text-on-surface hover:bg-white/5"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ── BOOKINGS TAB ── */}
      {activeTab === "bookings" && (
        <div className="space-y-8">
          {pendingBookings.length > 0 && (
            <div className="glass-panel p-8 rounded-2xl border border-error/20">
              <h2 className="font-h2 text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-error">pending_actions</span>
                Pending Requests ({pendingBookings.length})
              </h2>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking._id} className="bg-surface-container rounded-xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        <span className="font-body-md text-on-surface font-medium">{booking.userName}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="font-mono-label text-primary">{booking.subject}</span>
                        <span className="font-mono-label text-on-surface-variant">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className="font-mono-label text-secondary">
                          {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleBookingAction(booking._id, "Confirmed")}
                        className="px-6 py-2 bg-secondary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking._id, "Cancelled")}
                        className="px-6 py-2 bg-transparent border border-error text-error rounded-lg font-mono-label text-xs uppercase hover:bg-error hover:text-surface transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-8 rounded-2xl border border-secondary/20">
            <h2 className="font-h2 text-xl mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">event_available</span>
              Confirmed Sessions ({confirmedBookings.length})
            </h2>
            {confirmedBookings.length === 0 ? (
              <DashboardEmpty
                icon="event_busy"
                title="No confirmed sessions"
                description="Accepted bookings will appear here with chat and completion actions."
              />
            ) : (
              <div className="space-y-3">
                {confirmedBookings.map((booking) => (
                  <div key={booking._id} className="bg-surface-container rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="font-body-md text-on-surface font-medium">{booking.userName}</span>
                      <div className="flex flex-wrap gap-4 text-sm mt-1">
                        <span className="font-mono-label text-primary">{booking.subject}</span>
                        <span className="font-mono-label text-on-surface-variant">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className="font-mono-label text-secondary">
                          {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/chat/${booking._id}`}
                        className="px-6 py-2 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        Open Chat
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleBookingAction(booking._id, "Completed")}
                        className="px-4 py-2 bg-secondary/20 text-secondary border border-secondary/40 rounded-lg font-mono-label text-xs uppercase hover:bg-secondary hover:text-surface transition-all"
                      >
                        Mark Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingAction(booking._id, "Cancelled")}
                        className="px-4 py-2 border border-outline-variant text-outline rounded-lg font-mono-label text-xs uppercase hover:border-error hover:text-error transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {completedBookings.length > 0 && (
            <DashboardSection
              title="Completed Sessions"
              icon="check_circle"
              iconClassName="text-primary"
              count={completedBookings.length}
              borderClassName="border-primary/20"
            >
              <p className="font-body-md text-on-surface-variant text-sm mb-4">
                Students can leave reviews for these sessions on their dashboard.
              </p>
              <div className="space-y-3">
                {completedBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-body-md text-on-surface font-medium">{booking.userName}</span>
                      <div className="flex flex-wrap gap-3 text-sm mt-1">
                        <span className="font-mono-label text-primary">{booking.subject}</span>
                        <span className="font-mono-label text-on-surface-variant">
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                        <StatusBadge status="Completed" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardSection>
          )}

          {pendingBookings.length === 0 && confirmedBookings.length === 0 && completedBookings.length === 0 && (
            <DashboardEmpty
              icon="inbox"
              title="No bookings yet"
              description="When students request sessions, they will appear here for you to accept."
            />
          )}
        </div>
      )}

      {/* ── AVAILABILITY TAB ── */}
      {activeTab === "availability" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
            <h2 className="font-h2 text-xl mb-6">Add Availability Slot</h2>
            {availability.length === 0 && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-mono-label text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Add at least one slot so students can book sessions with you.
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">DAY</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded p-3 text-on-surface font-body-md"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-label text-outline text-xs block mb-1">START TIME</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded p-3 text-on-surface font-body-md"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-outline text-xs block mb-1">END TIME</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded p-3 text-on-surface font-body-md"
                  />
                </div>
              </div>
              <button
                onClick={addAvailabilitySlot}
                className="w-full bg-secondary text-surface font-mono-label py-3 rounded-lg hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all uppercase"
              >
                Add Slot
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant">
              <button
                onClick={saveAvailability}
                disabled={isSaving}
                className="w-full bg-primary text-surface font-mono-label py-3 rounded-lg hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all uppercase disabled:opacity-50"
              >
                {isSaving ? "SAVING..." : "SAVE ALL CHANGES"}
              </button>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
            <h2 className="font-h2 text-xl mb-6">Current Schedule</h2>
            {availability.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">event_busy</span>
                <p className="text-outline font-body-md">No availability slots set.</p>
                <p className="text-outline font-body-md text-sm mt-1">Add slots to allow users to book sessions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availability.map((slot, i) => (
                  <div key={i} className="bg-surface-container rounded-xl p-4 border border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <div>
                        <p className="font-mono-label text-on-surface text-sm">{slot.day}</p>
                        <p className="font-mono-label text-on-surface-variant text-xs">{slot.startTime} — {slot.endTime}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSlot(i)}
                      className="text-outline hover:text-error transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROFILE EDITOR TAB ── */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">manage_accounts</span>
              </div>
              <div>
                <h2 className="font-h2 text-xl text-on-background">Mentor Profile Editor</h2>
                <p className="font-body-md text-on-surface-variant text-sm">
                  Tell students who you are, what you teach, and what they&apos;ll gain from your sessions.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* ── Identity Section ── */}
              <div>
                <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  Identity
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">HEADLINE / TITLE</label>
                    <input
                      type="text"
                      value={profile.headline || ""}
                      onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
                      placeholder="e.g. Senior Cloud Engineer & AWS Specialist"
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">YEARS OF EXPERIENCE</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={profile.yearsOfExperience || 0}
                      onChange={(e) => setProfile((p) => ({ ...p, yearsOfExperience: Number(e.target.value) }))}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Image Preview */}
                    <div className="relative w-32 h-32 rounded-xl border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0 group">
                      <img
                        src={profile.image || "/placeholders/mentor.png"}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholders/mentor.png";
                        }}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                          <span className="font-mono-label text-[10px] text-primary">UPLOADING...</span>
                        </div>
                      )}
                    </div>
                    {/* URL and File Inputs */}
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <label className="font-mono-label text-outline text-xs block mb-1">PROFILE IMAGE</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="url"
                            value={profile.image || ""}
                            onChange={(e) => setProfile((p) => ({ ...p, image: e.target.value }))}
                            placeholder="https://example.com/your-photo.jpg or upload below"
                            className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                          />
                          <label className="relative cursor-pointer px-6 py-3 bg-secondary text-surface font-mono-label text-xs uppercase rounded-lg hover:shadow-[0_0_15px_rgba(78,222,163,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]">
                            <span className="material-symbols-outlined text-[18px]">upload</span>
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="font-mono-label text-outline text-[10px]">
                        Provide a public image URL or select an image file from your device to upload.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── About Section ── */}
              <div>
                <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">article</span>
                  About & Teaching
                </p>
                <div className="space-y-5">
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">BIO / ABOUT ME</label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell students about your background, career journey, and what drives you..."
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">TEACHING DESCRIPTION</label>
                    <textarea
                      value={profile.teachingDescription || ""}
                      onChange={(e) => setProfile((p) => ({ ...p, teachingDescription: e.target.value }))}
                      rows={3}
                      placeholder="Describe your teaching style, methods, and the topics you cover in sessions..."
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">SESSION EXPECTATIONS</label>
                    <textarea
                      value={profile.sessionExpectations || ""}
                      onChange={(e) => setProfile((p) => ({ ...p, sessionExpectations: e.target.value }))}
                      rows={2}
                      placeholder="What should students prepare before the session? What will a typical session look like?"
                      className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Expertise Areas ── */}
              <div>
                <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                  Expertise Areas
                </p>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExpertiseArea(); } }}
                    placeholder="e.g. Cloud Architecture, Kubernetes, CI/CD..."
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addExpertiseArea}
                    className="px-4 py-3 bg-primary/20 border border-primary/40 text-primary rounded-lg font-mono-label text-xs uppercase hover:bg-primary/30 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profile.expertiseAreas || []).map((area, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-full font-mono-label text-[11px] text-primary">
                      {area}
                      <button onClick={() => removeExpertiseArea(i)} className="text-primary/60 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </span>
                  ))}
                  {(profile.expertiseAreas || []).length === 0 && (
                    <p className="text-outline font-body-md text-xs">No expertise areas added yet.</p>
                  )}
                </div>
              </div>

              {/* ── Learning Outcomes ── */}
              <div>
                <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  Learning Outcomes
                </p>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={outcomeInput}
                    onChange={(e) => setOutcomeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLearningOutcome(); } }}
                    placeholder="e.g. Deploy containerized apps on GKE..."
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addLearningOutcome}
                    className="px-4 py-3 bg-secondary/20 border border-secondary/40 text-secondary rounded-lg font-mono-label text-xs uppercase hover:bg-secondary/30 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(profile.learningOutcomes || []).map((outcome, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                      <span className="font-body-md text-on-surface text-sm flex-1">{outcome}</span>
                      <button onClick={() => removeLearningOutcome(i)} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                  {(profile.learningOutcomes || []).length === 0 && (
                    <p className="text-outline font-body-md text-xs">No learning outcomes added yet.</p>
                  )}
                </div>
              </div>

              {/* ── Teaching Categories ── */}
              <div>
                <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">category</span>
                  Teaching Categories
                </p>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTeachingCategory(); } }}
                    placeholder="e.g. DevOps, System Design, Interview Prep..."
                    className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTeachingCategory}
                    className="px-4 py-3 bg-secondary/20 border border-secondary/40 text-secondary rounded-lg font-mono-label text-xs uppercase hover:bg-secondary/30 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profile.teachingCategories || []).map((cat, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 border border-secondary/25 rounded-full font-mono-label text-[11px] text-secondary">
                      {cat}
                      <button onClick={() => removeTeachingCategory(i)} className="text-secondary/60 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </span>
                  ))}
                  {(profile.teachingCategories || []).length === 0 && (
                    <p className="text-outline font-body-md text-xs">No teaching categories added yet.</p>
                  )}
                </div>
              </div>

              {/* ── Professional Links ── */}
              <div>
                <p className="font-mono-label text-primary text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  Professional Links (Optional)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">LINKEDIN URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-label text-outline text-[10px]">in/</span>
                      <input
                        type="url"
                        value={profile.linkedIn || ""}
                        onChange={(e) => setProfile((p) => ({ ...p, linkedIn: e.target.value }))}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 pl-8 text-on-surface font-body-md focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">GITHUB URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-label text-outline text-[10px]">gh/</span>
                      <input
                        type="url"
                        value={profile.github || ""}
                        onChange={(e) => setProfile((p) => ({ ...p, github: e.target.value }))}
                        placeholder="https://github.com/..."
                        className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 pl-8 text-on-surface font-body-md focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">PORTFOLIO URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-label text-outline text-[10px]">↗</span>
                      <input
                        type="url"
                        value={profile.portfolio || ""}
                        onChange={(e) => setProfile((p) => ({ ...p, portfolio: e.target.value }))}
                        placeholder="https://yourportfolio.com"
                        className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 pl-8 text-on-surface font-body-md focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-outline-variant/30">
                <button
                  onClick={saveProfile}
                  disabled={isSavingProfile}
                  className="w-full bg-primary text-surface font-mono-label py-4 rounded-xl hover:shadow-[0_0_25px_rgba(47,217,244,0.35)] transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      SAVING PROFILE...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      SAVE PROFILE
                    </>
                  )}
                </button>
                <p className="font-mono-label text-outline text-[10px] text-center mt-2">
                  Changes will reflect on your public mentor profile immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EARNINGS TAB ── */}
      {activeTab === "earnings" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Earned"
              value={`$${bookings.filter((b) => b.status === "Completed").length * 75}`}
              accent="secondary"
              icon="payments"
            />
            <StatCard
              label="Completed Sessions"
              value={bookings.filter((b) => b.status === "Completed").length}
              accent="primary"
              icon="check_circle"
            />
            <StatCard
              label="Upcoming Sessions"
              value={confirmedBookings.length}
              accent="primary"
              icon="trending_up"
            />
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
            <h2 className="font-h2 text-xl mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              Session History
            </h2>
            {bookings.filter(b => b.status === 'Completed' || b.status === 'Confirmed').length === 0 ? (
              <p className="text-outline font-body-md text-center py-4">No completed sessions yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant font-mono-label text-outline text-xs">
                      <th className="pb-3 pr-4">STUDENT</th>
                      <th className="pb-3 pr-4">SUBJECT</th>
                      <th className="pb-3 pr-4">DATE</th>
                      <th className="pb-3 pr-4">STATUS</th>
                      <th className="pb-3">EARNED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
                      .map((booking) => (
                        <tr key={booking._id} className="border-b border-white/5 hover:bg-surface-container-high transition-colors">
                          <td className="py-3 pr-4 font-body-md text-on-surface text-sm">{booking.userName}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-1 bg-primary/10 rounded text-xs font-mono-label text-primary">{booking.subject}</span>
                          </td>
                          <td className="py-3 pr-4 font-mono-label text-xs text-on-surface-variant">
                            {new Date(booking.scheduledDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded text-xs font-mono-label ${
                              booking.status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                            }`}>{booking.status}</span>
                          </td>
                          <td className="py-3 font-mono-label text-secondary text-sm">
                            {booking.status === 'Completed' ? '$75' : 'Pending'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
