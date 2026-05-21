import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';

// Context-aware AI response system with OpenAI fallback
const TOPIC_RESPONSES: Record<string, string[]> = {
  tech: [
    "Based on your interest in technology, here's what I recommend:\n\n**Top Career Paths:**\n• Full-Stack Engineer (avg $120k) — React, Node.js, AWS\n• AI/ML Engineer (avg $140k) — Python, TensorFlow, PyTorch\n• Cloud Architect (avg $150k) — AWS, Azure, Kubernetes\n• DevOps Engineer (avg $130k) — Docker, CI/CD, Terraform\n\nWould you like a detailed learning roadmap for any of these?",
    "The tech industry is evolving rapidly. Here are the **highest-growth areas** for 2026:\n\n1. **AI Safety & Alignment** — Critical as AI scales\n2. **Edge Computing** — IoT and real-time processing\n3. **Quantum Computing** — Early but transformative\n4. **Cybersecurity** — Always in demand\n\nI can create a personalized study plan based on your current skills. What's your background?",
  ],
  finance: [
    "The financial sector offers incredible opportunities:\n\n**High-Growth Finance Roles:**\n• Quantitative Analyst (avg $160k) — Python, R, Statistics\n• FinTech Product Manager (avg $140k) — Agile, API design\n• Blockchain Finance Specialist (avg $130k) — DeFi, Smart Contracts\n• Risk Management Analyst (avg $110k) — Basel III, VaR models\n\n**Certifications to consider:** CFA, FRM, or CPA depending on your path.\n\nWhat aspect of finance interests you most?",
    "FinTech is disrupting traditional banking. Key areas to focus on:\n\n1. **Digital Payments** — UPI, BNPL, cryptocurrency\n2. **RegTech** — Compliance automation\n3. **InsurTech** — AI-driven underwriting\n4. **DeFi** — Decentralized lending and trading\n\nShall I outline the technical skills needed for any of these?",
  ],
  healthcare: [
    "Healthcare technology is booming! Here are promising career paths:\n\n**Healthcare Tech Roles:**\n• Health Data Scientist (avg $120k) — EHR analysis, predictive models\n• Clinical Informatics Specialist (avg $100k) — HIPAA, HL7/FHIR\n• Biotech Software Engineer (avg $130k) — Genomics, lab automation\n• Telemedicine Platform Developer (avg $115k)\n\n**Key Skills:** Python, SQL, HIPAA compliance, clinical workflows\n\nWould you like specific learning resources?",
  ],
  resume: [
    "Here are my top tips for a **standout resume**:\n\n✅ **Structure:**\n• Use reverse-chronological format\n• Keep it to 1-2 pages maximum\n• Include a professional summary (3-4 lines)\n\n✅ **Content:**\n• Quantify achievements (\"Increased sales by 40%\")\n• Use action verbs (Led, Built, Optimized, Reduced)\n• Tailor keywords to each job description\n\n✅ **Common Mistakes:**\n• ❌ Generic objective statements\n• ❌ Including references on the resume\n• ❌ Using unprofessional email addresses\n\nWant me to review specific sections of your resume?",
  ],
  interview: [
    "Here's a comprehensive **interview preparation guide**:\n\n🎯 **Technical Interviews:**\n• Practice 2-3 LeetCode problems daily\n• Focus on Data Structures: Arrays, Trees, Graphs, HashMaps\n• System Design: Learn CAP theorem, load balancing, caching\n\n🎯 **Behavioral Interviews (STAR Method):**\n• **S**ituation — Set the context\n• **T**ask — Describe your responsibility\n• **A**ction — Explain what you did\n• **R**esult — Share the outcome with metrics\n\n🎯 **Company Research:**\n• Study their products, culture, and recent news\n• Prepare 3-5 thoughtful questions for the interviewer\n\nWhich type of interview are you preparing for?",
  ],
  roadmap: [
    "I'll create a **personalized learning roadmap** for you. To make it specific, tell me:\n\n1. **Current Role/Education** — Where are you starting from?\n2. **Target Role** — What do you want to become?\n3. **Timeline** — How many months/years do you have?\n4. **Time Commitment** — Hours per week you can dedicate?\n\nOnce I have these details, I'll create a week-by-week study plan with specific resources, projects, and milestones.",
  ],
  default: [
    "I'm your AI Career Advisor! I can help with:\n\n🎯 **Career Guidance** — Explore paths in Tech, Finance, Healthcare, Design\n📄 **Resume Tips** — Structure, content, and common mistakes\n🗣️ **Interview Prep** — Technical and behavioral preparation\n🗺️ **Learning Roadmaps** — Personalized study plans\n💡 **Skill Analysis** — Identify gaps and growth areas\n\nTry asking me things like:\n• \"What are the best career paths in AI?\"\n• \"Help me prepare for a software engineer interview\"\n• \"Create a learning roadmap for cloud computing\"\n• \"Review my resume format\"\n\nWhat would you like to explore?",
  ],
};

