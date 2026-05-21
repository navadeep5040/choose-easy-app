"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  role: "user" | "mentor" | "assistant";
  senderName?: string;
  content: string;
  timestamp: string;
}

interface BookingInfo {
  subject: string;
  scheduledDate: string;
  timeSlot: { startTime: string; endTime: string };
  mentorName: string;
  userName: string;
  status: string;
}

export default function MentorChatPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.chatSession.messages);
        setBookingInfo(data.booking);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load chat");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  // FIX: separate initial load from polling — session not in deps.
  // Polling interval is stable and cleaned up correctly.
  const sessionReady = !!session;
  useEffect(() => {
    if (!sessionReady) return;
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [sessionReady, fetchChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    const msg = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Optimistic update
    const tempMessage: Message = {
      role: (session?.user as any)?.role === "mentor" ? "mentor" : "user",
      senderName: (session?.user as any)?.name || (session?.user as any)?.email,
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/chat/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-on-surface-variant">Please sign in to access this chat.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
        <p className="font-mono-label text-outline mt-4 animate-pulse">LOADING CHAT SESSION...</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
        <p className="font-body-lg text-on-surface-variant mb-4">{error}</p>
        <Link href="/dashboard" className="text-primary hover:underline font-mono-label">← Back to Dashboard</Link>
      </div>
    );
  }  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 h-[calc(100vh-5.5rem)] md:h-[calc(100vh-7rem)] flex flex-col pt-3 md:pt-6">
      {/* Header */}
      <div className="glass-panel rounded-t-2xl border border-outline-variant p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/dashboard" className="text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-h2 text-sm sm:text-base text-on-background">
              {bookingInfo?.mentorName || "Chat Session"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[10px] mt-0.5">
              <span className="font-mono-label text-primary">{bookingInfo?.subject}</span>
              <span className="text-outline/40">•</span>
              <span className="font-mono-label text-on-surface-variant">
                {bookingInfo?.scheduledDate ? new Date(bookingInfo.scheduledDate).toLocaleDateString() : ""}
              </span>
              <span className="text-outline/40">•</span>
              <span className="font-mono-label text-secondary">
                {bookingInfo?.timeSlot?.startTime} - {bookingInfo?.timeSlot?.endTime}
              </span>
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 sm:py-1 rounded-full font-mono-label text-[9px] uppercase ${
          bookingInfo?.status === "Confirmed" ? "bg-secondary/20 text-secondary" :
          bookingInfo?.status === "Completed" ? "bg-primary/20 text-primary" :
          "bg-outline-variant text-outline"
        }`}>
          {bookingInfo?.status}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto border-x border-outline-variant bg-surface-container/30 p-3 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.map((msg, i) => {
          const isMyMessage =
            (msg.role === "user" && (session.user as any).role !== "mentor") ||
            (msg.role === "mentor" && (session.user as any).role === "mentor");
          const isSystemMessage = msg.role === "assistant";

          if (isSystemMessage) {
            return (
              <div key={i} className="flex justify-center my-2">
                <div className="max-w-md bg-surface-container/60 border border-outline-variant/30 rounded-xl px-4 py-2 text-center shadow-sm">
                  <p className="font-mono-label text-[9px] text-outline-variant uppercase tracking-widest mb-1">// SYSTEM_LOG</p>
                  <p className="font-body-md text-on-surface-variant text-xs">{msg.content}</p>
                  <p className="font-mono-label text-[8px] text-outline/40 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={`flex items-start gap-2.5 sm:gap-3.5 ${isMyMessage ? "flex-row-reverse" : "flex-row"} group`}>
              {/* Avatar */}
              {isMyMessage ? (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(138,235,255,0.15)] select-none">
                  <span className="font-mono-label text-[9px] text-primary font-bold">{getInitials(msg.senderName || (session.user as any).name || (session.user as any).email)}</span>
                </div>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/30 flex items-center justify-center shadow-[0_0_10px_rgba(78,222,163,0.15)] select-none">
                  <span className="font-mono-label text-[9px] text-secondary font-bold">{getInitials(msg.senderName)}</span>
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[80%] sm:max-w-[72%] rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-md transition-all duration-300 ${
                isMyMessage
                  ? "bg-gradient-to-br from-primary/15 to-primary/5 text-on-surface border border-primary/25 rounded-tr-none hover:border-primary/45 hover:shadow-primary/5"
                  : "bg-gradient-to-br from-surface-container-high/90 to-surface-container/60 text-on-surface-variant border border-white/5 rounded-tl-none hover:border-white/10"
              }`}>
                {!isMyMessage && msg.senderName && (
                  <p className="font-mono-label text-[9px] text-primary mb-1 uppercase tracking-wider">{msg.senderName}</p>
                )}
                <p className="font-body-md text-on-surface text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`font-mono-label text-[8px] mt-1.5 tracking-wider ${isMyMessage ? "text-primary/60 text-right" : "text-outline/60 text-left"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-panel p-2 sm:p-3 rounded-b-2xl border-t-0 flex gap-2 items-center bg-surface-container/40 backdrop-blur-xl relative z-10 focus-within:border-primary/40 focus-within:shadow-[0_0_15px_rgba(138,235,255,0.1)] transition-all duration-300">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type secure message..."
          className="flex-grow bg-surface-container-highest/20 border border-transparent focus:bg-transparent text-on-surface py-3 px-4 rounded-xl transition-all duration-300 font-body-md placeholder:text-outline/40 placeholder:font-mono-label placeholder:text-xs focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !inputMessage.trim()}
          className="bg-primary/10 text-primary border border-primary/30 py-3 px-4 sm:px-6 rounded-xl hover:bg-primary/20 hover:text-white hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 group shrink-0 font-mono-label uppercase text-xs"
        >
          <span className="hidden sm:block tracking-wider">Transmit</span>
          <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">send</span>
        </button>
      </div>
    </div>
  );
}
