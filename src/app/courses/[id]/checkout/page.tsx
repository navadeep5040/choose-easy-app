"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MentorBrief {
  _id: string;
  name: string;
  image: string;
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
  mentors: MentorBrief[];
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [selectedMentorName, setSelectedMentorName] = useState("");

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; transactionId?: string; message?: string } | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        if (data.mentors?.length > 0) {
          setSelectedMentorId(data.mentors[0]._id);
          setSelectedMentorName(data.mentors[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch course");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").substring(0, 16);
    return v.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2);
    return v;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!course) return;

    setIsProcessing(true);
    setPaymentResult(null);

    // Simulate processing animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course._id,
          courseTitle: course.title,
          mentorId: selectedMentorId || null,
          mentorName: selectedMentorName || "",
          amount: course.price,
          paymentMethod,
          cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentResult({ success: true, transactionId: data.transactionId });
      } else {
        const data = await res.json();
        setPaymentResult({ success: false, message: data.error || "Payment failed" });
      }
    } catch (err) {
      setPaymentResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
        <p className="font-mono-label text-outline mt-4 animate-pulse">LOADING CHECKOUT...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
        <p className="font-body-lg text-on-surface-variant mb-4">Course not found</p>
        <Link href="/courses" className="text-primary hover:underline font-mono-label">← Back to Courses</Link>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;

  if (userRole === "admin" || userRole === "mentor") {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-20">
        <div className={`glass-panel p-12 rounded-2xl border ${userRole === "admin" ? "border-error/30" : "border-secondary/30"} text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className={`w-24 h-24 mx-auto mb-6 ${userRole === "admin" ? "bg-error/20 border-error/30" : "bg-secondary/20 border-secondary/30"} rounded-full flex items-center justify-center border`}>
              <span className={`material-symbols-outlined text-5xl ${userRole === "admin" ? "text-error" : "text-secondary"}`}>block</span>
            </div>
            <h1 className={`font-h1 text-h1 ${userRole === "admin" ? "text-error" : "text-secondary"} mb-4`}>ACCESS DENIED // STUDENT ONLY</h1>
            <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
              As an {userRole === "admin" ? "Administrator" : "Mentor"} account, you are restricted from enrolling in courses. This checkout form is reserved for student accounts only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {userRole === "admin" ? (
                <>
                  <Link
                    href="/admin?tab=courses"
                    className="px-6 py-3 bg-error text-surface font-mono-label rounded-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all uppercase text-xs font-bold text-center"
                  >
                    Manage Courses
                  </Link>
                  <Link
                    href="/admin"
                    className="px-6 py-3 border border-error/30 text-error font-mono-label rounded-lg hover:bg-error/10 transition-all uppercase text-xs font-bold text-center"
                  >
                    Open Admin Panel
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/mentor-dashboard?tab=bookings"
                    className="px-6 py-3 bg-secondary text-surface font-mono-label rounded-lg hover:shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all uppercase text-xs font-bold text-center"
                  >
                    View Sessions
                  </Link>
                  <Link
                    href="/mentor-dashboard?tab=profile"
                    className="px-6 py-3 border border-secondary/30 text-secondary font-mono-label rounded-lg hover:bg-secondary/10 transition-all uppercase text-xs font-bold text-center"
                  >
                    Edit Profile
                  </Link>
                </>
              )}
              <Link
                href="/courses"
                className="px-6 py-3 border border-outline-variant text-on-surface-variant font-mono-label rounded-lg hover:border-primary/50 transition-all uppercase text-xs text-center"
              >
                Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (paymentResult?.success) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-20">
        <div className="glass-panel p-12 rounded-2xl border border-secondary/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary/20 rounded-full flex items-center justify-center border border-secondary/30">
              <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-h1 text-h1 text-secondary mb-4">PAYMENT SUCCESSFUL</h1>
            <p className="font-body-lg text-on-surface-variant mb-6">You are now enrolled in <strong className="text-on-surface">{course.title}</strong></p>
            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30 mb-8 inline-block">
              <div className="grid grid-cols-2 gap-4 text-sm text-left">
                <div>
                  <p className="font-mono-label text-outline text-xs">TRANSACTION ID</p>
                  <p className="font-mono-label text-primary">{paymentResult.transactionId}</p>
                </div>
                <div>
                  <p className="font-mono-label text-outline text-xs">AMOUNT PAID</p>
                  <p className="font-mono-label text-secondary">${course.price} USD</p>
                </div>
                <div>
                  <p className="font-mono-label text-outline text-xs">COURSE</p>
                  <p className="font-body-md text-on-surface">{course.title}</p>
                </div>
                <div>
                  <p className="font-mono-label text-outline text-xs">MENTOR</p>
                  <p className="font-body-md text-on-surface">{selectedMentorName || "Any available"}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard" className="px-8 py-3 bg-primary text-surface font-mono-label rounded-lg hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] transition-all uppercase text-sm">
                Go to Dashboard
              </Link>
              <Link href="/courses" className="px-8 py-3 border border-outline-variant text-on-surface-variant font-mono-label rounded-lg hover:border-primary/50 transition-all uppercase text-sm">
                Browse More
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <Link href="/courses" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-mono-label text-sm mb-8 transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        BACK TO COURSES
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Order Summary (Left) */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 rounded-2xl border border-primary/20 sticky top-24">
            <h2 className="font-mono-label text-outline text-xs uppercase mb-6">Order Summary</h2>

            <div className="mb-6">
              <h3 className="font-h2 text-xl text-on-background mb-2">{course.title}</h3>
              <p className="font-body-md text-on-surface-variant text-sm mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full font-mono-label text-[10px] text-primary">{course.subject}</span>
                <span className="px-2.5 py-1 bg-surface-container-highest rounded-full font-mono-label text-[10px] text-on-surface-variant">{course.level}</span>
                <span className="px-2.5 py-1 bg-surface-container-highest rounded-full font-mono-label text-[10px] text-on-surface-variant">{course.duration}</span>
              </div>
            </div>

            {/* Select Mentor */}
            {course.mentors?.length > 0 && (
              <div className="mb-6">
                <p className="font-mono-label text-outline text-xs uppercase mb-3">Choose Your Mentor</p>
                <div className="space-y-2">
                  {course.mentors.map((mentor) => (
                    <button
                      key={mentor._id}
                      onClick={() => { setSelectedMentorId(mentor._id); setSelectedMentorName(mentor.name); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedMentorId === mentor._id
                          ? "border-primary bg-primary/5 shadow-[0_0_10px_rgba(47,217,244,0.15)]"
                          : "border-outline-variant hover:border-primary/30 bg-surface-container"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center border border-outline-variant">
                        <img 
                          src={mentor.image || "/placeholders/mentor.png"} 
                          alt={mentor.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = "/placeholders/mentor.png";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-body-md text-on-surface text-sm font-medium">{mentor.name}</p>
                        <p className="font-mono-label text-outline text-[10px]">{mentor.domain}</p>
                      </div>
                      {selectedMentorId === mentor._id && (
                        <span className="material-symbols-outlined text-primary text-[18px]">radio_button_checked</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-outline-variant/30 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-body-md text-on-surface-variant">Course Fee</span>
                <span className="font-mono-label text-on-surface">${course.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-body-md text-on-surface-variant">Platform Fee</span>
                <span className="font-mono-label text-secondary">$0.00</span>
              </div>
              <div className="flex justify-between text-sm border-t border-outline-variant/30 pt-2 mt-2">
                <span className="font-body-md text-on-surface font-medium">Total</span>
                <span className="font-display-xl text-xl text-primary">${course.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form (Right) */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-8 rounded-2xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <div>
                <h2 className="font-h2 text-xl text-on-background">Secure Payment</h2>
                <p className="font-mono-label text-outline text-[10px] uppercase">256-BIT ENCRYPTED</p>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { id: "card" as const, label: "Credit Card", icon: "credit_card" },
                { id: "upi" as const, label: "UPI", icon: "qr_code_2" },
                { id: "netbanking" as const, label: "Net Banking", icon: "account_balance" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-mono-label text-xs uppercase transition-all ${
                    paymentMethod === method.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-transparent border-outline-variant text-outline hover:border-primary/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{method.icon}</span>
                  {method.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {paymentMethod === "card" && (
                <>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-2">CARDHOLDER NAME</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-12 pr-4 text-on-surface font-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono-label text-outline text-xs block mb-2">CARD NUMBER</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">credit_card</span>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-12 pr-4 text-on-surface font-mono-label focus:outline-none focus:border-primary transition-colors placeholder:text-outline/30 tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono-label text-outline text-xs block mb-2">EXPIRY DATE</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-4 text-on-surface font-mono-label focus:outline-none focus:border-primary transition-colors placeholder:text-outline/30 text-center tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="font-mono-label text-outline text-xs block mb-2">CVV</label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-4 text-on-surface font-mono-label focus:outline-none focus:border-primary transition-colors placeholder:text-outline/30 text-center tracking-widest"
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "upi" && (
                <div>
                  <label className="font-mono-label text-outline text-xs block mb-2">UPI ID</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">alternate_email</span>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 pl-12 pr-4 text-on-surface font-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-outline/30"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div>
                  <label className="font-mono-label text-outline text-xs block mb-2">SELECT BANK</label>
                  <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-4 px-4 text-on-surface font-body-md focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {paymentResult && !paymentResult.success && (
                <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error font-mono-label text-sm text-center">
                  {paymentResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-primary text-surface font-mono-label py-4 rounded-xl hover:shadow-[0_0_25px_rgba(47,217,244,0.4)] transition-all uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    PROCESSING PAYMENT...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    PAY ${course.price} SECURELY
                  </span>
                )}
              </button>

              <div className="flex justify-center gap-6 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-outline text-[14px]">verified_user</span>
                  <span className="font-mono-label text-[9px] text-outline uppercase">SSL Secured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-outline text-[14px]">shield</span>
                  <span className="font-mono-label text-[9px] text-outline uppercase">PCI Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-outline text-[14px]">lock</span>
                  <span className="font-mono-label text-[9px] text-outline uppercase">256-Bit Encrypted</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
