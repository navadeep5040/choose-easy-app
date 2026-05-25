# 🌌 Choose Easy / MentorConnect AI

Choose Easy (also known as MentorConnect AI) is a premium AI-powered mentorship and career guidance SaaS platform designed to bridge the gap between students and industry mentors through intelligent guidance, personalized mentorship, and cloud-based learning workflows.

The platform combines:

* AI-powered career assistance
* Mentor-student interaction
* Booking and scheduling systems
* Payment management
* Role-based dashboards
* Real-time communication
* Cloud deployment infrastructure

with a futuristic glassmorphism-based SaaS user experience.

---

# 🚀 Core Features

## 🤖 AI Career Advisor — Oracle

Oracle is the integrated AI assistant of the platform.

### Oracle helps users with:

* Resume guidance
* Coding practice
* Career exploration
* Learning roadmaps
* Skill development
* AI-powered conversations
* Technical guidance
* Career recommendations

The assistant creates an intelligent and interactive mentorship ecosystem.

---

# 👨‍🏫 Mentor Discovery System

Students can:

* Browse verified mentors
* Explore mentor expertise
* View mentor profiles
* Check availability slots
* Compare mentor skills
* Access mentor ratings and details

### Mentor Expertise Areas

* MERN Stack
* Artificial Intelligence
* Machine Learning
* Data Structures
* Web Development
* Career Guidance
* Competitive Programming

---

# 📅 Mentor Booking & Scheduling System

The platform supports complete mentorship scheduling workflows.

### Booking Workflow

1. Student browses mentors
2. Student selects preferred mentor
3. Student chooses available time slot
4. Session booking is created
5. Mock payment process is completed
6. Mentor receives booking request
7. Mentor accepts or declines request
8. Session tracking is updated dynamically

### Booking Features

* Availability scheduling
* Session tracking
* Booking history
* Booking status updates
* Session completion workflow
* Dynamic mentor availability

---

# 💳 Payment Management System

Choose Easy includes a mock payment system for mentorship sessions and courses.

### Payment Features

* Secure mock payment flow
* Booking payment confirmation
* Transaction history
* Payment tracking
* Admin payment monitoring
* Session-payment linkage

The payment workflow simulates real SaaS mentorship monetization systems.

---

# 💬 Real-Time Mentor-Student Chat

The platform supports secure mentor-student communication.

### Chat Features

* Real-time messaging
* Responsive chat UI
* Conversation history
* System notifications
* Mentor-student interaction
* AI-integrated conversations

---

# 📚 Course Management System

Students can:

* Browse available courses
* Explore learning paths
* Access educational resources
* Track learning progress

Admins and mentors can:

* Manage courses
* Update course details
* Monitor learning activity

---

# 👥 Role-Based Access Control (RBAC)

The platform implements secure Role-Based Access Control using NextAuth.js.

---

# 🎓 Student Role

Students are the primary users of the platform.

### Students Can:

* Register and log in securely
* Browse mentors
* Book mentorship sessions
* Explore courses
* Access AI assistant
* Manage profile
* View bookings
* Track transactions
* Chat with mentors
* View learning pathways

### Students Cannot:

* Access mentor dashboard
* Access admin console
* Manage system-level data

---

# 👨‍🏫 Mentor Role

Mentors provide mentorship and guidance services.

### Mentors Can:

* Manage mentorship sessions
* Configure availability
* Accept/decline bookings
* Chat with students
* Update mentor profiles
* View session analytics
* Track earnings
* Monitor mentorship activities

### Mentors Cannot:

* Access admin management
* Modify global system settings
* Manage platform-wide users

---

# 🛡️ Admin Role

Admins have complete control over the platform.

### Admins Can:

* Manage users
* Manage mentors
* Approve mentor applications
* Manage courses
* Monitor bookings
* Track payments
* View platform analytics
* Maintain platform operations
* Monitor overall system health

### Admins Cannot:

* Access mentor-only workflows
* Book mentorship sessions as students

---

# 🔐 Authentication & Security

The platform uses NextAuth.js for secure authentication and authorization.

### Security Features

