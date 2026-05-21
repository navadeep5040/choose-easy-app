"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useToast } from "@/components/Toast";

interface MentorOption {
  _id: string;
  name: string;
  domain: string;
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  duration: string;
  level: string;
  features: string[];
  image: string;
  isActive: boolean;
  mentorIds: string[];
  mentors?: { _id: string; name: string }[];
}

const SUBJECTS = ["Technology", "Healthcare", "Finance", "Design", "Marketing", "Legal", "Business", "Science"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-secondary/20 text-secondary",
  Intermediate: "bg-primary/20 text-primary",
  Advanced: "bg-error/20 text-error",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  subject: "Technology",
  price: "",
  duration: "",
  level: "Beginner",
  mentorIds: [] as string[],
  features: "",
  image: "",
};

export default function CourseManager() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);
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

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      // Admin fetches all courses including inactive
      const res = await fetch("/api/courses?admin=true");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch {
      showToast("Failed to load courses", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchMentors = useCallback(async () => {
    try {
      const res = await fetch("/api/mentors");
      if (res.ok) {
        const data = await res.json();
        setMentorOptions(data.map((m: MentorOption) => ({ _id: m._id, name: m.name, domain: m.domain })));
      }
    } catch {
      console.error("Failed to load mentors");
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchMentors();
  }, [fetchCourses, fetchMentors]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (course: CourseData) => {
    setForm({
      title: course.title,
      description: course.description,
      subject: course.subject,
      price: String(course.price),
      duration: course.duration,
      level: course.level,
      mentorIds: course.mentorIds || [],
      features: course.features?.join("\n") || "",
      image: course.image || "",
    });
    setEditingId(course._id);
    setShowForm(true);
  };

  const handleMentorToggle = (mentorId: string) => {
    setForm((prev) => ({
      ...prev,
      mentorIds: prev.mentorIds.includes(mentorId)
        ? prev.mentorIds.filter((id) => id !== mentorId)
        : [...prev.mentorIds, mentorId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      subject: form.subject,
      price: Number(form.price),
      duration: form.duration,
      level: form.level,
      mentorIds: form.mentorIds,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      image: form.image,
      isActive: true,
    };

    try {
      const url = editingId ? `/api/courses/${editingId}` : "/api/courses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingId ? "Course updated" : "Course created", "success");
        resetForm();
        fetchCourses();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to save course", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this course?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Course deleted", "success");
        fetchCourses();
      } else {
        showToast("Failed to delete course", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleToggleActive = async (course: CourseData) => {
    try {
      const res = await fetch(`/api/courses/${course._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !course.isActive }),
      });
      if (res.ok) {
        showToast(`Course ${course.isActive ? "deactivated" : "activated"}`, "success");
        fetchCourses();
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-h2 text-2xl text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">school</span>
            Course Management
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-1">
            Create, edit, and manage the course catalog. Assign mentors and configure metadata.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Course
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary/30">
          <h3 className="font-h2 text-xl mb-6 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">{editingId ? "edit" : "add_circle"}</span>
            {editingId ? "Edit Course" : "Create New Course"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">COURSE TITLE *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                  placeholder="e.g. Full-Stack Web Development"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">SUBJECT *</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">PRICE (USD) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                  placeholder="e.g. 299"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">DURATION *</label>
                <input
                  required
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                  placeholder="e.g. 8 weeks"
                />
              </div>
              <div>
                <label className="font-mono-label text-outline text-xs block mb-1">DIFFICULTY LEVEL</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {/* Image Preview & Upload */}
              <div className="md:col-span-2 flex flex-col md:flex-row gap-6 items-start">
                {/* Course Banner Preview */}
                <div className="relative w-36 h-20 rounded-xl border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0 group">
                  <img
                    src={form.image || "/placeholders/course.jpg"}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholders/course.jpg";
                    }}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined animate-spin text-primary text-sm">progress_activity</span>
                      <span className="font-mono-label text-[8px] text-primary">UPLOADING...</span>
                    </div>
                  )}
                </div>
                {/* URL and File Inputs */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-1">COURSE THUMBNAIL IMAGE</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={form.image}
                        onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg or upload file"
                        className="flex-1 bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none"
                      />
                      <label className="relative cursor-pointer px-6 py-3 bg-primary text-surface font-mono-label text-xs uppercase rounded-lg hover:shadow-[0_0_15px_rgba(47,217,244,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]">
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

            <div>
              <label className="font-mono-label text-outline text-xs block mb-1">DESCRIPTION *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none resize-none"
                placeholder="Comprehensive course description..."
              />
            </div>

            <div>
              <label className="font-mono-label text-outline text-xs block mb-1">FEATURES (one per line)</label>
              <textarea
                value={form.features}
                onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                rows={4}
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface font-body-md focus:border-primary focus:outline-none resize-none"
                placeholder={"Live project experience\n1-on-1 mentor sessions\nCertificate of completion"}
              />
            </div>

            {/* Mentor Assignment */}
            <div>
              <label className="font-mono-label text-outline text-xs block mb-2">ASSIGN MENTORS</label>
              {mentorOptions.length === 0 ? (
                <p className="text-outline text-sm font-body-md">No mentors available to assign.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {mentorOptions.map((mentor) => {
                    const selected = form.mentorIds.includes(mentor._id);
                    return (
                      <button
                        key={mentor._id}
                        type="button"
                        onClick={() => handleMentorToggle(mentor._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-xs font-mono-label ${
                          selected
                            ? "bg-primary/15 border-primary/50 text-primary"
                            : "bg-surface-container border-outline-variant/50 text-on-surface-variant hover:border-primary/30"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {selected ? "check_box" : "check_box_outline_blank"}
                        </span>
                        <span className="truncate">{mentor.name}</span>
                        <span className="text-outline truncate">· {mentor.domain}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary text-surface rounded-lg font-mono-label text-xs uppercase hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all disabled:opacity-50"
              >
                {isSaving ? "SAVING..." : editingId ? "SAVE CHANGES" : "CREATE COURSE"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-outline-variant text-outline rounded-lg font-mono-label text-xs uppercase hover:border-primary/40 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course List */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <h3 className="font-h2 text-lg text-on-surface">All Courses</h3>
          <span className="font-mono-label text-outline text-xs">{courses.length} total</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
            <p className="font-mono-label text-outline mt-3 animate-pulse text-sm">LOADING COURSES...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">school</span>
            <p className="font-body-md text-on-surface-variant">No courses yet. Create your first course above.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {courses.map((course) => (
              <div
                key={course._id}
                className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors ${!course.isActive ? "opacity-60" : ""}`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center shrink-0 border border-white/10">
                  <img 
                    src={course.image || "/placeholders/course.jpg"} 
                    alt={course.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "/placeholders/course.jpg";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-h2 text-sm text-on-surface font-medium truncate">{course.title}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono-label text-[10px] ${LEVEL_COLORS[course.level] || "bg-outline-variant text-outline"}`}>
                      {course.level}
                    </span>
                    {!course.isActive && (
                      <span className="px-2 py-0.5 rounded-full font-mono-label text-[10px] bg-outline-variant/30 text-outline">INACTIVE</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 font-mono-label text-[11px] text-outline">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">category</span>
                      {course.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      ${course.price}
                    </span>
                    {course.mentors && course.mentors.length > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {course.mentors.map((m) => m.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(course)}
                    title={course.isActive ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-lg border transition-all ${course.isActive ? "border-secondary/40 text-secondary hover:bg-secondary/10" : "border-outline-variant text-outline hover:border-secondary hover:text-secondary"}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {course.isActive ? "toggle_on" : "toggle_off"}
                    </span>
                  </button>
                  <button
                    onClick={() => startEdit(course)}
                    title="Edit course"
                    className="p-2 rounded-lg border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    title="Delete course"
                    className="p-2 rounded-lg border border-outline-variant text-outline hover:border-error hover:text-error transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
