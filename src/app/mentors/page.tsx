"use client";

import { useState, useEffect, useCallback } from "react";
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
}

const SUBJECTS = ["All", "Technology", "Healthcare", "Finance", "Design", "Marketing", "Legal"];
const BOOKMARKS_KEY = "mentorconnect_bookmarks";

function getStoredBookmarks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveBookmarks(ids: Set<string>) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // silently fail
  }
}

export default function MentorsPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarked, setShowBookmarked] = useState(false);

  // Load bookmarks from localStorage on mount (client-only)
  useEffect(() => {
    setBookmarks(getStoredBookmarks());
  }, []);

  const fetchMentors = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = selectedSubject === "All" ? "/api/mentors" : `/api/mentors?subject=${selectedSubject}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMentors(data);
      }
    } catch (err) {
      console.error("Failed to fetch mentors");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const toggleBookmark = (e: React.MouseEvent, mentorId: string) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(mentorId)) {
        next.delete(mentorId);
      } else {
        next.add(mentorId);
      }
      saveBookmarks(next);
      return next;
    });
  };

  const baseList = showBookmarked
    ? mentors.filter((m) => bookmarks.has(m._id))
    : mentors;

  const filteredMentors = baseList.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subjects?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full">
      <main className="pb-stack-lg px-gutter max-w-container-max mx-auto">
        {/* Header */}
        <section className="mb-stack-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mt-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span className="font-mono-label text-mono-label text-secondary uppercase">Network Status: Operational</span>
              </div>
              <h1 className="font-h1 text-h1 text-primary mb-4">World-Class Mentors</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Connect with elite career guides. Browse by subject, check availability, and book a personalized guidance session.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono-label text-mono-label text-outline text-right">TOTAL ARCHITECTS // {filteredMentors.length}</span>
              <div className="bg-surface-container border border-outline-variant rounded-lg p-1 flex">
                <input
                  className="bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline font-body-md px-4 py-2 w-64 focus:outline-none"
                  placeholder="Search by name or skill..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-primary text-on-primary px-4 rounded flex items-center">
                  <span className="material-symbols-outlined">search</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Subject Filter Chips */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-3">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => { setSelectedSubject(subject); setShowBookmarked(false); }}
                className={`px-5 py-2.5 rounded-full font-mono-label text-xs uppercase tracking-wider transition-all duration-300 border ${
                  selectedSubject === subject && !showBookmarked
                    ? "bg-primary text-surface border-primary shadow-[0_0_15px_rgba(47,217,244,0.3)]"
                    : "bg-transparent text-on-surface-variant border-outline-variant hover:border-primary/50 hover:text-primary"
                }`}
              >
                {subject}
              </button>
            ))}
            {/* Bookmarks toggle */}
            {bookmarks.size > 0 && (
              <button
                onClick={() => setShowBookmarked((v) => !v)}
                className={`px-5 py-2.5 rounded-full font-mono-label text-xs uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 ${
                  showBookmarked
                    ? "bg-secondary text-surface border-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)]"
                    : "bg-transparent text-secondary border-secondary/40 hover:border-secondary/70"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">bookmark</span>
                Saved ({bookmarks.size})
              </button>
            )}
          </div>
        </section>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p className="font-mono-label text-outline mt-4 animate-pulse">SCANNING NETWORK...</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">
              {showBookmarked ? "bookmark_border" : "person_search"}
            </span>
            <p className="font-body-lg text-on-surface-variant mb-2">
              {showBookmarked
                ? "No saved mentors yet"
                : `No mentors found for "${selectedSubject}"`}
            </p>
            <p className="font-body-md text-outline">
              {showBookmarked
                ? "Click the bookmark icon on any mentor card to save them here."
                : "Try a different subject or check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md items-stretch">
            {filteredMentors.map((mentor) => {
              const isBookmarked = bookmarks.has(mentor._id);
              return (
                <div
                  key={mentor._id}
                  className="glass-panel p-6 relative group transition-all duration-500 flex flex-col h-full hover:border-primary/50 hover:shadow-[0_0_15px_rgba(47,217,244,0.2)] cursor-pointer"
                  onClick={() => router.push(`/mentors/${mentor._id}`)}
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary pointer-events-none"></div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant mb-2 bg-surface-container-high flex items-center justify-center">
                        <img 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                          alt={mentor.name} 
                          src={mentor.image || "/placeholders/mentor.png"} 
                          onError={(e) => {
                            e.currentTarget.src = "/placeholders/mentor.png";
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-surface-container border border-outline-variant px-2 py-0.5 rounded">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${mentor.status === "Available" ? "bg-secondary animate-pulse" : mentor.status === "Busy" ? "bg-error" : "bg-outline-variant"}`}></span>
                          <span className={`font-mono-label text-[10px] ${mentor.status === "Available" ? "text-secondary" : mentor.status === "Busy" ? "text-error" : "text-outline"}`}>
                            {mentor.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-mono-label text-[10px] rounded-full uppercase">
                        MATCH: {mentor.matchScore}
                      </span>
                      {mentor.hourlyRate > 0 && (
                        <span className="font-mono-label text-[11px] text-secondary">
                          ${mentor.hourlyRate}/hr
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Title */}
                  <h3 className="font-h2 text-h2 text-on-surface mb-1 transition-colors group-hover:text-primary">{mentor.name}</h3>
                  <p className="font-mono-label text-[12px] text-outline uppercase mb-3 tracking-widest">{mentor.domain}</p>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="font-body-md text-on-surface-variant text-sm mb-4 line-clamp-2">{mentor.bio}</p>
                  )}

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.subjects?.map((subject) => (
                      <span key={subject} className="px-2 py-0.5 bg-surface-container-highest rounded text-[10px] font-mono-label text-on-surface-variant">
                        {subject}
                      </span>
                    ))}
                  </div>

                  {/* Availability Summary */}
                  <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                      <span className="font-body-md text-on-surface-variant text-sm">Available Slots</span>
                      <span className="font-mono-label text-secondary text-xs">
                        {mentor.availability?.length || 0} per week
                      </span>
                    </div>
                    {mentor.availability?.slice(0, 2).map((slot, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-mono-label text-outline">{slot.day}</span>
                        <span className="font-mono-label text-on-surface-variant">{slot.startTime} - {slot.endTime}</span>
                      </div>
                    ))}
                    {(mentor.availability?.length || 0) > 2 && (
                      <p className="font-mono-label text-primary text-[10px] text-right">
                        + {mentor.availability.length - 2} more slots
                      </p>
                    )}
                  </div>

                  {/* CTA + Bookmark */}
                  {status === "loading" ? (
                    <div className="flex gap-3 mt-auto w-full">
                      <div className="flex-1 h-12 bg-surface-container-highest animate-pulse rounded-lg"></div>
                    </div>
                  ) : userRole === "admin" ? (
                    <div className="flex gap-3 mt-auto">
                      <Link
                        href="/admin?tab=users"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 font-mono-label py-3 rounded transition-all uppercase text-xs text-center border border-error/50 text-error hover:bg-error/10"
                      >
                        Manage Mentor
                      </Link>
                      <Link
                        href="/admin"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 border border-error/30 text-error/80 flex items-center justify-center rounded hover:border-error hover:text-error transition-all font-mono-label text-[10px] uppercase"
                      >
                        Panel
                      </Link>
                    </div>
                  ) : userRole === "mentor" ? (
                    <div className="flex gap-3 mt-auto">
                      <Link
                        href="/mentor-dashboard?tab=bookings"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 font-mono-label py-3 rounded transition-all uppercase text-xs text-center border border-secondary/50 text-secondary hover:bg-secondary/10"
                      >
                        View Sessions
                      </Link>
                      <Link
                        href="/mentor-dashboard?tab=profile"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 border border-secondary/30 text-secondary/80 flex items-center justify-center rounded hover:border-secondary hover:text-secondary transition-all font-mono-label text-[10px] uppercase"
                      >
                        Profile
                      </Link>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-auto">
                      <Link
                        href={`/mentors/${mentor._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex-1 font-mono-label py-3 rounded transition-all uppercase text-xs text-center ${
                          mentor.status === "Offline"
                            ? "bg-surface-container border border-outline-variant text-on-surface hover:bg-outline-variant"
                            : "bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(47,217,244,0.4)]"
                        }`}
                      >
                        {mentor.status === "Offline" ? "VIEW PROFILE" : "VIEW & BOOK"}
                      </Link>
                      {/* Bookmark button — now functional */}
                      <button
                        onClick={(e) => toggleBookmark(e, mentor._id)}
                        title={isBookmarked ? "Remove bookmark" : "Save mentor"}
                        className={`w-12 border flex items-center justify-center rounded transition-all duration-200 ${
                          isBookmarked
                            ? "border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20"
                            : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                          bookmark
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
