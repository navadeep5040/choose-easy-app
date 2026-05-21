"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MentorData {
  _id: string;
  name: string;
  bio: string;
  subjects: string[];
  domain: string;
  matchScore: string;
  status: string;
  availability: { day: string; startTime: string; endTime: string }[];
  hourlyRate: number;
  image: string;
  // Extended profile fields
  headline?: string;
  teachingDescription?: string;
  expertiseAreas?: string[];
  learningOutcomes?: string[];
  sessionExpectations?: string;
  yearsOfExperience?: number;
  teachingCategories?: string[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getNextDatesForDay(dayName: string, count: number = 2): Date[] {
  const dates: Date[] = [];
  const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
  const today = new Date();

  for (let i = 0; i < 14 && dates.length < count; i++) {
    const current = new Date(today);
    current.setDate(today.getDate() + i);
    if (current.getDay() === dayIndex && current >= today) {
      dates.push(new Date(current));
    }
  }
  return dates;
}

export default function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const router = useRouter();
  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; startTime: string; endTime: string; date: Date } | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string } | null>(null);

  const [reviews, setReviews] = useState<{ userName: string; rating: number; comment: string; createdAt: string }[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchMentor();
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMentor = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mentors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMentor(data);
        if (data.subjects?.length > 0) {
          setSelectedSubject(data.subjects[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch mentor");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?mentorId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAvgRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews");
    }
  };

  const handleBooking = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!selectedSlot || !selectedSubject || !mentor) return;

    setIsBooking(true);
    setBookingResult(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: mentor._id,
          mentorName: mentor.name,
          subject: selectedSubject,
          scheduledDate: selectedSlot.date.toISOString(),
          timeSlot: {
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          },
        }),
      });

      if (res.ok) {
        setBookingResult({ success: true, message: "Booking request sent! The mentor will be notified." });
        setSelectedSlot(null);
      } else {
        const data = await res.json();
        setBookingResult({ success: false, message: data.error || "Failed to create booking" });
      }
    } catch (err) {
      setBookingResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
        <p className="font-mono-label text-outline mt-4 animate-pulse">LOADING MENTOR PROFILE...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
        <p className="font-body-lg text-on-surface-variant mb-4">Mentor not found</p>
        <Link href="/mentors" className="text-primary hover:underline font-mono-label">← Back to Mentors</Link>
      </div>
    );
  }

  const availableSlots = mentor.availability?.flatMap((slot) => {
    const dates = getNextDatesForDay(slot.day);
    return dates.map((date) => ({
      ...slot,
      date,
      dateString: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    }));
  }).sort((a, b) => a.date.getTime() - b.date.getTime()) || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link href="/mentors" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-mono-label text-sm mb-8 transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        BACK TO MENTORS
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Mentor Identity Panel ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 rounded-2xl border border-primary/20 sticky top-24">
            {/* Avatar */}
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-outline-variant mb-6 bg-surface-container-high flex items-center justify-center">
              <img
                className="w-full h-full object-cover"
                alt={mentor.name}
                src={mentor.image || "/placeholders/mentor.png"}
                onError={(e) => {
                  e.currentTarget.src = "/placeholders/mentor.png";
                }}
              />
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${mentor.status === 'Available' ? 'bg-secondary animate-pulse' : mentor.status === 'Busy' ? 'bg-error' : 'bg-outline-variant'}`}></span>
              <span className={`font-mono-label text-sm ${mentor.status === 'Available' ? 'text-secondary' : mentor.status === 'Busy' ? 'text-error' : 'text-outline'}`}>
                {mentor.status.toUpperCase()}
              </span>
            </div>

            <h1 className="font-h1 text-h1 text-on-background mb-1">{mentor.name}</h1>

            {/* Headline */}
            {mentor.headline ? (
              <p className="font-mono-label text-primary text-sm mb-1 uppercase tracking-wider">{mentor.headline}</p>
            ) : (
              <p className="font-mono-label text-outline uppercase tracking-widest text-sm mb-1">{mentor.domain}</p>
            )}

            {/* Years of experience badge */}
            {(mentor.yearsOfExperience ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 mb-4">
                <span className="material-symbols-outlined text-secondary text-[14px]">work_history</span>
                <span className="font-mono-label text-secondary text-xs">{mentor.yearsOfExperience} years of experience</span>
              </div>
            )}

            {/* Bio */}
            {mentor.bio && (
              <p className="font-body-md text-on-surface-variant mb-6 text-sm leading-relaxed">{mentor.bio}</p>
            )}

            {/* Stats */}
            <div className="space-y-3 border-t border-outline-variant/30 pt-4">
              <div className="flex justify-between">
                <span className="font-body-md text-on-surface-variant text-sm">Match Score</span>
                <span className="font-mono-label text-primary">{mentor.matchScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-md text-on-surface-variant text-sm">Rate</span>
                <span className="font-mono-label text-secondary">{mentor.hourlyRate > 0 ? `$${mentor.hourlyRate}/hr` : 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-md text-on-surface-variant text-sm">Weekly Slots</span>
                <span className="font-mono-label text-on-surface">{mentor.availability?.length || 0}</span>
              </div>
              {totalReviews > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-on-surface-variant text-sm">Rating</span>
                  <span className="font-mono-label text-yellow-400 flex items-center gap-1">
                    {'★'.repeat(Math.round(avgRating))}
                    <span className="text-on-surface-variant text-xs ml-1">({avgRating}/5 · {totalReviews})</span>
                  </span>
                </div>
              )}
            </div>

            {/* Expertise Areas */}
            {(mentor.expertiseAreas?.length ?? 0) > 0 && (
              <div className="mt-6">
                <p className="font-mono-label text-outline text-xs mb-2 uppercase">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertiseAreas!.map((area) => (
                    <span key={area} className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-mono-label text-[10px]">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subjects (fallback) */}
            {((mentor.expertiseAreas?.length ?? 0) === 0) && (mentor.subjects?.length ?? 0) > 0 && (
              <div className="mt-6">
                <p className="font-mono-label text-outline text-xs mb-2 uppercase">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.subjects.map((subject) => (
                    <span key={subject} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary font-mono-label text-[11px]">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Links */}
            {(mentor.linkedIn || mentor.github || mentor.portfolio) && (
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-wrap gap-3">
                {mentor.linkedIn && (
                  <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg font-mono-label text-[11px] text-on-surface-variant hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    LinkedIn
                  </a>
                )}
                {mentor.github && (
                  <a href={mentor.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg font-mono-label text-[11px] text-on-surface-variant hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[14px]">code</span>
                    GitHub
                  </a>
                )}
                {mentor.portfolio && (
                  <a href={mentor.portfolio} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-lg font-mono-label text-[11px] text-on-surface-variant hover:border-primary hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Portfolio
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Teaching Description */}
          {mentor.teachingDescription && (
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">auto_stories</span>
                <h2 className="font-h2 text-xl text-on-background">What I Teach</h2>
              </div>
              <p className="font-body-md text-on-surface-variant leading-relaxed">{mentor.teachingDescription}</p>

              {/* Teaching Categories */}
              {(mentor.teachingCategories?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {mentor.teachingCategories!.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-secondary/10 border border-secondary/25 rounded-full font-mono-label text-[11px] text-secondary">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Learning Outcomes */}
          {(mentor.learningOutcomes?.length ?? 0) > 0 && (
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-secondary">school</span>
                <h2 className="font-h2 text-xl text-on-background">What You&apos;ll Learn</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mentor.learningOutcomes!.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <span className="font-body-md text-on-surface-variant text-sm">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Expectations */}
          {mentor.sessionExpectations && (
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary">info</span>
                <h2 className="font-h2 text-lg text-on-background">Session Expectations</h2>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{mentor.sessionExpectations}</p>
            </div>
          )}

          {status === "loading" ? (
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant bg-surface-container/20 animate-pulse h-64"></div>
          ) : userRole === "admin" ? (
            <div className="glass-panel p-8 rounded-2xl border border-error/30 bg-error/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-error pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-error pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-error text-2xl">admin_panel_settings</span>
                <h2 className="font-h2 text-xl text-error font-bold tracking-wider">ADMINISTRATOR CONTROLS</h2>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm mb-6 leading-relaxed">
                You are logged in as an Administrator. You have permissions to modify this mentor's settings, view their session stats, and manage platform listings.
              </p>
              <div className="space-y-4">
                <Link
                  href="/admin?tab=users"
                  className="flex items-center justify-center gap-2 w-full bg-error text-surface font-mono-label py-4 rounded-xl hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all uppercase tracking-wider font-bold cursor-pointer text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                  Manage Mentor Settings
                </Link>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/admin?tab=overview"
                    className="flex items-center justify-center gap-2 border border-error/50 text-error hover:bg-error/10 font-mono-label py-3 rounded-xl transition-all uppercase text-xs cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                    View Analytics
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center justify-center gap-2 border border-error/30 text-error/80 hover:border-error hover:text-error hover:bg-error/5 font-mono-label py-3 rounded-xl transition-all uppercase text-xs cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    Admin Panel
                  </Link>
                </div>
              </div>
            </div>
          ) : userRole === "mentor" ? (
            <div className="glass-panel p-8 rounded-2xl border border-secondary/30 bg-secondary/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-secondary pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-secondary pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-2xl">terminal</span>
                <h2 className="font-h2 text-xl text-secondary font-bold tracking-wider">MENTOR TERMINAL</h2>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm mb-6 leading-relaxed">
                Welcome back to your workspace. Use the actions below to adjust your settings, update your schedule, or view your current guidance sessions.
              </p>
              <div className="space-y-4">
                <Link
                  href="/mentor-dashboard?tab=availability"
                  className="flex items-center justify-center gap-2 w-full bg-secondary text-surface font-mono-label py-4 rounded-xl hover:shadow-[0_0_25px_rgba(78,222,163,0.4)] transition-all uppercase tracking-wider font-bold cursor-pointer text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Manage Availability
                </Link>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/mentor-dashboard?tab=bookings"
                    className="flex items-center justify-center gap-2 border border-secondary/50 text-secondary hover:bg-secondary/10 font-mono-label py-3 rounded-xl transition-all uppercase text-xs cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    View Sessions
                  </Link>
                  <Link
                    href="/mentor-dashboard?tab=profile"
                    className="flex items-center justify-center gap-2 border border-secondary/30 text-secondary/80 hover:border-secondary hover:text-secondary hover:bg-secondary/5 font-mono-label py-3 rounded-xl transition-all uppercase text-xs cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Choose Subject */}
              <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-mono-label text-primary text-lg">1</span>
                  </div>
                  <h2 className="font-h2 text-xl text-on-background">Choose a Subject</h2>
                </div>
                {(mentor.subjects?.length ?? 0) === 0 ? (
                  <p className="text-outline font-body-md text-sm">No subjects listed for this mentor.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {mentor.subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-5 py-2.5 rounded-full font-mono-label text-xs uppercase tracking-wider transition-all duration-300 border ${
                          selectedSubject === subject
                            ? "bg-primary text-surface border-primary shadow-[0_0_15px_rgba(47,217,244,0.3)]"
                            : "bg-transparent text-on-surface-variant border-outline-variant hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Pick a Time Slot */}
              <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-mono-label text-primary text-lg">2</span>
                  </div>
                  <h2 className="font-h2 text-xl text-on-background">Pick a Time Slot</h2>
                </div>

                {availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">event_busy</span>
                    <p className="text-on-surface-variant font-body-md">No available slots at the moment.</p>
                    <p className="text-outline font-body-md text-sm mt-1">The mentor hasn&apos;t set availability yet. Check back later or try another mentor.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSlots.map((slot, i) => {
                      const isSelected = selectedSlot?.date.getTime() === slot.date.getTime() &&
                        selectedSlot?.startTime === slot.startTime;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 rounded-xl border text-left transition-all duration-300 group ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(47,217,244,0.2)]"
                              : "border-outline-variant hover:border-primary/30 bg-surface-container hover:bg-surface-container-high"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-mono-label text-sm ${isSelected ? "text-primary" : "text-on-surface"}`}>
                              {slot.dateString}
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                            <span className="font-mono-label text-on-surface-variant text-sm">
                              {slot.startTime} — {slot.endTime}
                            </span>
                          </div>
                          <p className="font-mono-label text-[10px] text-outline mt-2 uppercase">{slot.day}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Confirm Booking */}
              <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-mono-label text-primary text-lg">3</span>
                  </div>
                  <h2 className="font-h2 text-xl text-on-background">Confirm Booking</h2>
                </div>

                {selectedSlot && selectedSubject ? (
                  <div className="space-y-4">
                    <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-mono-label text-outline text-xs mb-1">MENTOR</p>
                          <p className="font-body-md text-on-surface">{mentor.name}</p>
                        </div>
                        <div>
                          <p className="font-mono-label text-outline text-xs mb-1">SUBJECT</p>
                          <p className="font-body-md text-primary">{selectedSubject}</p>
                        </div>
                        <div>
                          <p className="font-mono-label text-outline text-xs mb-1">DATE</p>
                          <p className="font-body-md text-on-surface">
                            {selectedSlot.date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                        <div>
                          <p className="font-mono-label text-outline text-xs mb-1">TIME</p>
                          <p className="font-body-md text-secondary">{selectedSlot.startTime} — {selectedSlot.endTime}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full bg-primary text-surface font-mono-label py-4 rounded-xl hover:shadow-[0_0_25px_rgba(47,217,244,0.4)] transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBooking ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                          PROCESSING...
                        </span>
                      ) : (
                        "CONFIRM BOOKING REQUEST"
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-outline font-body-md text-center py-4">
                    Select a subject and time slot above to proceed with booking.
                  </p>
                )}

                {bookingResult && (
                  <div className={`mt-4 p-4 rounded-xl border font-mono-label text-sm text-center ${
                    bookingResult.success
                      ? "bg-secondary/10 border-secondary/30 text-secondary"
                      : "bg-error/10 border-error/30 text-error"
                  }`}>
                    {bookingResult.success && <span className="material-symbols-outlined text-[20px] mr-2 align-middle">check_circle</span>}
                    {bookingResult.message}
                    {bookingResult.success && (
                      <div className="mt-3">
                        <Link href="/dashboard" className="text-primary hover:underline">Go to Dashboard →</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="mt-8 glass-panel p-8 rounded-2xl border border-outline-variant">
          <h2 className="font-h2 text-xl mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-400">star</span>
            Student Reviews ({totalReviews})
            <span className="font-mono-label text-sm text-on-surface-variant ml-auto">{avgRating}/5 avg</span>
          </h2>
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={i} className="bg-surface-container rounded-xl p-5 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                    </div>
                    <span className="font-body-md text-on-surface font-medium text-sm">{review.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="font-mono-label text-outline text-[10px]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="font-body-md text-on-surface-variant text-sm pl-11">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