function detectTopic(message: string): string {
  const lower = message.toLowerCase();
  if (/tech|software|code|programming|develop|engineer|ai |machine learning|web dev|full.?stack|frontend|backend|devops|cloud|data sci/.test(lower)) return 'tech';
  if (/finance|bank|fintech|invest|trading|accounting|crypto|defi|money|stock/.test(lower)) return 'finance';
  if (/health|medical|clinic|hospital|pharma|biotech|nursing|doctor/.test(lower)) return 'healthcare';
  if (/resume|cv|cover letter|portfolio|linkedin/.test(lower)) return 'resume';
  if (/interview|prepare|behavioral|leetcode|system design|whiteboard/.test(lower)) return 'interview';
  if (/roadmap|learning path|study plan|career path|what should i learn|guide me/.test(lower)) return 'roadmap';
  return 'default';
}

function getSmartResponse(message: string, conversationHistory: { role: string; content: string }[]): string {
  const topic = detectTopic(message);
  const responses = TOPIC_RESPONSES[topic] || TOPIC_RESPONSES.default;
  
  // Pick a response we haven't used recently
  const recentResponses = conversationHistory
    .filter(m => m.role === 'assistant')
    .slice(-3)
    .map(m => m.content);
  
  const unused = responses.filter(r => !recentResponses.includes(r));
  const pool = unused.length > 0 ? unused : responses;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find or create AI chat session for this user
    let chatSession = await ChatSession.findOne({ 
      userId: (session.user as any).id,
      type: 'ai' 
    }).sort({ updatedAt: -1 });
    
    if (!chatSession) {
      chatSession = new ChatSession({
        userId: (session.user as any).id,
        type: 'ai',
        title: 'Career Exploration',
        messages: []
      });
    }

    // Add user message to DB
    chatSession.messages.push({ role: 'user', content: message, timestamp: new Date() });

    let reply: string;

    // Try OpenAI if API key is configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      try {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert AI career advisor on the Choose Easy platform. You help users with career guidance, resume tips, interview preparation, learning roadmaps, and skill analysis. Be specific, actionable, and professional. Use markdown formatting for better readability.'
              },
              ...chatSession.messages.slice(-10).map((m: any) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
              })),
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          reply = openaiData.choices?.[0]?.message?.content || getSmartResponse(message, chatSession.messages);
        } else {
          // Fallback to smart mock
          reply = getSmartResponse(message, chatSession.messages);
        }
      } catch (err) {
        // OpenAI call failed, use smart mock
        reply = getSmartResponse(message, chatSession.messages);
      }
    } else {
      // No API key — use enhanced mock responses
      reply = getSmartResponse(message, chatSession.messages);
    }

    // Simulate processing delay for mock responses
    if (!openaiKey) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Save AI response to DB
    chatSession.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
    await chatSession.save();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Fetch chat history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const chatSession = await ChatSession.findOne({
      userId: (session.user as any).id,
      type: 'ai',
    }).sort({ updatedAt: -1 });

    if (!chatSession) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      messages: chatSession.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    });
  } catch (error) {
    console.error('Chat History Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
