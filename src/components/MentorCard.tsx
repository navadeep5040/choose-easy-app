"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface MentorData {
  _id: string;
  name: string;
  title: string;
  expertise: string;
  experience: string;
  availability: string;
  status: string;
  tier: string;
  rating: number;
  image: string | null;
  borderClass: string;
  textHoverClass: string;
}

export default function MentorCard({ mentor }: { mentor: MentorData }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const BOOKMARKS_KEY = "mentorconnect_bookmarks";

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      const bookmarksList = raw ? (JSON.parse(raw) as string[]) : [];
      setIsBookmarked(bookmarksList.includes(mentor._id));
    } catch {
      // ignore
    }
  }, [mentor._id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      let bookmarksList: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (bookmarksList.includes(mentor._id)) {
        bookmarksList = bookmarksList.filter(id => id !== mentor._id);
        setIsBookmarked(false);
      } else {
        bookmarksList.push(mentor._id);
        setIsBookmarked(true);
      }
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksList));
    } catch {
      // ignore
    }
  };

  const handleConnect = () => {
    router.push(`/mentors/${mentor._id}`);
  };

  return (
    <div className={`glass-panel p-6 relative group transition-all duration-500 flex flex-col h-full ${mentor.borderClass}`}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary pointer-events-none"></div>
      
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
              <span className={`w-1.5 h-1.5 rounded-full ${mentor.status === 'ONLINE' || mentor.status === 'AVAILABLE' || mentor.status === 'Available' ? 'bg-secondary animate-pulse' : mentor.status === 'BUSY' || mentor.status === 'Busy' ? 'bg-error' : 'bg-outline-variant'}`}></span>
              <span className={`font-mono-label text-[10px] ${mentor.status === 'ONLINE' || mentor.status === 'AVAILABLE' || mentor.status === 'Available' ? 'text-secondary' : mentor.status === 'BUSY' || mentor.status === 'Busy' ? 'text-error' : 'text-outline'}`}>{mentor.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-mono-label text-[10px] rounded-full uppercase">{mentor.tier}</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: `'FILL' ${i < mentor.rating ? 1 : 0}` }}>star</span>
            ))}
          </div>
        </div>
      </div>
      
      <h3 className={`font-h2 text-h2 text-on-surface mb-1 transition-colors ${mentor.textHoverClass}`}>{mentor.name}</h3>
      <p className="font-mono-label text-[12px] text-outline uppercase mb-4 tracking-widest">{mentor.title}</p>
      
      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
          <span className="font-body-md text-on-surface-variant text-sm">Expertise</span>
          <span className="font-mono-label text-on-surface text-xs">{mentor.expertise}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
          <span className="font-body-md text-on-surface-variant text-sm">Experience</span>
          <span className="font-mono-label text-on-surface text-xs">{mentor.experience}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
          <span className="font-body-md text-on-surface-variant text-sm">Availability</span>
          <span className={`font-mono-label text-xs ${mentor.status === 'OFFLINE' || mentor.status === 'Offline' ? 'text-error' : 'text-secondary'}`}>{mentor.availability}</span>
        </div>
      </div>

      {status === "loading" ? (
        <div className="flex gap-4 mt-auto">
          <div className="flex-1 h-12 bg-surface-container-highest animate-pulse rounded-lg"></div>
        </div>
      ) : userRole === "admin" ? (
        <div className="flex gap-4 mt-auto">
          <button
            onClick={() => router.push("/admin?tab=users")}
            className="flex-1 font-mono-label py-3 rounded transition-all uppercase text-xs border border-error/50 text-error hover:bg-error/10 cursor-pointer"
          >
            Manage Mentor
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 border border-error/30 text-error/80 hover:border-error hover:text-error transition-all font-mono-label text-[10px] uppercase rounded flex items-center justify-center cursor-pointer"
          >
            Panel
          </button>
        </div>
      ) : userRole === "mentor" ? (
        <div className="flex gap-4 mt-auto">
          <button
            onClick={() => router.push("/mentor-dashboard?tab=bookings")}
            className="flex-1 font-mono-label py-3 rounded transition-all uppercase text-xs border border-secondary/50 text-secondary hover:bg-secondary/10 cursor-pointer"
          >
            View Sessions
          </button>
          <button
            onClick={() => router.push("/mentor-dashboard?tab=profile")}
            className="px-4 border border-secondary/30 text-secondary/80 hover:border-secondary hover:text-secondary transition-all font-mono-label text-[10px] uppercase rounded flex items-center justify-center cursor-pointer"
          >
            Profile
          </button>
        </div>
      ) : (
        <div className="flex gap-4 mt-auto">
          <button 
            onClick={handleConnect}
            className={`flex-1 font-mono-label py-3 rounded transition-all uppercase text-xs ${mentor.status === 'OFFLINE' || mentor.status === 'Offline' || mentor.status === 'UNAVAILABLE' || mentor.status === 'Unavailable' ? 'bg-surface-container border border-outline-variant text-on-surface hover:bg-outline-variant' : 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(138,235,255,0.4)]'}`}
          >
            {mentor.status === 'OFFLINE' || mentor.status === 'Offline' || mentor.status === 'UNAVAILABLE' || mentor.status === 'Unavailable' ? 'VIEW PROFILE' : 'CONNECT'}
          </button>
          <button 
            onClick={toggleBookmark}
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
}
