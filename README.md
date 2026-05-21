# Choose Easy / MentorConnect AI

Choose Easy (also known as MentorConnect AI) is a premium, futuristic dark-mode mentorship SaaS platform. It leverages an AI career advisor (Oracle) and facilitates live 1:1 expert mentor-student session scheduling, messaging, and system management.

## 🚀 Key Features

- **AI Career Advisor (Oracle):** An context-aware conversational AI assistant for resumes, learning roadmaps, coding practice, and career exploration.
- **1:1 Mentor-Student Chat:** Secure, styled real-time message streams with status system logs and dynamic responsive scaling.
- **Booking & Availability Scheduling:** Mentors configure weekly slots; students browse verified experts, schedule times, make secure mock payments, and track sessions.
- **Role-Based Dashboards:**
  - **Admin Console:** High-level metrics tracking, payment monitoring, user table control, and mentor application approvals.
  - **Mentor Workspace:** Availability management, booking actions (accept/decline/complete), stats, and earnings breakdown.
  - **Student Portal:** Session requests, ratings, transaction history, pathway explorer, and Oracle chatbot.
- **Modern Responsive Design:** A fully glassmorphic dashboard styled using Tailwind CSS v4 with micro-animations and glowing indicators.

---

## 🛠️ Technology Stack

- **Core Framework:** Next.js 16.2 (App Router) & React 19
- **Styling:** Tailwind CSS v4 & PostCSS
- **Database:** MongoDB & Mongoose
- **Authentication:** NextAuth.js
- **Icons & Graphics:** Google Material Symbols

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory (based on `.env.example`):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/choose-easy
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Seeding & Reset
To populate the database with mock mentors, students, bookings, and admin users:
```bash
node resetDB.mjs
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the landing hub.

### 4. Build and Compile
```bash
npm run build
```

---

## 🗂️ Database Schema Architecture

- **User Model:** Stores credentials, names, emails, roles (`user`, `mentor`, `admin`, `pending_mentor`), and timestamp meta.
- **Mentor Model:** References `userId` and maps bio, profile details, hourly rates, skills, and weekly availability slots.
- **Booking Model:** Logs scheduling states (`Pending`, `Confirmed`, `Completed`, `Cancelled`), dates, time slots, and associations between students and mentors.
- **ChatSession Model:** Holds conversation arrays for system logs, chatbot history, and mentor chats.
- **Notification Model:** Handles real-time system alerts and bell indicator state.
