"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { DashboardEmpty, StatusBadge } from "@/components/DashboardUI";

interface BookingData {
  _id: string;
  userName: string;
  mentorName: string;
  subject: string;
  scheduledDate: string;
  timeSlot: { startTime: string; endTime: string };
  status: string;
  createdAt: string;
}

export default function BookingManager() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch {
      showToast("Failed to load bookings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const labels: Record<string, string> = {
      Confirmed: "approve",
      Cancelled: "reject",
      Completed: "mark as completed",
    };
    if (!confirm(`Are you sure you want to ${labels[newStatus] || "update"} this booking?`)) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Booking ${newStatus.toLowerCase()}`, "success");
        fetchBookings();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update booking", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const filteredBookings =
    statusFilter === "All" ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="glass-panel p-5 sm:p-8 rounded-2xl border border-white/5 mb-8 sm:mb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
        <h2 className="font-h2 text-xl sm:text-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          All Bookings
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded font-mono-label text-[10px] uppercase transition-all border ${
                statusFilter === status
                  ? "bg-primary text-surface border-primary"
                  : "bg-transparent text-outline border-outline-variant hover:border-primary/50"
              }`}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchBookings}
            className="ml-1 text-outline hover:text-primary transition-colors flex items-center gap-1 font-mono-label text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="font-mono-label text-outline text-center py-10 animate-pulse">LOADING BOOKINGS...</p>
      ) : filteredBookings.length === 0 ? (
        <DashboardEmpty
          icon="calendar_month"
          title="No bookings found"
          description={
            statusFilter === "All"
              ? "Platform bookings will appear here as users schedule mentor sessions."
              : `No bookings with status "${statusFilter}".`
          }
        />
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[720px] text-left font-body-md text-on-surface-variant">
            <thead>
              <tr className="border-b border-outline-variant text-outline font-mono-label text-[10px] sm:text-xs">
                <th className="pb-3 pr-4">USER</th>
                <th className="pb-3 pr-4">MENTOR</th>
                <th className="pb-3 pr-4">SUBJECT</th>
                <th className="pb-3 pr-4">DATE</th>
                <th className="pb-3 pr-4">TIME</th>
                <th className="pb-3 pr-4">STATUS</th>
                <th className="pb-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors"
                >
                  <td className="py-3 sm:py-4 pr-4 text-on-surface font-medium text-sm">{booking.userName}</td>
                  <td className="py-3 sm:py-4 pr-4 text-sm">{booking.mentorName}</td>
                  <td className="py-3 sm:py-4 pr-4">
                    <span className="px-2 py-1 bg-primary/10 rounded text-xs font-mono-label text-primary">
                      {booking.subject}
                    </span>
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
                  <td className="py-3 sm:py-4">
                    <div className="flex flex-wrap gap-2">
                      {booking.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(booking._id, "Confirmed")}
                            className="bg-secondary/20 text-secondary hover:bg-secondary hover:text-surface px-2 py-1 rounded font-mono-label text-[10px] transition-colors uppercase"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(booking._id, "Cancelled")}
                            className="bg-error/20 text-error hover:bg-error hover:text-surface px-2 py-1 rounded font-mono-label text-[10px] transition-colors uppercase"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "Confirmed" && (
                        <>
                          <Link
                            href={`/dashboard/chat/${booking._id}`}
                            className="bg-primary/20 text-primary hover:bg-primary hover:text-surface px-2 py-1 rounded font-mono-label text-[10px] transition-colors uppercase inline-block"
                          >
                            Chat
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(booking._id, "Completed")}
                            className="bg-secondary/20 text-secondary hover:bg-secondary hover:text-surface px-2 py-1 rounded font-mono-label text-[10px] transition-colors uppercase"
                          >
                            Complete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
