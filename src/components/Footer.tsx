import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full relative z-10 border-t border-outline-variant bg-surface-container-lowest/30 pt-12 pb-8 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Branding & Status */}
          <div className="space-y-4">
            <Link href="/" className="text-lg font-h2 font-bold tracking-tight text-primary hover:text-secondary transition-colors">
              CHOOSE EASY
            </Link>
            <p className="font-body-md text-xs text-outline leading-relaxed max-w-xs">
              Combining AI-powered career advisors with verified 1:1 industry mentorship to accelerate your professional roadmap.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-secondary emerald-glow animate-pulse"></span>
              <span className="font-mono-label text-[9px] text-secondary tracking-widest uppercase">
                ALL_SYSTEMS_OPERATIONAL
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="font-mono-label text-[11px] text-primary uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Explore Hub
                </Link>
              </li>
              <li>
                <Link href="/pathways" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Career Pathways
                </Link>
              </li>
              <li>
                <Link href="/courses" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Skill Courses
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Expert Mentors
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="font-mono-label text-[11px] text-primary uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  About Platform
                </a>
              </li>
              <li>
                <a href="#" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Security Architecture
                </a>
              </li>
              <li>
                <a href="#" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources & Socials */}
          <div>
            <h4 className="font-mono-label text-[11px] text-primary uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 mb-4">
              <li>
                <a href="#" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  API Integrations
                </a>
              </li>
              <li>
                <a href="#" className="font-mono-label text-[10px] text-outline hover:text-secondary hover:underline transition-colors uppercase tracking-wider">
                  Career Roadmap docs
                </a>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-outline hover:text-secondary transition-colors" aria-label="X / Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-outline hover:text-secondary transition-colors" aria-label="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="#" className="text-outline hover:text-secondary transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono-label text-[10px] text-outline uppercase tracking-wider">
            © {new Date().getFullYear()} CHOOSE EASY. VER_4.0.2 // ARCH_ACTIVE
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <a className="font-mono-label text-[10px] text-outline hover:text-secondary transition-colors" href="#">PRIVACY_POLICY</a>
            <a className="font-mono-label text-[10px] text-outline hover:text-secondary transition-colors" href="#">TERMS_OF_SERVICE</a>
            <a className="font-mono-label text-[10px] text-outline hover:text-secondary transition-colors" href="#">SECURITY_LOGS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
