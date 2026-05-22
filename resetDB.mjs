import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Schema Definitions (inline to avoid TS import issues) ---

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin', 'mentor', 'pending_mentor'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const AvailabilitySlotSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const MentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  subjects: [{ type: String }],
  domain: { type: String, required: true },
  matchScore: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Busy', 'Offline'], default: 'Available' },
  availability: [AvailabilitySlotSchema],
  hourlyRate: { type: Number, default: 0 },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  mentorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }],
  features: [{ type: String }],
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Mentor = mongoose.models.Mentor || mongoose.model('Mentor', MentorSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

// --- Seed Data ---

const ADMIN_PASSWORD = 'admin123';
const MENTOR_PASSWORD = 'mentor123';

const MENTORS_DATA = [
  {
    email: 'elias@chooseeasy.com',
    name: 'Elias Thorne',
    bio: 'Lead Cryptographic Architect with 12+ years in blockchain security and zero-knowledge proofs.',
    subjects: ['Technology', 'Finance'],
    domain: 'Blockchain & Cryptography',
    matchScore: '98%',
    status: 'Available',
    hourlyRate: 75,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfDXuUeWOjGgcWW0oayjouzSGf4s_nP_DrCHDBWKKtiWtfOgHY_vfdy_gkaMYfWz_R7bDb0NPIi-kl48UhLBEbrlcaOdSmTHwHink0Tp79rST9Jl59zK1ZzDCIKggUx6GPYCxEGbot3ogez-yRqmBMOxOQLNR-FReC4DUwg6L57hfNk7eoqiOQf6EElTWV1BO763i2SLqz_3U8onqMPEnBoU48ZlmXl6gft2uvtxiHYaDfdH5UFBW9A1btnQpI_9CwhkRSLSimitk',
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '12:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
      { day: 'Friday', startTime: '09:00', endTime: '11:00' },
    ],
  },
  {
    email: 'sarah@chooseeasy.com',
    name: 'Sarah K. Vance',
    bio: 'AI Safety Specialist focused on neural alignment and responsible AI deployment.',
    subjects: ['Technology', 'Healthcare'],
    domain: 'AI & Machine Learning',
    matchScore: '95%',
    status: 'Available',
    hourlyRate: 60,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTNqAD1MfR5-BlRFrNni7hp3_hW-BHLKyDrejzDN5mIjK6mid6w7UMmaYLEeHuP45RsqWR53jMe5oZkLaddAzJi0ct1j75xMV2C5JPYAhCDCd1hd2y5eJ0NQqv6781swV3vRpTv0WaY86DQ1BicN58iopEq2EO2NmNAUMwY-mM6L4uvM3nnxX07CtracYYtyjCSwnn0xUow9VH8upaIQAqPV9hkx-ri_sI_7NiXYvc96boLmIF8m3fWaXRYrkT3MQPVStfCuA3WAY',
    availability: [
      { day: 'Tuesday', startTime: '11:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '15:00', endTime: '17:00' },
    ],
  },
  {
    email: 'marcus@chooseeasy.com',
    name: 'Marcus Chen',
    bio: 'Distributed Systems Guru with 15+ years building cloud infrastructure at scale.',
    subjects: ['Technology', 'Design'],
    domain: 'Cloud & DevOps',
    matchScore: '97%',
    status: 'Available',
    hourlyRate: 80,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyHGuYk2u2ryQL4FwbYxeUQpFP50TR7VHS_rHBPTHH04KoF6Ut-1qRDzd7EznYy5KinsckJymctWjCn6yA16HR2Obw7RuUnYN85dkBTMNbYOsvT6mVa1ruN15oFUPsoOzDRPwb8vWkUg0iNS5-MpUgfeUQxQNKNpYpfbjCb7t0sR3EkVAtjdBXXN4oeS3j6NeOeVpjZ6Lpw6jb9IhBgZbdFt4UVBt7WGS5Pw2yB0xFEYOKE2R8dDDLtBFTN4o3-VTRGdO6_H6KUpA',
    availability: [
      { day: 'Monday', startTime: '14:00', endTime: '16:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '12:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
    ],
  },
  {
    email: 'elena@chooseeasy.com',
    name: 'Dr. Elena Rossi',
    bio: 'Cyber Resilience Lead specializing in red teaming and penetration testing. CISSP, CEH certified.',
    subjects: ['Technology', 'Legal'],
    domain: 'Cybersecurity',
    matchScore: '96%',
    status: 'Available',
    hourlyRate: 70,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvlJqFZ0qft_xivtjePQ8pP3F4nxllrkbL0Dl8evJM161_kj_x9QJg6x7fB0BY6kFYj9-gCnF8lC0Y8C1QIoAyCAQUmyoaRyFxaZ5G_648QplUNNJ0sLLRVtlDu6zqrOM4Nx4ir1BAkhsvNSLTMQzwDnEBOvcD9pnWVQdVcOh9nqcOlm0dAXPU1NWR2kjsvlq4KMlSDNTTsdAXb00c79P3LA4ad9u9mY0GQbTe-tHVqTKLXjNl0WDUNbagTRD-zP42OKFzhRDr2bY',
    availability: [
      { day: 'Tuesday', startTime: '09:00', endTime: '11:00' },
      { day: 'Thursday', startTime: '13:00', endTime: '15:00' },
      { day: 'Friday', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    email: 'jaxon@chooseeasy.com',
    name: 'Jaxon Reed',
    bio: 'Cloud Infrastructure Director managing hybrid AWS/Azure environments.',
    subjects: ['Technology', 'Finance'],
    domain: 'Cloud Infrastructure',
    matchScore: '91%',
    status: 'Busy',
    hourlyRate: 65,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASeCCbRoOtxwKvLwXPgVZCqhgRY_coXrD5V0aiZE-eLWOr1gflP3wTa_xI4EQNfRcfOuk-SGLq_uee9UuK9N2GNcTz64t0jnZNv8wUhv4pyOVIPcBodEMQUEietR1LXH1__aRE4UVg5Wl6J2AyF2-8cKGJcHqOiyZFW3F9xPjtf_JP7QgORzVQLDf6qUXNsz5pAe5il9L2340HapHKoLmOuVy1S_NzUMcACvu2bWuWj_VW_0YNnJNko9-l-WfK3RKEMRuKgP-YIWk',
    availability: [
      { day: 'Wednesday', startTime: '16:00', endTime: '18:00' },
      { day: 'Saturday', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    email: 'aria@chooseeasy.com',
    name: 'Aria Novak',
    bio: 'Full-Stack Web3 Engineer bridging Solidity and React. Active open-source contributor.',
    subjects: ['Technology', 'Design', 'Marketing'],
    domain: 'Web3 & Full-Stack',
    matchScore: '93%',
    status: 'Available',
    hourlyRate: 55,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9rUh_PxfhewDo66-IwyZ9y-ku3vc5Cn-h3HxD304a0L6rEypitGCsIgxnY11dAG533vWYf6Jk0PIUirRz4cb7eWmcojy1tYkOgbs9-Io6Q_YpgavbCQvfnx-4OUJcSiTXJjZFR1i2iSiCsJSr3xz69Q7TqngqcoMA5KH4b9EzOF6WVqxQou9zGZrs5h2ypB9gBmRJAGVPgKsEm0AzgEYYny1aDAAffBMqppu6INM4dRbRuELK8kzWGr1PoRlg73UmMrR0c8a7c6A',
    availability: [
      { day: 'Monday', startTime: '16:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '14:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '12:00' },
    ],
  },
];

const COURSES_DATA = [
  {
    title: 'Blockchain Fundamentals & Smart Contracts',
    description: 'Master the core concepts of blockchain technology, smart contract development with Solidity, and decentralized application architecture.',
    subject: 'Technology', price: 199, duration: '8 Weeks', level: 'Intermediate',
    mentorNames: ['Elias Thorne', 'Aria Novak'],
    features: ['Hands-on Solidity coding labs', 'Deploy your own DApp', 'Security audit workshop', '1-on-1 mentor review sessions'],
  },
  {
    title: 'AI & Machine Learning Masterclass',
    description: 'From neural networks to transformer architectures — build production-grade ML models and understand AI safety best practices.',
    subject: 'Technology', price: 249, duration: '10 Weeks', level: 'Advanced',
    mentorNames: ['Sarah K. Vance'],
    features: ['Real-world dataset projects', 'Model deployment on AWS', 'NeurIPS paper reviews', 'AI ethics & safety modules'],
  },
  {
    title: 'Cloud Architecture & DevOps Bootcamp',
    description: 'Design scalable cloud-native systems with AWS, Kubernetes, and CI/CD pipelines. Learn infrastructure-as-code with Terraform.',
    subject: 'Technology', price: 179, duration: '6 Weeks', level: 'Intermediate',
    mentorNames: ['Marcus Chen', 'Jaxon Reed'],
    features: ['Multi-cloud deployment labs', 'Kubernetes cluster management', 'CI/CD pipeline design', 'Cost optimization strategies'],
  },
  {
    title: 'Cybersecurity & Ethical Hacking',
    description: 'Learn penetration testing, red teaming, and cyber defense strategies. Prepare for CISSP and CEH certifications.',
    subject: 'Technology', price: 229, duration: '8 Weeks', level: 'Advanced',
    mentorNames: ['Dr. Elena Rossi'],
    features: ['Live penetration testing labs', 'CISSP exam prep modules', 'Incident response simulations', 'Network forensics toolkit'],
  },
  {
    title: 'FinTech & Digital Banking',
    description: 'Understand the intersection of finance and technology. Build payment systems, explore DeFi protocols, and learn regulatory compliance.',
    subject: 'Finance', price: 159, duration: '6 Weeks', level: 'Beginner',
    mentorNames: ['Elias Thorne', 'Jaxon Reed'],
    features: ['Payment gateway integration', 'DeFi protocol deep-dives', 'Regulatory compliance overview', 'Financial modeling workshops'],
  },
  {
    title: 'Healthcare Data Analytics',
    description: 'Apply data science and ML techniques to healthcare challenges. Work with clinical datasets, EHR systems, and predictive diagnostics.',
    subject: 'Healthcare', price: 189, duration: '7 Weeks', level: 'Intermediate',
    mentorNames: ['Sarah K. Vance'],
    features: ['Clinical dataset analysis', 'HIPAA compliance training', 'Predictive health models', 'EHR system integration'],
  },
  {
    title: 'UX/UI Design for Tech Products',
    description: 'Master user experience research, interface design principles, and prototyping tools. Build portfolio-ready design projects.',
    subject: 'Design', price: 139, duration: '5 Weeks', level: 'Beginner',
    mentorNames: ['Marcus Chen', 'Aria Novak'],
    features: ['Figma & design system labs', 'User research methodologies', 'Accessibility best practices', 'Portfolio review sessions'],
  },
  {
    title: 'Digital Marketing & Growth Hacking',
    description: 'Learn data-driven marketing strategies, SEO, social media optimization, and growth hacking techniques for tech startups.',
    subject: 'Marketing', price: 119, duration: '4 Weeks', level: 'Beginner',
    mentorNames: ['Aria Novak'],
    features: ['SEO & SEM deep-dive', 'Social media campaign design', 'Analytics dashboard setup', 'Growth experiment frameworks'],
  },
];

async function resetAndSeed() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env.local');
    process.exit(1);
  }

  try {
    console.log(`Connecting to database at ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected.');

    // Step 1: Drop all collections
    console.log('\n--- STEP 1: Dropping all collections ---');
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`  Dropped: ${collection.collectionName}`);
    }

    // Step 2: Create Admin user
    console.log('\n--- STEP 2: Creating Admin user ---');
    const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ email: 'admin@chooseeasy.com', password: adminHashedPassword, name: 'System Admin', role: 'admin' });
    const reqAdminHashed = await bcrypt.hash('Admin@123', 10);
    await User.create({ email: 'admin@chooseeasy.ai', password: reqAdminHashed, name: 'Alex Morgan', role: 'admin' });
    console.log(`  Admin created: admin@chooseeasy.com / ${ADMIN_PASSWORD}`);
    console.log(`  Required Admin created: admin@chooseeasy.ai / Admin@123`);

    // Step 3: Create Mentor users + Mentor profiles
    console.log('\n--- STEP 3: Creating Mentors ---');
    const mentorHashedPassword = await bcrypt.hash(MENTOR_PASSWORD, 10);
    const createdMentors = {};

    // Seed the required test mentor first
    const reqMentorHashed = await bcrypt.hash('Mentor@123', 10);
    const reqMentorUser = await User.create({ email: 'mentor@chooseeasy.ai', password: reqMentorHashed, name: 'Sarah Johnson', role: 'mentor' });
    const reqMentorProfile = await Mentor.create({
      userId: reqMentorUser._id,
      name: 'Sarah Johnson',
      bio: 'Expert AI and Software Engineering mentor with a track record of guiding students to high-paying careers.',
      subjects: ['Technology'],
      domain: 'Software Engineering',
      matchScore: '99%',
      status: 'Available',
      availability: [
        { day: 'Monday', startTime: '09:00', endTime: '11:00' },
        { day: 'Wednesday', startTime: '13:00', endTime: '15:00' },
        { day: 'Friday', startTime: '15:00', endTime: '17:00' }
      ],
      hourlyRate: 50,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTNqAD1MfR5-BlRFrNni7hp3_hW-BHLKyDrejzDN5mIjK6mid6w7UMmaYLEeHuP45RsqWR53jMe5oZkLaddAzJi0ct1j75xMV2C5JPYAhCDCd1hd2y5eJ0NQqv6781swV3vRpTv0WaY86DQ1BicN58iopEq2EO2NmNAUMwY-mM6L4uvM3nnxX07CtracYYtyjCSwnn0xUow9VH8upaIQAqPV9hkx-ri_sI_7NiXYvc96boLmIF8m3fWaXRYrkT3MQPVStfCuA3WAY',
    });
    createdMentors['Sarah Johnson'] = reqMentorProfile._id;
    console.log(`  Required Mentor created: mentor@chooseeasy.ai / Mentor@123`);

    // Seed the required test student
    const reqStudentHashed = await bcrypt.hash('Student@123', 10);
    await User.create({ email: 'student@chooseeasy.ai', password: reqStudentHashed, name: 'Navadeep Kumar', role: 'user' });
    console.log(`  Required Student created: student@chooseeasy.ai / Student@123`);

    for (const md of MENTORS_DATA) {
      const mentorUser = await User.create({ email: md.email, password: mentorHashedPassword, name: md.name, role: 'mentor' });
      const mentorProfile = await Mentor.create({
        userId: mentorUser._id, name: md.name, bio: md.bio, subjects: md.subjects,
        domain: md.domain, matchScore: md.matchScore, status: md.status,
        availability: md.availability, hourlyRate: md.hourlyRate, image: md.image,
      });
      createdMentors[md.name] = mentorProfile._id;
      console.log(`  Mentor: ${md.email} / ${MENTOR_PASSWORD} → ${md.name}`);
    }

    // Step 4: Create Courses
    console.log('\n--- STEP 4: Creating Courses ---');
    for (const cd of COURSES_DATA) {
      const mentorIds = cd.mentorNames.map(n => createdMentors[n]).filter(Boolean);
      await Course.create({
        title: cd.title, description: cd.description, subject: cd.subject,
        price: cd.price, duration: cd.duration, level: cd.level,
        mentorIds, features: cd.features, isActive: true,
      });
      console.log(`  Course: ${cd.title} ($${cd.price})`);
    }

    // Summary
    console.log('\n=========================================');
    console.log('  DATABASE SEEDED SUCCESSFULLY!');
    console.log('=========================================');
    console.log(`\n  Admin:   admin@chooseeasy.com / ${ADMIN_PASSWORD}`);
    console.log(`  Mentors: [name]@chooseeasy.com / ${MENTOR_PASSWORD}`);
    MENTORS_DATA.forEach(m => console.log(`    - ${m.email}`));
    console.log(`  Courses: ${COURSES_DATA.length} created`);
    console.log('=========================================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

resetAndSeed();
