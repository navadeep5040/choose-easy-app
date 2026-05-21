"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const userRole = (session?.user as any)?.role;

  const navLinks = [
    { href: "/", label: "Explore" },
    { href: "/pathways", label: "Pathways" },
    { href: "/courses", label: "Courses" },
    { href: "/mentors", label: "Mentors" },
    { href: "/pricing", label: "Pricing" },
  ];

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `font-mono-label text-[11px] uppercase tracking-wider px-3 py-1.5 rounded transition-all duration-300 ${
      isActive
        ? "text-primary bg-primary/10 border-b border-primary/45 shadow-[0_2px_10px_rgba(138,235,255,0.1)]"
        : "text-outline hover:text-on-surface hover:bg-white/5"
    }`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/5 transition-all duration-300 hover:bg-black/75" id="navbar">
      <div className="flex justify-between items-center px-6 sm:px-8 py-3.5 sm:py-4 max-w-[1440px] mx-auto">
        <Link href="/" className="text-xl font-h2 font-bold tracking-tight text-primary transition-transform duration-300 hover:scale-[1.02] flex items-center gap-2">
          CHOOSE EASY
          <div className="hidden sm:flex items-center gap-2 ml-4">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary emerald-glow animate-pulse"></span>
            <span className="font-mono-label text-[9px] text-secondary opacity-60 tracking-widest">SYS_ACTIVE</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <NotificationBell />
              {userRole === "admin" && (
                <Link href="/admin" className="font-mono-label text-[11px] text-error hover:text-primary transition-colors uppercase tracking-wider">Admin</Link>
              )}
              {userRole === "mentor" && (
                <Link href="/mentor-dashboard" className="font-mono-label text-[11px] text-secondary hover:text-primary transition-colors uppercase tracking-wider">Sessions</Link>
              )}
              <Link href="/profile" className="font-mono-label text-[11px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Profile
              </Link>
              <Link href={userRole === "admin" ? "/admin" : userRole === "mentor" ? "/mentor-dashboard" : "/dashboard"} className="font-mono-label text-[11px] uppercase tracking-wider text-on-background bg-transparent border border-outline/35 px-5 py-2 rounded-full hover:bg-white/5 hover:border-white/50 transition-all duration-300">
                {userRole === "admin" ? "Admin Panel" : userRole === "mentor" ? "Mentor Dashboard" : "Dashboard"}
              </Link>
              <button onClick={() => signOut()} className="font-mono-label text-[11px] uppercase tracking-wider text-on-primary bg-primary px-5 py-2 rounded-full hover:cyan-glow transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-mono-label text-[11px] uppercase tracking-wider text-on-background bg-transparent border border-outline/35 px-5 py-2 rounded-full hover:bg-white/5 hover:border-white/50 transition-all duration-300">
                Sign In
              </Link>
              <Link href="/get-started" className="font-mono-label text-[11px] uppercase tracking-wider text-on-primary bg-primary px-5 py-2 rounded-full hover:cyan-glow transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-on-background hover:text-primary transition-colors p-1" aria-label="Toggle menu">
          <span className="material-symbols-outlined text-2xl">{isOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-surface-container-high/95 backdrop-blur-xl border-b border-outline-variant transition-all duration-300 origin-top overflow-hidden ${
        isOpen ? "max-h-[500px] opacity-100 py-6 px-6" : "max-h-0 opacity-0 py-0 px-6 border-b-0"
      }`}>
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-mono-label text-sm uppercase tracking-wider py-1.5 transition-colors ${
                  isActive ? "text-primary" : "text-outline hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <hr className="border-outline-variant/30 my-1"/>

          {session ? (
            <div className="flex flex-col gap-4 pt-1">
              {userRole === "admin" && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-error hover:text-primary font-mono-label text-sm uppercase tracking-wider">
                  Admin Console
                </Link>
              )}
              {userRole === "mentor" && (
                <Link href="/mentor-dashboard" onClick={() => setIsOpen(false)} className="text-secondary hover:text-primary font-mono-label text-sm uppercase tracking-wider">
                  My Sessions
                </Link>
              )}
              <Link href="/profile" onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-primary font-mono-label text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Profile
              </Link>
              <Link href={userRole === "admin" ? "/admin" : userRole === "mentor" ? "/mentor-dashboard" : "/dashboard"} onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary font-mono-label text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                {userRole === "admin" ? "Admin Panel" : userRole === "mentor" ? "Mentor Dashboard" : "Dashboard"}
              </Link>
              <button
                onClick={() => { signOut(); setIsOpen(false); }}
                className="text-left text-error hover:text-error-container font-mono-label text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pt-1">
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-on-surface hover:text-primary font-mono-label text-sm uppercase tracking-wider">
                Sign In
              </Link>
              <Link href="/get-started" onClick={() => setIsOpen(false)} className="text-primary hover:text-white font-mono-label text-sm uppercase tracking-wider">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
