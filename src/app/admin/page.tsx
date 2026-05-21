import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import MentorManager from "@/components/MentorManager";
import UserManager from "@/components/UserManager";
import BookingManager from "@/components/BookingManager";
import PaymentDashboard from "@/components/PaymentDashboard";
import CourseManager from "@/components/CourseManager";
import PricingManager from "@/components/PricingManager";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Mentor from "@/models/Mentor";
import Booking from "@/models/Booking";
import ChatSession from "@/models/ChatSession";
import Notification from "@/models/Notification";
import Payment from "@/models/Payment";
import Review from "@/models/Review";

interface SearchParams {
  tab?: string;
}

export default async function AdminPage(props: { searchParams: Promise<SearchParams> }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const resolvedParams = await props.searchParams;
  const activeTab = resolvedParams.tab || "overview";

  await connectToDatabase();

  // Core metrics
  const totalUsers = await User.countDocuments();
  const totalMentors = await Mentor.countDocuments();
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
  const pendingMentors = await User.countDocuments({ role: 'pending_mentor' });
  const totalChats = await ChatSession.countDocuments({ type: 'mentor' });
  const unreadNotifications = await Notification.countDocuments({ recipientId: (session.user as any).id, isRead: false });

  // AI Chat usage
  const aiChatsCount = await ChatSession.countDocuments({ type: 'ai' });
  const totalMessagesResult = await ChatSession.aggregate([
    { $project: { numberOfMessages: { $size: '$messages' } } },
    { $group: { _id: null, total: { $sum: '$numberOfMessages' } } }
  ]);
  const totalMessagesCount = totalMessagesResult.length > 0 ? totalMessagesResult[0].total : 0;

  // Review statistics
  const totalReviews = await Review.countDocuments();
  const averageRatingResult = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  const averageRating = averageRatingResult.length > 0 ? averageRatingResult[0].avgRating.toFixed(1) : '0.0';
  const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5);

  // Revenue stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedPayments = await Payment.find({ status: 'completed' });
  const weeklyPayments = completedPayments.filter(p => new Date(p.createdAt) >= oneWeekAgo);
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const weeklyRevenue = weeklyPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <p className="font-mono-label text-error text-[10px] uppercase tracking-widest mb-2">ADMIN_TERMINAL</p>
        <h1 className="font-h1 text-h1 sm:text-display-xl text-error mb-2">ADMIN_CONSOLE</h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl">
          System oversight, user management, revenue tracking, AI metrics, and booking control.
        </p>
      </header>

      {/* Admin Controls & Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-8">
        <Link 
          href="/admin?tab=overview" 
          className={`px-4 py-2.5 rounded-lg font-mono-label text-xs uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'overview' 
              ? 'bg-error/15 text-error border border-error/45 shadow-[0_2px_10px_rgba(255,180,171,0.1)] font-semibold' 
              : 'text-outline hover:bg-white/5 border border-transparent'
          }`}
        >
          Overview & Analytics
        </Link>
        <Link 
          href="/admin?tab=users" 
          className={`px-4 py-2.5 rounded-lg font-mono-label text-xs uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'users' 
              ? 'bg-error/15 text-error border border-error/45 shadow-[0_2px_10px_rgba(255,180,171,0.1)] font-semibold' 
              : 'text-outline hover:bg-white/5 border border-transparent'
          }`}
        >
          User & Mentor approval
        </Link>
        <Link 
          href="/admin?tab=bookings" 
          className={`px-4 py-2.5 rounded-lg font-mono-label text-xs uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'bookings' 
              ? 'bg-error/15 text-error border border-error/45 shadow-[0_2px_10px_rgba(255,180,171,0.1)] font-semibold' 
              : 'text-outline hover:bg-white/5 border border-transparent'
          }`}
        >
          Booking Overview
        </Link>
        <Link 
          href="/admin?tab=payments" 
          className={`px-4 py-2.5 rounded-lg font-mono-label text-xs uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'payments' 
              ? 'bg-error/15 text-error border border-error/45 shadow-[0_2px_10px_rgba(255,180,171,0.1)] font-semibold' 
              : 'text-outline hover:bg-white/5 border border-transparent'
          }`}
        >
          Revenue & Payments
        </Link>
        <Link 
          href="/admin?tab=courses" 
          className={`px-4 py-2.5 rounded-lg font-mono-label text-xs uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'courses' 
              ? 'bg-error/15 text-error border border-error/45 shadow-[0_2px_10px_rgba(255,180,171,0.1)] font-semibold' 
              : 'text-outline hover:bg-white/5 border border-transparent'
          }`}
        >
          Course Management
        </Link>
        <Link 
          href="/admin?tab=pricing" 
          className={`px-4 py-2.5 rounded-lg font-mono-label text-xs uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'pricing' 
              ? 'bg-error/15 text-error border border-error/45 shadow-[0_2px_10px_rgba(255,180,171,0.1)] font-semibold' 
              : 'text-outline hover:bg-white/5 border border-transparent'
          }`}
        >
          Pricing Plans
        </Link>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="glass-panel p-4 rounded-xl border border-error/20 hover:border-error/40 transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">USERS</p>
              <h2 className="font-display-xl text-2xl font-semibold text-on-background">{totalUsers}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-error/20 hover:border-error/40 transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">MENTORS</p>
              <h2 className="font-display-xl text-2xl font-semibold text-on-background">{totalMentors}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-error/35 hover:border-error/60 hover:shadow-[0_0_15px_rgba(255,180,171,0.05)] transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">PENDING APPROVALS</p>
              <h2 className="font-display-xl text-2xl font-semibold text-error">{pendingMentors}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-error/20 hover:border-error/40 transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">BOOKINGS</p>
              <h2 className="font-display-xl text-2xl font-semibold text-on-background">{totalBookings}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-error/35 hover:border-error/60 hover:shadow-[0_0_15px_rgba(255,180,171,0.05)] transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">PENDING SESSIONS</p>
              <h2 className="font-display-xl text-2xl font-semibold text-error">{pendingBookings}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-secondary/30 hover:border-secondary/50 hover:shadow-[0_0_15px_rgba(78,222,163,0.05)] transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">WEEKLY REV</p>
              <h2 className="font-display-xl text-2xl font-semibold text-secondary">${weeklyRevenue}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-primary/30 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(138,235,255,0.05)] transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">TOTAL REV</p>
              <h2 className="font-display-xl text-2xl font-semibold text-primary">${totalRevenue}</h2>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-error/20 hover:border-error/40 transition-all duration-300 hover:-translate-y-0.5 group">
              <p className="font-mono-label text-outline text-[9px] mb-1 uppercase tracking-wider truncate">ALERT COUNT</p>
              <h2 className="font-display-xl text-2xl font-semibold text-error">{unreadNotifications}</h2>
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Status Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-error/20 flex flex-col justify-between">
              <div>
                <h3 className="font-h2 text-lg mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bar_chart</span>
                  Booking Distribution
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Confirmed', count: await Booking.countDocuments({ status: 'Confirmed' }), color: 'bg-secondary', textColor: 'text-secondary' },
                    { label: 'Pending', count: pendingBookings, color: 'bg-error', textColor: 'text-error' },
                    { label: 'Completed', count: await Booking.countDocuments({ status: 'Completed' }), color: 'bg-primary', textColor: 'text-primary' },
                    { label: 'Cancelled', count: await Booking.countDocuments({ status: 'Cancelled' }), color: 'bg-outline-variant', textColor: 'text-outline' },
                  ].map((item) => {
                    const pct = totalBookings > 0 ? Math.round((item.count / totalBookings) * 100) : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono-label text-xs text-on-surface-variant">{item.label}</span>
                          <span className={`font-mono-label text-xs ${item.textColor}`}>{item.count} ({pct}%)</span>
                        </div>
                        <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, 2)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Platform Overview */}
            <div className="glass-panel p-6 rounded-2xl border border-error/20 flex flex-col justify-between">
              <div>
                <h3 className="font-h2 text-lg mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">monitoring</span>
                  Platform Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container rounded-xl p-4 text-center">
                    <p className="font-display-xl text-2xl text-primary">{totalChats}</p>
                    <p className="font-mono-label text-outline text-[9px] mt-1">1:1 CHATS</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-4 text-center">
                    <p className="font-display-xl text-2xl text-secondary">{completedPayments.length}</p>
                    <p className="font-mono-label text-outline text-[9px] mt-1">TRANSACTIONS</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-4 text-center">
                    <p className="font-display-xl text-2xl text-on-background">
                      {totalRevenue > 0 ? `$${Math.round(totalRevenue / Math.max(completedPayments.length, 1))}` : '$0'}
                    </p>
                    <p className="font-mono-label text-outline text-[9px] mt-1">AVG ORDER</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-4 text-center">
                    <p className="font-display-xl text-2xl text-error">{pendingMentors + pendingBookings}</p>
                    <p className="font-mono-label text-outline text-[9px] mt-1">PENDING ACTIONS</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-mono-label text-outline text-[10px]">PLATFORM STATUS</span>
                  <span className="font-mono-label text-secondary text-[10px] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    OPERATIONAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI/Chat Usage & Reviews Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI/Chat Usage Overview */}
            <div className="glass-panel p-6 rounded-2xl border border-error/20 flex flex-col justify-between">
              <div>
                <h3 className="font-h2 text-lg mb-6 flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">psychology</span>
                  AI / Chat Usage Overview
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container rounded-xl p-4">
                      <p className="font-mono-label text-outline text-[9px] uppercase tracking-wider mb-1">AI Conversations</p>
                      <h4 className="font-display-xl text-3xl font-semibold text-primary">{aiChatsCount}</h4>
                      <p className="font-body-md text-on-surface-variant text-[11px] mt-1">Total active career oracle sessions</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-4">
                      <p className="font-mono-label text-outline text-[9px] uppercase tracking-wider mb-1">Messages Processed</p>
                      <h4 className="font-display-xl text-3xl font-semibold text-secondary">{totalMessagesCount}</h4>
                      <p className="font-body-md text-on-surface-variant text-[11px] mt-1">Total user/assistant messages</p>
                    </div>
                  </div>
                  <div className="bg-surface-container rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono-label text-outline">ORACLE INSTANCE</span>
                      <span className="font-mono-label text-on-surface">v4.0.2 (Turbo)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono-label text-outline">API ENDPOINT STATUS</span>
                      <span className="font-mono-label text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        ONLINE
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono-label text-outline">AVG TOKENS PER MSG</span>
                      <span className="font-mono-label text-on-surface">324 Tokens</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Overview */}
            <div className="glass-panel p-6 rounded-2xl border border-error/20 flex flex-col justify-between">
              <div>
                <h3 className="font-h2 text-lg mb-6 flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined">rate_review</span>
                  Reviews & Feedback
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-surface-container rounded-xl p-4">
                    <div className="text-center border-r border-outline-variant/30 pr-6">
                      <h4 className="font-display-xl text-4xl font-bold text-secondary">{averageRating}</h4>
                      <p className="font-mono-label text-outline text-[9px] uppercase tracking-wider mt-1">AVG RATING</p>
                    </div>
                    <div>
                      <div className="flex text-secondary mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[18px]">
                            {i < Math.round(Number(averageRating)) ? 'star' : 'star_outline'}
                          </span>
                        ))}
                      </div>
                      <p className="font-body-md text-on-surface-variant text-xs">Based on {totalReviews} reviews submitted by students</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-mono-label text-outline text-[9px] uppercase tracking-wider">RECENT REVIEWS</p>
                    {recentReviews.length === 0 ? (
                      <p className="font-body-md text-on-surface-variant text-xs py-2 text-center">No reviews submitted yet.</p>
                    ) : (
                      recentReviews.map((review) => (
                        <div key={review._id} className="bg-surface-container/60 rounded-lg p-3 text-xs border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono-label text-primary font-semibold">{review.userName}</span>
                            <div className="flex text-secondary scale-75 origin-right">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[14px]">
                                  {i < review.rating ? 'star' : 'star_outline'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="font-body-md text-on-surface-variant italic">&ldquo;{review.comment || 'No comment provided.'}&rdquo;</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-12">
          {/* Users (with mentor approval) */}
          <UserManager />
          {/* Mentors */}
          <MentorManager />
        </div>
      )}

      {activeTab === "bookings" && (
        <div>
          {/* Bookings */}
          <BookingManager />
        </div>
      )}

      {activeTab === "payments" && (
        <div>
          {/* Revenue & Payments */}
          <PaymentDashboard />
        </div>
      )}

      {activeTab === "courses" && (
        <div>
          {/* Course Management */}
          <CourseManager />
        </div>
      )}

      {activeTab === "pricing" && (
        <div>
          {/* Pricing Plan Management */}
          <PricingManager />
        </div>
      )}
    </div>
  );
}