* Secure login system
* Protected routes
* JWT session handling
* Role-based route protection
* Session persistence
* MongoDB-backed authentication
* Secure API route protection
* Cloud session validation

---

# 🌐 Cloud Deployment & Infrastructure

## Production Deployment

* Frontend Hosting: Vercel
* Backend APIs: Next.js App Router
* Database: MongoDB Atlas
* Authentication: NextAuth.js

---

# ☁️ Cloud Features

* Production-ready deployment
* MongoDB Atlas cloud database
* Persistent user sessions
* Secure environment variable handling
* Cloud-based scalability
* Real-time database integration

---

# 🎨 Modern SaaS UI/UX

Choose Easy is designed using a premium futuristic SaaS interface.

### UI Highlights

* Glassmorphism effects
* Dark-mode interface
* Micro animations
* Responsive layouts
* Dynamic dashboards
* Modern typography
* Interactive transitions
* Mobile responsiveness

---

# 📱 Fully Responsive Design

The platform is optimized for:

* Desktop devices
* Tablets
* Mobile phones
* Wide-screen displays

---

# 🗂️ Database Architecture

## User Model

Stores:

* user credentials
* emails
* roles
* timestamps
* authentication metadata

---

## Mentor Model

Stores:

* mentor bio
* skills
* pricing
* expertise
* availability slots
* mentor statistics

---

## Booking Model

Stores:

* booking status
* session dates
* student-mentor mapping
* transaction references
* booking lifecycle data

---

## ChatSession Model

Stores:

* mentor-student chats
* AI conversations
* system logs
* message history

---

## Notification Model

Stores:

* alerts
* booking notifications
* dashboard notifications
* system activity updates

---

# 🔄 Complete Platform Workflow

```text
Student Registration/Login
        ↓
Browse Mentors & Courses
        ↓
Use Oracle AI Assistant
        ↓
Select Mentor & Time Slot
        ↓
Book Session & Make Payment
        ↓
Mentor Accepts Session
        ↓
Mentor-Student Chat Interaction
        ↓
Session Completion & Tracking
        ↓
Admin Monitoring & Analytics
```

---

# 🧪 Test Accounts

## 👨‍💼 Admin Account

Email: [admin@chooseeasy.ai](mailto:admin@chooseeasy.ai)
Password: Admin@123

---

## 👨‍🏫 Mentor Account

Email: [mentor@chooseeasy.ai](mailto:mentor@chooseeasy.ai)
Password: Mentor@123

---

## 🎓 Student Account

Email: [student@chooseeasy.ai](mailto:student@chooseeasy.ai)
Password: Student@123

---

# ⚙️ Environment Variables

Create `.env.local` file:

```env
MONGODB_URI=your_mongodb_atlas_uri
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

---

# 🛠️ Technology Stack

## Frontend

* Next.js 16
* React 19
* Tailwind CSS v4

## Backend

* Next.js API Routes
* MongoDB
* Mongoose

## Authentication

* NextAuth.js

## Deployment

* Vercel
* MongoDB Atlas

---

# 📦 Project Setup

## Install Dependencies

```bash
npm install
```

## Seed Database

```bash
node resetDB.mjs
```

## Run Development Server

```bash
npm run dev
```

## Build Production App

```bash
npm run build
```

---

# 📈 Future Enhancements

Future scope may include:

* Real payment gateway integration
* Video conferencing
* AI mentor matching
* Resume analyzer
* Mobile application
* Live notifications
* AI-generated learning paths
* Real-time collaborative learning
* Advanced analytics dashboard

---

# 🎯 Project Objective

The objective of Choose Easy / MentorConnect AI is to simplify mentorship, career guidance, and skill development using:

* Artificial Intelligence
* Cloud infrastructure
* Mentor-student collaboration
* Modern SaaS architecture
* Secure authentication systems
* Intelligent learning workflows

---

# ✅ Conclusion

Choose Easy / MentorConnect AI is a complete full-stack mentorship SaaS platform that combines:

* AI-powered assistance
* Mentor booking systems
* Role-based dashboards
* Cloud deployment
* Secure authentication
* Payment workflows
* Real-time communication
* Modern responsive UI

to create a scalable and intelligent mentorship ecosystem for students and professionals.
