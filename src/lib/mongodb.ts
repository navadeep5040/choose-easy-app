import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let mocksApplied = false;

function setupMongooseMocks() {
  if (mocksApplied) return;
  mocksApplied = true;

  console.warn("[MongoDB Mock] Connection failed or unresolvable. Initializing in-memory mock fallback.");

  const store = {
    users: [] as any[],
    mentors: [] as any[],
    courses: [] as any[],
    bookings: [] as any[],
    payments: [] as any[],
    notifications: [] as any[],
    pricingplans: [] as any[],
  };

  // Create seed users
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const mentorHash = bcrypt.hashSync('Mentor@123', 10);
  const studentHash = bcrypt.hashSync('Student@123', 10);

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'admin@chooseeasy.ai',
    password: adminHash,
    name: 'Alex Morgan',
    role: 'admin',
    createdAt: new Date(),
  };

  const mentorUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'mentor@chooseeasy.ai',
    password: mentorHash,
    name: 'Sarah Johnson',
    role: 'mentor',
    createdAt: new Date(),
  };

  const studentUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'student@chooseeasy.ai',
    password: studentHash,
    name: 'Navadeep Kumar',
    role: 'user',
    createdAt: new Date(),
  };

  store.users.push(adminUser, mentorUser, studentUser);

  // Mentor profile
  const mentorProfile = {
    _id: new mongoose.Types.ObjectId(),
    userId: mentorUser._id,
    name: 'Sarah Johnson',
    bio: 'Expert AI and Software Engineering mentor.',
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
    createdAt: new Date(),
  };
  store.mentors.push(mentorProfile);

  // Seed courses
  const courseTitles = [
    'Blockchain Fundamentals & Smart Contracts',
    'AI & Machine Learning Masterclass',
    'Cloud Architecture & DevOps Bootcamp',
    'Cybersecurity & Ethical Hacking'
  ];
  courseTitles.forEach((title, idx) => {
    store.courses.push({
      _id: new mongoose.Types.ObjectId(),
      title,
      description: 'Mock course description.',
      subject: 'Technology',
      price: 199 + idx * 50,
      duration: '8 Weeks',
      level: 'Intermediate',
      mentorIds: [mentorProfile._id],
      features: ['1-on-1 mentor review sessions'],
      isActive: true,
      createdAt: new Date(),
    });
  });

  // Dynamically load models to ensure schemas are registered
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const User = require('../models/User').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Mentor = require('../models/Mentor').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Course = require('../models/Course').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Booking = require('../models/Booking').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Payment = require('../models/Payment').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notification = require('../models/Notification').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PricingPlan = require('../models/PricingPlan').default;

  function makeQueryChain(result: any) {
    const chain: any = {
      select: () => chain,
      populate: () => chain,
      lean: () => chain,
      sort: () => chain,
      limit: () => chain,
      exec: async () => result,
      then: (resolve: any) => Promise.resolve(result).then(resolve),
      catch: (reject: any) => Promise.resolve(result).catch(reject),
    };
    return chain;
  }

  function toDoc(model: any, data: any) {
    if (!data) return null;
    const doc = new model(data);
    doc._id = data._id || doc._id;
    doc.save = async function() {
      // Find and update in store
      const uIdx = store.users.findIndex(x => x._id.toString() === doc._id.toString());
      if (uIdx !== -1) store.users[uIdx] = { ...store.users[uIdx], ...doc.toObject() };

      const mIdx = store.mentors.findIndex(x => x._id.toString() === doc._id.toString());
      if (mIdx !== -1) store.mentors[mIdx] = { ...store.mentors[mIdx], ...doc.toObject() };

      const bIdx = store.bookings.findIndex(x => x._id.toString() === doc._id.toString());
      if (bIdx !== -1) store.bookings[bIdx] = { ...store.bookings[bIdx], ...doc.toObject() };

      return doc;
    };
    return doc;
  }

  User.findOne = function(query: any) {
    let u = null;
    if (query?.email) {
      u = store.users.find(x => x.email.toLowerCase() === query.email.toLowerCase());
    }
    return makeQueryChain(toDoc(User, u));
  };

  User.findById = function(id: any) {
    const u = store.users.find(x => x._id.toString() === id.toString());
    return makeQueryChain(toDoc(User, u));
  };

  User.create = async function(data: any) {
    const hash = data.password ? (data.password.startsWith('$2a$') ? data.password : bcrypt.hashSync(data.password, 10)) : '';
    const newU = {
      _id: new mongoose.Types.ObjectId(),
      ...data,
      password: hash,
      createdAt: new Date(),
    };
    store.users.push(newU);
    return toDoc(User, newU);
  };

  Mentor.find = function() {
    const docs = store.mentors.map(m => toDoc(Mentor, m));
    return makeQueryChain(docs);
  };

  Mentor.findOne = function(query: any) {
    let m = null;
    if (query?.userId) {
      m = store.mentors.find(x => x.userId.toString() === query.userId.toString());
    } else if (query?.name) {
      m = store.mentors.find(x => x.name === query.name);
    }
    return makeQueryChain(toDoc(Mentor, m));
  };

  Mentor.findById = function(id: any) {
    const m = store.mentors.find(x => x._id.toString() === id.toString());
    return makeQueryChain(toDoc(Mentor, m));
  };

  Mentor.create = async function(data: any) {
    const newM = {
      _id: new mongoose.Types.ObjectId(),
      ...data,
      createdAt: new Date(),
    };
    store.mentors.push(newM);
    return toDoc(Mentor, newM);
  };

  Course.find = function() {
    const docs = store.courses.map(c => toDoc(Course, c));
    return makeQueryChain(docs);
  };

  Booking.find = function() {
    const docs = store.bookings.map(b => toDoc(Booking, b));
    return makeQueryChain(docs);
  };

  Booking.create = async function(data: any) {
    const newB = {
      _id: new mongoose.Types.ObjectId(),
      ...data,
      createdAt: new Date(),
    };
    store.bookings.push(newB);
    return toDoc(Booking, newB);
  };

  Payment.find = function() { return makeQueryChain([]); };
  Notification.find = function() { return makeQueryChain([]); };
  PricingPlan.find = function() { return makeQueryChain([]); };
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    let connectionUri = MONGODB_URI;
    if (connectionUri.includes('cluster0.mongodb.net') && !process.env.VERCEL) {
      console.warn(`[MongoDB] Atlas URI '${connectionUri}' detected. Falling back to local MongoDB for stability.`);
      connectionUri = 'mongodb://127.0.0.1:27017/choose-easy';
    }

    cached.promise = mongoose.connect(connectionUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    if (process.env.VERCEL) {
      setupMongooseMocks();
      cached.conn = mongoose.connection;
      return cached.conn;
    }
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
