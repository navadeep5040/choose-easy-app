"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface Mentor {
  _id: string;
  userId: string;
  name: string;
  domain: string;
  subjects: string[];
  matchScore: string;
  status: string;
  hourlyRate: number;
  bio: string;
  image: string;
  availability: { day: string; startTime: string; endTime: string }[];
  createdAt: string;
}

interface BookingData {
  _id: string;
  userName: string;
  subject: string;
  status: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUBJECTS_OPTIONS = ["Technology", "Healthcare", "Finance", "Design", "Marketing", "Legal", "Business", "Science"];
const EMPTY_FORM = {
  name: "",
  domain: "",
  matchScore: "",
  status: "Available",
  bio: "",
  subjects: [] as string[],
  hourlyRate: "",
  image: "",
};

export default function MentorManager() {
  const { showToast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorBookings, setMentorBookings] = useState<Record<string, BookingData[]>>({});
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isLoading, setIsLoading] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
        setForm((p) => ({ ...p, image: data.url }));
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

  // Availability form state for the edit modal
  const [editAvailability, setEditAvailability] = useState<{ day: string; startTime: string; endTime: string }[]>([]);
  const [newDay, setNewDay] = useState("Monday");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("12:00");

  const fetchMentors = async () => {
    try {
      const res = await fetch("/api/mentors");
      if (res.ok) {
        const data = await res.json();
        setMentors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookingsForMentor = async (mentorId: string) => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const allBookings = await res.json();
        const mentorBks = allBookings.filter(
          (b: BookingData & { mentorId?: string }) =>
            b.mentorId === mentorId && (b.status === "Confirmed" || b.status === "Pending")
        );
        setMentorBookings((prev) => ({ ...prev, [mentorId]: mentorBks }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const toggleExpand = (mentorId: string) => {
    if (expandedMentor === mentorId) {
      setExpandedMentor(null);
    } else {
      setExpandedMentor(mentorId);
      if (!mentorBookings[mentorId]) {
        fetchBookingsForMentor(mentorId);
      }
    }
  };

  const toggleSubject = (subject: string) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const addAvailabilitySlot = () => {
    setEditAvailability((prev) => [...prev, { day: newDay, startTime: newStartTime, endTime: newEndTime }]);
  };

  const removeSlot = (index: number) => {
    setEditAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingMentorId ? `/api/mentors/${editingMentorId}` : "/api/mentors";
      const method = editingMentorId ? "PUT" : "POST";

      const payload = {
        name: form.name,
        domain: form.domain,
        matchScore: form.matchScore || "N/A",
        status: form.status,
        bio: form.bio,
        subjects: form.subjects.length > 0 ? form.subjects : [form.domain],
        hourlyRate: Number(form.hourlyRate) || 0,
        image: form.image,
        availability: editAvailability,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingMentorId ? "Mentor updated successfully" : "Mentor added successfully", "success");
        resetForm();
        fetchMentors();
      } else {
        const data = await res.json();
        showToast(data.error || `Failed to ${editingMentorId ? "edit" : "add"} mentor`, "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditAvailability([]);
    setEditingMentorId(null);
    setShowForm(false);
  };

  const startEdit = (mentor: Mentor) => {
    setEditingMentorId(mentor._id);
    setForm({
      name: mentor.name,
      domain: mentor.domain,
      matchScore: mentor.matchScore,
      status: mentor.status,
      bio: mentor.bio || "",
      subjects: mentor.subjects || [],
      hourlyRate: String(mentor.hourlyRate || 0),
      image: mentor.image || "",
    });
    setEditAvailability(mentor.availability || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;

    try {
      const res = await fetch(`/api/mentors/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Mentor deleted", "success");
        fetchMentors();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete mentor", "error");
      }
    } catch (err) {
      showToast("An error occurred while deleting", "error");
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-h2 text-2xl text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">supervisor_account</span>
            Mentor Management
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Add mentors with full profiles, subjects, hourly rate, bio, and availability slots.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 bg-secondary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Mentor
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-secondary/30">
          <h3 className="font-h2 text-xl mb-6 flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined">{editingMentorId ? "edit" : "person_add"}</span>
            {editingMentorId ? "Edit Mentor Profile" : "Add New Mentor"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">FULL NAME *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none"
                  placeholder="e.g. Dr. Ada Lovelace"
                />
              </div>
              {/* Domain */}
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">DOMAIN / TITLE *</label>
                <input
                  required
                  type="text"
                  value={form.domain}
                  onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none"
                  placeholder="e.g. Cloud & DevOps"
                />
              </div>
              {/* Hourly Rate */}
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">HOURLY RATE (USD)</label>
                <input
                  type="number"
                  min="0"
                  value={form.hourlyRate}
                  onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none"
                  placeholder="e.g. 75"
                />
              </div>
              {/* Match Score */}
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">MATCH SCORE</label>
                <input
                  type="text"
                  value={form.matchScore}
                  onChange={(e) => setForm((p) => ({ ...p, matchScore: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none"
                  placeholder="e.g. 95%"
                />
              </div>
              {/* Status */}
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">STATUS</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              {/* Image Preview & Upload */}
              <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-start">
                {/* Profile Image Preview */}
                <div className="relative w-24 h-24 rounded-xl border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0 group">
                  <img
                    src={form.image || "/placeholders/mentor.png"}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholders/mentor.png";
                    }}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined animate-spin text-secondary text-sm">progress_activity</span>
                      <span className="font-mono-label text-[8px] text-secondary">UPLOADING...</span>
                    </div>
                  )}
                </div>
                {/* URL and File Inputs */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">PROFILE IMAGE</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={form.image}
                        onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg or upload file"
                        className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none"
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
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="font-mono-label text-outline text-xs block mb-1">BIO / DESCRIPTION</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-secondary focus:outline-none resize-none"
                placeholder="Describe the mentor's background, expertise and experience..."
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="font-mono-label text-outline text-xs block mb-2">EXPERTISE SUBJECTS</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS_OPTIONS.map((subject) => {
                  const selected = form.subjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-1.5 rounded-full border font-mono-label text-[10px] uppercase transition-all ${
                        selected
                          ? "bg-secondary/20 border-secondary/50 text-secondary"
                          : "border-outline-variant/50 text-on-surface-variant hover:border-secondary/40"
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Slots */}
            <div>
              <label className="font-mono-label text-outline text-xs block mb-2">
                AVAILABILITY SLOTS <span className="text-secondary ml-1">({editAvailability.length} slots set)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface font-body-md text-sm focus:border-secondary focus:outline-none"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface font-body-md text-sm focus:border-secondary focus:outline-none"
                />
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg p-2.5 text-on-surface font-body-md text-sm focus:border-secondary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addAvailabilitySlot}
                className="px-4 py-2 bg-secondary/15 border border-secondary/30 text-secondary rounded-lg font-mono-label text-[10px] uppercase hover:bg-secondary/25 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Slot
              </button>

              {editAvailability.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editAvailability.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container rounded-lg px-3 py-2 border border-outline-variant/30">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span>
                        <div>
                          <p className="font-mono-label text-on-surface text-[11px]">{slot.day}</p>
                          <p className="font-mono-label text-on-surface-variant text-[10px]">{slot.startTime} — {slot.endTime}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="text-outline hover:text-error transition-colors p-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-secondary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all disabled:opacity-50"
              >
                {isLoading ? "SAVING..." : editingMentorId ? "SAVE CHANGES" : "ADD MENTOR"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-outline-variant text-outline rounded-lg font-mono-label text-xs uppercase hover:border-secondary/40 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mentor List */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <h3 className="font-h2 text-lg text-on-surface">All Mentors</h3>
          <span className="font-mono-label text-outline text-xs">{mentors.length} total</span>
        </div>

        {mentors.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">person_search</span>
            <p className="font-body-md text-on-surface-variant">No mentors yet. Add one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {mentors.map((mentor) => (
              <Fragment key={mentor._id}>
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10 border border-white/10 flex items-center justify-center shrink-0">
                    <img 
                      src={mentor.image || "/placeholders/mentor.png"} 
                      alt={mentor.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = "/placeholders/mentor.png";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-h2 text-sm text-on-surface font-medium">{mentor.name}</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono-label text-[9px] uppercase ${
                        mentor.status === "Available" ? "bg-secondary/20 text-secondary" :
                        mentor.status === "Busy" ? "bg-error/20 text-error" :
                        "bg-outline-variant/30 text-outline"
                      }`}>{mentor.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 font-mono-label text-[10px] text-outline">
                      <span>{mentor.domain}</span>
                      {mentor.hourlyRate > 0 && <span className="text-secondary">${mentor.hourlyRate}/hr</span>}
                      <span className="text-primary">{mentor.matchScore || "N/A"}</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {mentor.availability?.length || 0} slots
                      </span>
                      {mentor.subjects?.length > 0 && (
                        <span className="text-on-surface-variant">{mentor.subjects.slice(0, 3).join(", ")}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleExpand(mentor._id)}
                      title="View bookings"
                      className={`p-2 rounded-lg border transition-all ${expandedMentor === mentor._id ? "border-primary/50 text-primary bg-primary/10" : "border-outline-variant text-outline hover:border-primary hover:text-primary"}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </button>
                    <button
                      onClick={() => startEdit(mentor)}
                      title="Edit mentor"
                      className="p-2 rounded-lg border border-outline-variant text-outline hover:border-secondary hover:text-secondary transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(mentor._id)}
                      title="Delete mentor"
                      className="p-2 rounded-lg border border-outline-variant text-outline hover:border-error hover:text-error transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Bookings */}
                {expandedMentor === mentor._id && (
                  <div className="px-5 pb-5 bg-surface-container/30 border-t border-white/5">
                    <p className="font-mono-label text-outline text-[10px] uppercase mb-3 pt-4">
                      Active Bookings for {mentor.name}
                    </p>
                    {!mentorBookings[mentor._id] ? (
                      <p className="text-outline text-sm font-mono-label animate-pulse">Loading...</p>
                    ) : mentorBookings[mentor._id].length === 0 ? (
                      <p className="text-outline text-sm">No active bookings for this mentor.</p>
                    ) : (
                      <div className="space-y-2">
                        {mentorBookings[mentor._id].map((booking) => (
                          <div key={booking._id} className="flex items-center justify-between bg-surface-container-high rounded-lg p-3 border border-outline-variant/30">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                              <div>
                                <p className="text-on-surface text-sm font-medium">{booking.userName}</p>
                                <p className="font-mono-label text-primary text-[10px]">{booking.subject}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-label ${
                                booking.status === "Confirmed" ? "bg-secondary/20 text-secondary" : "bg-error/20 text-error"
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            {booking.status === "Confirmed" && (
                              <Link
                                href={`/dashboard/chat/${booking._id}`}
                                className="px-4 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-surface rounded font-mono-label text-[10px] transition-colors uppercase flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">chat</span>
                                Open Chat
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
