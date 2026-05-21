"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface MentorBrief {
  _id: string;
  name: string;
  image: string;
  domain: string;
  status: string;
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
  mentors: MentorBrief[];
}

const SUBJECTS = ["All", "Technology", "Healthcare", "Finance", "Design", "Marketing", "Legal"];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-secondary/20 text-secondary",
  Intermediate: "bg-primary/20 text-primary",
  Advanced: "bg-error/20 text-error",
};

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [selectedSubject]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const url = selectedSubject === "All" ? "/api/courses" : `/api/courses?subject=${selectedSubject}`;
      const res = await fetch(url);
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <main className="pb-stack-lg px-gutter max-w-container-max mx-auto">
        {/* Header */}
        <section className="mb-8 mt-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-mono-label text-mono-label text-primary uppercase">Course Catalog Active</span>
            </div>
            <h1 className="font-h1 text-h1 text-primary mb-4">Career Courses</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Enroll in expert-led courses designed to accelerate your career trajectory. Each course comes with dedicated mentor guidance.
            </p>
          </div>
        </section>

        {/* Subject Filters */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {SUBJECTS.map((subject) => (
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
        </section>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p className="font-mono-label text-outline mt-4 animate-pulse">LOADING COURSES...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">school</span>
            <p className="font-body-lg text-on-surface-variant mb-2">No courses available for &quot;{selectedSubject}&quot;</p>
            <p className="font-body-md text-outline">Check back later or try another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="glass-panel rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_20px_rgba(47,217,244,0.15)] transition-all duration-500 flex flex-col">
                {/* Course Header */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 via-surface-container to-secondary/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src={course.image || "/placeholders/course.jpg"} 
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 z-0"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholders/course.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10"></div>
                  <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full font-mono-label text-[10px] uppercase ${LEVEL_COLORS[course.level] || "bg-outline-variant text-outline"}`}>
                      {course.level}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container/80 backdrop-blur-sm font-mono-label text-[10px] text-on-surface-variant uppercase border border-outline-variant/30">
                      {course.duration}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 font-mono-label text-[10px] text-primary uppercase">
                      {course.subject}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-h2 text-xl text-on-background mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="font-body-md text-on-surface-variant text-sm mb-4 line-clamp-2">{course.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-5">
                    {course.features?.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                        <span className="text-on-surface-variant font-body-md">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Assigned Mentors */}
                  <div className="mb-5">
                    <p className="font-mono-label text-outline text-[10px] uppercase mb-2">Assigned Mentors</p>
                    <div className="flex items-center -space-x-2">
                      {course.mentors?.slice(0, 4).map((mentor) => (
                        <div key={mentor._id} className="w-9 h-9 rounded-full border-2 border-surface overflow-hidden bg-surface-container-high flex items-center justify-center" title={mentor.name}>
                          <img 
                            src={mentor.image || "/placeholders/mentor.png"} 
                            alt={mentor.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = "/placeholders/mentor.png";
                            }}
                          />
                        </div>
                      ))}
                      {course.mentors?.length > 0 && (
                        <span className="ml-4 font-mono-label text-[11px] text-on-surface-variant">
                          {course.mentors.map((m) => m.name).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <span className="font-display-xl text-2xl text-on-background">${course.price}</span>
                      <span className="font-mono-label text-outline text-xs ml-1">USD</span>
                    </div>
                    {status === "loading" ? (
                      <div className="w-32 h-10 bg-surface-container-highest animate-pulse rounded-lg"></div>
                    ) : userRole === "admin" ? (
                      <Link
                        href="/admin?tab=courses"
                        className="px-6 py-3 border border-error/50 text-error hover:bg-error/10 font-mono-label text-xs uppercase rounded-lg transition-all text-center"
                      >
                        Edit Course
                      </Link>
                    ) : userRole === "mentor" ? (
                      <Link
                        href="/mentor-dashboard"
                        className="px-6 py-3 border border-secondary/50 text-secondary hover:bg-secondary/10 font-mono-label text-xs uppercase rounded-lg transition-all text-center"
                      >
                        View Dashboard
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course._id}/checkout`}
                        className="px-6 py-3 bg-primary text-surface font-mono-label text-xs uppercase rounded-lg hover:shadow-[0_0_20px_rgba(47,217,244,0.4)] transition-all z-20 text-center"
                      >
                        Enroll Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
