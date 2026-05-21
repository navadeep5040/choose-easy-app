"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION_CHIPS = [
  { label: "Career in AI", query: "What are the best career paths in AI and Machine Learning?" },
  { label: "Resume Tips", query: "Give me tips for building a standout resume" },
  { label: "Interview Prep", query: "Help me prepare for a software engineering interview" },
  { label: "Learning Roadmap", query: "Create a learning roadmap for me" },
  { label: "Finance Careers", query: "What are the top career options in FinTech?" },
  { label: "Cloud Computing", query: "What skills do I need for cloud architecture?" },
];

function ChatbotContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const pathwayParam = searchParams.get("pathway");

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Greetings. I am your **AI Career Advisor** powered by advanced intelligence. I can help you with:\n\n🎯 Career Guidance\n📄 Resume Analysis\n🗣️ Interview Preparation\n🗺️ Learning Roadmaps\n\nHow may I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIX: use a boolean flag instead of the session object to avoid
  // re-loading history when next-auth internally re-emits the same session.
  const sessionReady = !!session;
  useEffect(() => {
    if (sessionReady && !historyLoaded) {
      loadHistory();
    }
  }, [sessionReady, historyLoaded]);

  useEffect(() => {
    if (pathwayParam) {
      setInput(`Please analyze the career pathway: ${pathwayParam}`);
    }
  }, [pathwayParam]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
          setMessages(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history");
    } finally {
      setHistoryLoaded(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "ERROR: Failed to connect to analysis engine. Please try again." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "CRITICAL ERROR: Connection lost." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Render markdown-like formatting (bold, bullet points, headers)
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface font-semibold">$1</strong>');
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="pl-4 py-1 flex items-start gap-2" dangerouslySetInnerHTML={{ __html: `<span class="text-primary mt-1 text-[10px]">■</span> <span>${formatted.substring(2)}</span>` }} />;
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return <p key={i} className="pl-4 py-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      // Empty lines
      if (!line.trim()) return <div key={i} className="h-3" />;
      // Normal text
      return <p key={i} className="py-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  const showSuggestions = messages.length <= 2 && !isLoading;

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : (session?.user?.email ? session.user.email.substring(0, 2).toUpperCase() : "US");

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 h-[calc(100vh-5.5rem)] md:h-[calc(100vh-7rem)] flex flex-col pt-3 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 border-b border-white/10 pb-3 gap-3">
        <div>
          <h1 className="font-h2 text-lg sm:text-xl text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl animate-pulse">psychology</span>
            CAREER_ORACLE_V4
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary emerald-glow animate-pulse"></span>
            <p className="font-mono-label text-[9px] text-outline tracking-widest uppercase">
              {process.env.NEXT_PUBLIC_OPENAI_MODE === 'true' ? 'OPENAI_CONNECTED' : 'LOCAL_INTELLIGENCE'} // SESSION_SECURE
            </p>
          </div>
        </div>
        <Link href="/dashboard" className="text-secondary hover:text-primary font-mono-label text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border border-secondary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group shrink-0">
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          DASHBOARD_TERM
        </Link>
      </div>

      <div className="flex-grow overflow-y-auto glass-panel p-3 sm:p-5 rounded-t-2xl border-b-0 space-y-5 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 sm:gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} group`}>
            {/* Avatar */}
            {msg.role === "assistant" ? (
              <div className="flex-shrink-0 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(138,235,255,0.15)] select-none">
                <span className="material-symbols-outlined text-primary text-base sm:text-lg">smart_toy</span>
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 border border-secondary/30 flex items-center justify-center shadow-[0_0_10px_rgba(78,222,163,0.15)] select-none">
                <span className="font-mono-label text-[9px] sm:text-[10px] text-secondary font-bold">{userInitials}</span>
              </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[80%] sm:max-w-[72%] rounded-2xl p-3.5 sm:p-4.5 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:shadow-xl ${
              msg.role === "user"
                ? "bg-gradient-to-br from-primary/15 to-primary/5 text-on-surface border border-primary/25 rounded-tr-none hover:border-primary/45 hover:shadow-primary/5"
                : "bg-gradient-to-br from-surface-container-high/90 to-surface-container/60 text-on-surface-variant border border-white/5 rounded-tl-none hover:border-white/10"
            }`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1.5">
                  <span className="font-mono-label text-[9px] text-primary tracking-wider">AI_ORACLE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary emerald-glow animate-pulse ml-auto" />
                </div>
              )}
              <div className="font-body-md leading-relaxed text-xs sm:text-sm">
                {formatContent(msg.content)}
              </div>
              <p className={`font-mono-label text-[8px] text-outline/40 mt-2 tracking-widest ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.role === "user" ? "TRANSMIT_OK" : "RESPONSE_COMPLETED"}
              </p>
            </div>
          </div>
        ))}

        {/* Suggestion Chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-2 px-1">
            <p className="w-full font-mono-label text-[9px] text-outline tracking-widest uppercase">Suggested Topics:</p>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => sendMessage(chip.query)}
                className="px-3.5 py-1.5 sm:py-2 bg-surface-container/40 border border-outline-variant/30 rounded-full text-on-surface-variant font-mono-label text-[10px] hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_8px_rgba(138,235,255,0.1)] cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="flex-shrink-0 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(138,235,255,0.15)]">
              <span className="material-symbols-outlined text-primary text-base sm:text-lg animate-spin">smart_toy</span>
            </div>
            <div className="bg-gradient-to-br from-surface-container-high/90 to-surface-container/60 border border-white/5 p-3.5 sm:p-4 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-md flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }}></span>
              </div>
              <span className="font-mono-label text-[9px] text-primary/70 tracking-widest animate-pulse ml-1 uppercase">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleFormSubmit} className="glass-panel p-2 sm:p-3 rounded-b-2xl border-t-0 flex gap-2 items-center bg-surface-container/40 backdrop-blur-xl relative z-10 focus-within:border-primary/40 focus-within:shadow-[0_0_15px_rgba(138,235,255,0.1)] transition-all duration-300">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about careers, resume tips, interview prep..."
          className="flex-grow bg-surface-container-highest/20 border border-transparent focus:bg-transparent text-on-surface py-3 px-4 rounded-xl transition-all duration-300 font-body-md placeholder:text-outline/40 placeholder:font-mono-label placeholder:text-xs focus:outline-none"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-primary/10 text-primary border border-primary/30 py-3 px-4 sm:px-6 rounded-xl hover:bg-primary/20 hover:text-white hover:shadow-[0_0_15px_rgba(47,217,244,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 group shrink-0"
        >
          <span className="font-mono-label uppercase hidden sm:block tracking-wider text-xs">Transmit</span>
          <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">send</span>
        </button>
      </form>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
        <p className="font-mono-label text-outline mt-4">INITIALIZING AI ENGINE...</p>
      </div>
    }>
      <ChatbotContent />
    </Suspense>
  );
}
