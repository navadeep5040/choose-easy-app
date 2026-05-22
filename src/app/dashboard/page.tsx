"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  mentorName: string;
  subject: string;
  scheduledDate: string;
  timeSlot: { startTime: string; endTime: string };
  status: string;
  createdAt: string;
}

function ReviewForm({
  bookingId,
  reviewRating,
  reviewComment,
  isSubmitting,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onCancel,
}: {
  bookingId: string;
  reviewRating: number;
  reviewComment: string;
  isSubmitting: boolean;
  onRatingChange: (n: number) => void;
  onCommentChange: (v: string) => void;
  onSubmit: (id: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-xl sm:text-2xl transition-colors ${star <= reviewRating ? "text-yellow-400" : "text-outline"}`}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={reviewComment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Share your session feedback..."
        rows={2}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-sm text-on-surface focus:border-primary focus:outline-none resize-none"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSubmit(bookingId)}
          disabled={isSubmitting}
          className="px-4 py-2 bg-secondary text-surface rounded-lg text-[10px] font-mono-label uppercase hover:shadow-[0_0_10px_rgba(78,222,163,0.3)] disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-outline-variant text-outline rounded-lg text-[10px] font-mono-label uppercase hover:border-primary/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const userRole = (session?.user as { role?: string })?.role;
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ─── FIX: Use a ref guard so this effect runs exactly once per mount.
  // Previously, including `session` + `update` in deps caused update() to
  // return a new session reference → session dep change → effect re-ran → loop.
  const hasFetched = useRef(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/reviews?mine=true"),
      ]);

      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
      }

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviewedBookings(new Set(data.bookingIds || []));
      }
    } catch {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (!userRole) {
      return;
    }
    if (userRole === "admin") {
      router.push("/admin");
      return;
    }
    if (userRole === "mentor") {
      router.push("/mentor-dashboard");
      return;
    }
    // Guard: only fetch once per mount regardless of session reference changes
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, session, userRole]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (res.ok) {
        showToast("Booking cancelled", "success");
        fetchBookings();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to cancel booking", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleSubmitReview = async (bookingId: string) => {
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        showToast("Review submitted successfully!", "success");
        setReviewedBookings((prev) => new Set(prev).add(bookingId));
        setReviewBookingId(null);
        setReviewComment("");
        setReviewRating(5);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to submit review", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openReview = (bookingId: string) => {
    setReviewBookingId(bookingId);
    setReviewRating(5);
    setReviewComment("");
  };

  const renderReviewAction = (booking: BookingData) => {
    if (booking.status !== "Completed") return null;
    if (reviewedBookings.has(booking._id)) {
      return <span className="font-mono-label text-[10px] text-outline uppercase">Reviewed ✓</span>;
    }
    if (reviewBookingId === booking._id) {
      return (
        <ReviewForm
          bookingId={booking._id}
          reviewRating={reviewRating}
          reviewComment={reviewComment}
          isSubmitting={isSubmittingReview}
          onRatingChange={setReviewRating}
          onCommentChange={setReviewComment}
          onSubmit={handleSubmitReview}
          onCancel={() => setReviewBookingId(null)}
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => openReview(booking._id)}
        className="px-4 py-2 border border-secondary/50 text-secondary rounded-lg text-[10px] font-mono-label uppercase hover:bg-secondary/10 transition-all inline-flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[16px]">rate_review</span>
        Leave Review
      </button>
    );
  };

  if (authStatus === "loading" || (!session && authStatus !== "unauthenticated")) {
    return <DashboardLoading message="INITIALIZING USER DASHBOARD..." />;
  }

  if (!session) return null;

  if (userRole !== "user" && userRole !== "pending_mentor") {
    return <DashboardLoading message="REDIRECTING..." />;
  }

  if (isLoading && bookings.length === 0) {
    return <DashboardLoading message="SYNCING BOOKINGS..." />;
  }

  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");
  const completedBookings = bookings.filter((b) => b.status === "Completed");
  const reviewableCount = completedBookings.filter((b) => !reviewedBookings.has(b._id)).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <p className="font-mono-label text-secondary text-[10px] uppercase tracking-widest mb-2">USER_TERMINAL</p>
        <h1 className="font-h1 text-h1 sm:text-display-xl text-on-background mb-2 break-words">
          Welcome, {session.user?.name || session.user?.email}
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl">
          Track sessions, chat with mentors, and leave feedback after completed guidance.
        </p>
      </header>

      {userRole === "pending_mentor" && (
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-secondary/30 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="material-symbols-outlined text-secondary text-3xl shrink-0">hourglass_top</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-h2 text-lg text-secondary mb-1">MENTOR ACCESS PENDING</h2>
            <p className="font-body-md text-on-surface-variant text-sm">
              Your mentor application is awaiting admin approval. You can use the standard dashboard until access is granted.
            </p>
          </div>
        </div>
      )}


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <StatCard label="Pending" value={pendingBookings.length} accent="error" icon="pending_actions" />
        <StatCard label="Active" value={confirmedBookings.length} accent="secondary" icon="event_available" />
        <StatCard label="Completed" value={completedBookings.length} accent="primary" icon="check_circle" />
        <StatCard label="Reviews Due" value={reviewableCount} accent="primary" icon="rate_review" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <Link href="/pathways" className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">psychology</span>
            <h3 className="font-h2 text-lg">Career Pathways</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mb-4">Explore pathways aligned to your profile.</p>
          <span className="text-secondary font-mono-label uppercase text-xs">Explore →</span>
        </Link>
        <Link href="/dashboard/chat" className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">chat</span>
            <h3 className="font-h2 text-lg">AI Career Chat</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mb-4">Analyze fit with the career oracle.</p>
          <span className="text-secondary font-mono-label uppercase text-xs">Start Chat →</span>
        </Link>
        <Link href="/mentors" className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">people</span>
            <h3 className="font-h2 text-lg">Find a Mentor</h3>
          </div>
          <p className="font-body-md text-on-surface-variant text-sm mb-4">Book expert guidance sessions.</p>
          <span className="text-secondary font-mono-label uppercase text-xs">Browse →</span>
        </Link>
      </div>

      {reviewableCount > 0 && (
        <DashboardSection
          title="Leave a Review"
          icon="rate_review"
          iconClassName="text-primary"
          count={reviewableCount}
          borderClassName="border-primary/25"
        >
          <p className="font-body-md text-on-surface-variant text-sm mb-4">
            These completed sessions are ready for your feedback.
          </p>
          <div className="space-y-4">
            {completedBookings
              .filter((b) => !reviewedBookings.has(b._id))
              .map((booking) => (
                <div
                  key={booking._id}
                  className="bg-surface-container rounded-xl p-4 sm:p-5 border border-primary/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-body-md text-on-surface font-medium">{booking.mentorName}</span>
                      <StatusBadge status="Completed" />
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="font-mono-label text-primary">{booking.subject}</span>
                      <span className="font-mono-label text-on-surface-variant">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {renderReviewAction(booking)}
                </div>
              ))}
          </div>
        </DashboardSection>
      )}

      {confirmedBookings.length > 0 && (
        <DashboardSection
          title="Active Sessions"
          icon="event_available"
          iconClassName="text-secondary"
          count={confirmedBookings.length}
          borderClassName="border-secondary/20"
        >
          <div className="space-y-3 sm:space-y-4">
            {confirmedBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-body-md text-on-surface font-medium">{booking.mentorName}</span>
                    <StatusBadge status="Confirmed" />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="font-mono-label text-primary">{booking.subject}</span>
                    <span className="font-mono-label text-on-surface-variant">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="font-mono-label text-secondary">
                      {booking.timeSlot.startTime} – {booking.timeSlot.endTime}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/chat/${booking._id}`}
                  className="px-5 py-2.5 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  Chat
                </Link>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}

      {pendingBookings.length > 0 && (
        <DashboardSection
          title="Pending Requests"
          icon="pending_actions"
          iconClassName="text-error"
          count={pendingBookings.length}
          borderClassName="border-error/20"
        >
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-surface-container rounded-xl p-4 sm:p-5 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="font-body-md text-on-surface font-medium">{booking.mentorName}</span>
                  <div className="flex flex-wrap gap-3 text-sm mt-1">
                    <span className="font-mono-label text-primary">{booking.subject}</span>
                    <span className="font-mono-label text-on-surface-variant">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCancelBooking(booking._id)}
                  className="px-4 py-2 border border-error/50 text-error rounded-lg font-mono-label text-xs uppercase hover:bg-error hover:text-surface transition-all shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </DashboardSection>
      )}

      <DashboardSection title="Booking History" icon="calendar_today" iconClassName="text-primary">
        {isLoading ? (
          <p className="font-mono-label text-outline text-center py-8 animate-pulse">SYNCING BOOKINGS...</p>
        ) : bookings.length === 0 ? (
          <DashboardEmpty
            icon="calendar_month"
            title="No bookings yet"
            description="Browse mentors and book your first guidance session to see activity here."
            actionLabel="Browse Mentors"
            actionHref="/mentors"
          />
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[640px] text-left font-body-md text-on-surface-variant">
              <thead>
                <tr className="border-b border-outline-variant text-outline font-mono-label text-[10px] sm:text-xs">
                  <th className="pb-3 pr-4">MENTOR</th>
                  <th className="pb-3 pr-4">SUBJECT</th>
                  <th className="pb-3 pr-4">DATE</th>
                  <th className="pb-3 pr-4">TIME</th>
                  <th className="pb-3 pr-4">STATUS</th>
                  <th className="pb-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-3 sm:py-4 pr-4 text-on-surface font-medium text-sm">{booking.mentorName}</td>
                    <td className="py-3 sm:py-4 pr-4">
                      <span className="px-2 py-1 bg-primary/10 rounded text-xs font-mono-label text-primary">{booking.subject}</span>
                    </td>
                    <td className="py-3 sm:py-4 pr-4 text-sm whitespace-nowrap">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 sm:py-4 pr-4 font-mono-label text-xs text-secondary whitespace-nowrap">
                      {booking.timeSlot?.startTime} – {booking.timeSlot?.endTime}
                    </td>
                    <td className="py-3 sm:py-4 pr-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 sm:py-4">{renderReviewAction(booking)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
