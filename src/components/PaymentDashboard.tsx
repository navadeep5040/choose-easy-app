"use client";

import { useState, useEffect } from "react";

interface PaymentData {
  _id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  mentorName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

interface RevenueStats {
  weeklyRevenue: number;
  weeklyCount: number;
  monthlyRevenue: number;
  monthlyCount: number;
  totalRevenue: number;
  totalCount: number;
}

export default function PaymentDashboard() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (isLoading) {
    return <div className="text-outline text-center py-8 font-mono-label animate-pulse">LOADING PAYMENTS...</div>;
  }

  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/5 mb-12">
      <h2 className="font-h2 text-2xl mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">payments</span>
        Revenue & Payments
      </h2>

      {/* Revenue Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 rounded-xl p-6">
            <p className="font-mono-label text-outline text-xs mb-1">THIS WEEK</p>
            <h3 className="font-display-xl text-3xl text-secondary">${stats.weeklyRevenue}</h3>
            <p className="font-mono-label text-secondary/60 text-xs mt-1">{stats.weeklyCount} transactions</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
            <p className="font-mono-label text-outline text-xs mb-1">THIS MONTH</p>
            <h3 className="font-display-xl text-3xl text-primary">${stats.monthlyRevenue}</h3>
            <p className="font-mono-label text-primary/60 text-xs mt-1">{stats.monthlyCount} transactions</p>
          </div>
          <div className="bg-gradient-to-br from-error/10 to-transparent border border-error/20 rounded-xl p-6">
            <p className="font-mono-label text-outline text-xs mb-1">ALL TIME</p>
            <h3 className="font-display-xl text-3xl text-on-background">${stats.totalRevenue}</h3>
            <p className="font-mono-label text-outline text-xs mt-1">{stats.totalCount} transactions</p>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full min-w-[800px] text-left font-body-md text-on-surface-variant">
          <thead>
            <tr className="border-b border-outline-variant text-outline font-mono-label text-[10px]">
              <th className="pb-3 pr-3">TRANSACTION ID</th>
              <th className="pb-3 pr-3">USER</th>
              <th className="pb-3 pr-3">COURSE</th>
              <th className="pb-3 pr-3">MENTOR</th>
              <th className="pb-3 pr-3">AMOUNT</th>
              <th className="pb-3 pr-3">METHOD</th>
              <th className="pb-3 pr-3">STATUS</th>
              <th className="pb-3">DATE</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-outline">No payments recorded yet.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="border-b border-white/5 hover:bg-surface-container-high transition-colors">
                  <td className="py-3 pr-3 font-mono-label text-primary text-xs">{payment.transactionId}</td>
                  <td className="py-3 pr-3">
                    <div>
                      <p className="text-on-surface text-sm">{payment.userName}</p>
                      <p className="text-outline text-[10px]">{payment.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-sm">{payment.courseTitle}</td>
                  <td className="py-3 pr-3 text-sm">{payment.mentorName || "—"}</td>
                  <td className="py-3 pr-3 font-mono-label text-secondary">${payment.amount}</td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-0.5 bg-surface-container-highest rounded text-[10px] font-mono-label text-on-surface-variant uppercase">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-label ${
                      payment.status === "completed" ? "bg-secondary/20 text-secondary" :
                      payment.status === "pending" ? "bg-error/20 text-error" :
                      payment.status === "refunded" ? "bg-primary/20 text-primary" :
                      "bg-outline-variant text-outline"
                    }`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 font-mono-label text-outline text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
